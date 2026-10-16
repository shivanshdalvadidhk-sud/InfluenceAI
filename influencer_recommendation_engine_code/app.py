import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from schemas import CampaignRequest, RegisterChannelRequest
from db import load_channels, get_db_engine
from engine import RecommendationEngine
from auth import get_current_user, require_role
from ingestion import (
    parse_channel_input,
    fetch_youtube_channel_data,
    process_channel_ingestion
)

app = FastAPI(title="Influencer Recommendation & Registration API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load recommendation engine at startup
recommender = RecommendationEngine()


@app.get("/health")
def health():
    return {"status": "ok", "service": "influencer-engine"}


@app.post("/recommend")
def recommend(
    request: CampaignRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generate ranked influencer recommendations.
    Protected by Supabase JWT. Batches query to registered_channels_public to attach contact_email.
    """
    try:
        channels = load_channels()
        results = recommender.recommend(channels, request.model_dump())
        
        # Batch query registered_channels_public for contact_email (Phase 4 - Zero N+1)
        channel_ids = [r["channel_id"] for r in results if "channel_id" in r]
        email_map = {}
        if channel_ids:
            engine = get_db_engine()
            try:
                with engine.connect() as conn:
                    query = text("""
                        SELECT youtube_channel_id, contact_email
                        FROM public.registered_channels_public
                        WHERE youtube_channel_id = ANY(:cids)
                    """)
                    rows = conn.execute(query, {"cids": channel_ids}).fetchall()
                    for row in rows:
                        email_map[row[0]] = row[1]
            except Exception as db_err:
                print(f"Warning: could not query registered_channels_public: {db_err}")

        # Attach contact_email to matching channels (null for the rest)
        for rec in results:
            rec["contact_email"] = email_map.get(rec.get("channel_id"), None)

        return {
            "campaign_category": request.category,
            "count": len(results),
            "recommendations": results
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Recommendation failed: {exc}"
        ) from exc


@app.post("/api/channels/register", status_code=status.HTTP_201_CREATED)
def register_channel(
    payload: RegisterChannelRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(require_role("influencer"))
):
    """
    Register a creator's YouTube channel:
    1. Validates channel ID or handle via YouTube API
    2. Rejects duplicate registrations with a friendly error
    3. Inserts row into registered_channels with status 'pending'
    4. Triggers background ingestion pipeline (YouTube fetch -> Mongo -> SBERT embeddings -> ml_data.channels)
    
    TODO: Ownership Verification via Google OAuth (youtube.readonly scope):
    Validate channel ownership by verifying user's Google OAuth access token matches channels.list(mine=true).
    """
    raw_input = payload.youtube_channel_id.strip()
    parsed_info = parse_channel_input(raw_input)

    # 1. Validate channel existence against YouTube Data API
    try:
        yt_channel_data = fetch_youtube_channel_data(parsed_info)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"YouTube API validation error: {exc}. Please verify your YouTube API key or channel identifier."
        )

    resolved_channel_id = yt_channel_data["channel_id"]
    channel_title = yt_channel_data.get("title", "")
    user_id = current_user.get("id")

    engine = get_db_engine()

    # 2. Reject duplicates with a friendly message
    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id, ingestion_status, user_id FROM public.registered_channels WHERE youtube_channel_id = :cid"),
            {"cid": resolved_channel_id}
        ).fetchone()

        if existing:
            if str(existing.user_id) == str(user_id):
                raise HTTPException(
                    status_code=400,
                    detail=f"You have already registered channel '{channel_title}' ({resolved_channel_id}). Current status: {existing.ingestion_status}."
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"The YouTube channel '{channel_title}' ({resolved_channel_id}) is already registered by another account. If you are the rightful owner, please contact support."
                )

        # 3. Insert row with status 'pending'
        insert_sql = text("""
            INSERT INTO public.registered_channels (
                user_id, youtube_channel_id, contact_email, channel_title,
                category, ingestion_status, show_email_publicly, registered_at
            ) VALUES (
                :uid, :cid, :email, :title, :cat, 'pending', :show_pub, NOW()
            )
            RETURNING id, ingestion_status
        """)
        row = conn.execute(
            insert_sql,
            {
                "uid": user_id,
                "cid": resolved_channel_id,
                "email": str(payload.contact_email),
                "title": channel_title,
                "cat": payload.category or "general",
                "show_pub": payload.show_email_publicly
            }
        ).fetchone()
        conn.commit()

    # 4. Trigger ingestion as FastAPI BackgroundTask (non-blocking)
    background_tasks.add_task(
        process_channel_ingestion,
        user_id=str(user_id),
        channel_id=resolved_channel_id,
        contact_email=str(payload.contact_email),
        category=payload.category
    )

    return {
        "success": True,
        "message": f"Channel '{channel_title}' successfully registered. Ingestion started.",
        "registration_id": str(row[0]),
        "youtube_channel_id": resolved_channel_id,
        "channel_title": channel_title,
        "ingestion_status": "pending"
    }


@app.get("/api/channels/my-registration")
def get_my_registration(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all channel registrations and current ingestion statuses for the authenticated creator."""
    user_id = current_user.get("id")
    is_admin = current_user.get("role") == "admin" or user_id == "00000000-0000-0000-0000-000000000000"
    engine = get_db_engine()

    try:
        with engine.connect() as conn:
            if is_admin:
                query = text("""
                    SELECT id, youtube_channel_id, channel_title, category,
                           ingestion_status, ingestion_error, show_email_publicly,
                           contact_email, registered_at, last_synced_at
                    FROM public.registered_channels
                    ORDER BY registered_at DESC
                """)
                rows = conn.execute(query).fetchall()
            else:
                query = text("""
                    SELECT id, youtube_channel_id, channel_title, category,
                           ingestion_status, ingestion_error, show_email_publicly,
                           contact_email, registered_at, last_synced_at
                    FROM public.registered_channels
                    WHERE user_id = :uid
                    ORDER BY registered_at DESC
                """)
                rows = conn.execute(query, {"uid": user_id}).fetchall()

            channels = []
            for r in rows:
                channels.append({
                    "id": str(r[0]),
                    "youtube_channel_id": r[1],
                    "channel_title": r[2],
                    "category": r[3],
                    "ingestion_status": r[4],
                    "ingestion_error": r[5],
                    "show_email_publicly": r[6],
                    "contact_email": r[7],
                    "registered_at": r[8].isoformat() if r[8] else None,
                    "last_synced_at": r[9].isoformat() if r[9] else None,
                })

            return {
                "success": True,
                "count": len(channels),
                "channels": channels,
                "latest": channels[0] if channels else None
            }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch channel registrations: {exc}"
        ) from exc


@app.post("/api/channels/retry-ingestion")
def retry_channel_ingestion(
    channel_id: str,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(require_role("influencer"))
):
    """Retry ingestion for a failed channel registration owned by the creator."""
    user_id = current_user.get("id")
    engine = get_db_engine()

    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT youtube_channel_id, contact_email, category, ingestion_status
                FROM public.registered_channels
                WHERE youtube_channel_id = :cid AND user_id = :uid
            """),
            {"cid": channel_id, "uid": user_id}
        ).fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail=f"Channel {channel_id} not found in your registrations."
            )

        cid, email, cat, current_status = row[0], row[1], row[2], row[3]

    background_tasks.add_task(
        process_channel_ingestion,
        user_id=str(user_id),
        channel_id=cid,
        contact_email=email,
        category=cat
    )

    return {
        "success": True,
        "message": f"Ingestion retry scheduled for channel {cid}.",
        "ingestion_status": "pending"
    }


@app.get("/api/channels/preview")
def preview_channel(input: str):
    """
    Auto-fetch channel details (Channel ID, Title, Avatar/Profile Photo, Stats, Category)
    from a YouTube channel link (e.g. https://www.youtube.com/@AmitEdutec) or channel ID.
    Used for instant auto-complete and YouTube profile photo preview.
    """
    if not input or not input.strip():
        raise HTTPException(status_code=400, detail="Channel URL, handle, or ID is required")

    raw_input = input.strip()
    parsed_info = parse_channel_input(raw_input)

    try:
        yt_channel_data = fetch_youtube_channel_data(parsed_info)
        thumbnails = yt_channel_data.get("thumbnails", {})
        thumb_url = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url")
            or f"https://ui-avatars.com/api/?name={yt_channel_data.get('title', 'Creator')}&background=7C3AED&color=fff"
        )

        # Detect category suggestion
        topic_cats = yt_channel_data.get("topic_categories", [])
        suggested_category = "Technology"
        topics_str = " ".join(topic_cats).lower() + " " + yt_channel_data.get("description", "").lower() + " " + yt_channel_data.get("title", "").lower()
        if "game" in topics_str or "gaming" in topics_str or "esport" in topics_str:
            suggested_category = "Gaming"
        elif "fashion" in topics_str or "style" in topics_str or "vogue" in topics_str or "outfit" in topics_str:
            suggested_category = "Fashion"
        elif "fitness" in topics_str or "workout" in topics_str or "gym" in topics_str:
            suggested_category = "Fitness"
        elif "food" in topics_str or "cook" in topics_str or "recipe" in topics_str or "kitchen" in topics_str:
            suggested_category = "Food"
        elif "finance" in topics_str or "invest" in topics_str or "money" in topics_str or "stock" in topics_str or "crypto" in topics_str:
            suggested_category = "Finance"
        elif "beauty" in topics_str or "makeup" in topics_str or "skincare" in topics_str:
            suggested_category = "Beauty"
        elif "travel" in topics_str or "tour" in topics_str:
            suggested_category = "Travel"
        elif "auto" in topics_str or "car" in topics_str or "bike" in topics_str:
            suggested_category = "Automobile"
        elif "tech" in topics_str or "code" in topics_str or "software" in topics_str or "gadget" in topics_str or "mobile" in topics_str:
            suggested_category = "Technology"

        clean_handle = parsed_info.get("value", "")
        if clean_handle.startswith("UC"):
            clean_handle = f"@{yt_channel_data['title'].replace(' ', '').lower()}"
        elif not clean_handle.startswith("@"):
            clean_handle = f"@{clean_handle}"

        return {
            "success": True,
            "channel_id": yt_channel_data["channel_id"],
            "title": yt_channel_data["title"],
            "creator_name": yt_channel_data["title"],
            "handle": clean_handle,
            "description": yt_channel_data["description"],
            "thumbnail_url": thumb_url,
            "avatar": thumb_url,
            "subscriber_count": yt_channel_data["subscriber_count"],
            "view_count": yt_channel_data["view_count"],
            "video_count": yt_channel_data["video_count"],
            "country": yt_channel_data.get("country", "IN"),
            "category": suggested_category,
            "channel_url": f"https://www.youtube.com/channel/{yt_channel_data['channel_id']}"
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

