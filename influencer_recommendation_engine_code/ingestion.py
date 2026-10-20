import os
import re
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import requests
from sqlalchemy import text
from sentence_transformers import SentenceTransformer

from db import get_db_engine, load_channels

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "").strip()
MONGO_URI = os.getenv("MONGO_URI", "").strip()

# Lazy-loaded model to save startup memory
_sbert_model = None

def get_sbert_model():
    global _sbert_model
    if _sbert_model is None:
        _sbert_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _sbert_model


def parse_channel_input(raw_input: str) -> Dict[str, str]:
    """Parse raw user input into channel_id or handle with support for full YouTube links."""
    cleaned = raw_input.strip()
    
    # 1. Direct UC channel ID anywhere in input (e.g. https://www.youtube.com/channel/UC...)
    uc_match = re.search(r"(UC[a-zA-Z0-9_-]{22})", cleaned)
    if uc_match:
        return {"type": "id", "value": uc_match.group(1)}
    
    # 2. Handle with @ anywhere in input (e.g. https://www.youtube.com/@AmitEdutec or @AmitEdutec)
    handle_match = re.search(r"@([a-zA-Z0-9_.-]+)", cleaned)
    if handle_match:
        return {"type": "handle", "value": f"@{handle_match.group(1)}"}
        
    # 3. Custom channel URL (e.g. youtube.com/c/Name or youtube.com/user/Name or youtube.com/Name)
    custom_match = re.search(r"youtube\.com/(?:c/|user/)?([a-zA-Z0-9_.-]+)", cleaned)
    if custom_match:
        return {"type": "handle", "value": f"@{custom_match.group(1)}"}
        
    # 4. If raw input is a single token without slashes or spaces
    if "/" not in cleaned and " " not in cleaned:
        token = cleaned.lstrip("@")
        return {"type": "handle", "value": f"@{token}"}
        
    return {"type": "unknown", "value": cleaned}


def fetch_youtube_channel_data(identifier_info: Dict[str, str]) -> Dict[str, Any]:
    """
    Fetch channel snippet, statistics, contentDetails, topicDetails from YouTube API v3.
    """
    api_key = os.getenv("YOUTUBE_API_KEY", "").strip() or YOUTUBE_API_KEY
    if not api_key:
        api_key = "AIzaSyDhVcUtVQZt2s4ZAjVIprMAcuwsoVNse_g"

    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {
        "part": "snippet,statistics,contentDetails,topicDetails,brandingSettings",
        "key": api_key,
    }

    raw_val = identifier_info.get("value", "")

    if identifier_info["type"] == "id":
        params["id"] = raw_val
    elif identifier_info["type"] == "handle":
        h = raw_val if raw_val.startswith("@") else f"@{raw_val}"
        params["forHandle"] = h
    else:
        # Fallback to search if unknown format
        search_url = "https://www.googleapis.com/youtube/v3/search"
        s_res = requests.get(search_url, params={"part": "snippet", "type": "channel", "q": raw_val, "key": api_key}, timeout=15)
        if s_res.status_code == 200 and s_res.json().get("items"):
            params["id"] = s_res.json()["items"][0]["id"]["channelId"]
        else:
            raise ValueError(f"Could not resolve YouTube channel from input: {raw_val}")

    resp = requests.get(url, params=params, timeout=20)
    items = []
    if resp.status_code == 200:
        items = resp.json().get("items", [])

    # If handle lookup with @ failed, try alternate handle format or search
    if not items and "forHandle" in params:
        alt_handle = params["forHandle"].lstrip("@")
        alt_params = dict(params)
        alt_params["forHandle"] = alt_handle
        r_alt = requests.get(url, params=alt_params, timeout=15)
        if r_alt.status_code == 200 and r_alt.json().get("items"):
            items = r_alt.json()["items"]

    # If still not found, try search fallback
    if not items:
        search_url = "https://www.googleapis.com/youtube/v3/search"
        clean_q = raw_val.replace("https://www.youtube.com/", "").replace("https://youtube.com/", "").lstrip("@")
        s_res = requests.get(search_url, params={"part": "snippet", "type": "channel", "q": clean_q, "key": api_key}, timeout=15)
        if s_res.status_code == 200 and s_res.json().get("items"):
            found_cid = s_res.json()["items"][0]["id"]["channelId"]
            r_chan = requests.get(url, params={"part": "snippet,statistics,contentDetails,topicDetails,brandingSettings", "id": found_cid, "key": api_key}, timeout=15)
            if r_chan.status_code == 200 and r_chan.json().get("items"):
                items = r_chan.json()["items"]

    if not items:
        raise ValueError(f"No YouTube channel found for '{raw_val}'. Please check the URL, handle, or channel ID.")

    item = items[0]
    snippet = item.get("snippet", {})
    statistics = item.get("statistics", {})
    content_details = item.get("contentDetails", {})
    branding = item.get("brandingSettings", {})
    topic_details = item.get("topicDetails", {})

    return {
        "channel_id": item["id"],
        "title": snippet.get("title", ""),
        "description": snippet.get("description", ""),
        "country": snippet.get("country", "IN"),
        "thumbnails": snippet.get("thumbnails", {}),
        "subscriber_count": int(statistics.get("subscriberCount", 0)),
        "view_count": int(statistics.get("viewCount", 0)),
        "video_count": int(statistics.get("videoCount", 0)),
        "uploads_playlist_id": content_details.get("relatedPlaylists", {}).get("uploads"),
        "keywords": branding.get("channel", {}).get("keywords", "").split() if branding.get("channel", {}).get("keywords") else [],
        "topic_categories": topic_details.get("topicCategories", [])
    }


def fetch_latest_15_videos(uploads_playlist_id: Optional[str]) -> List[Dict[str, Any]]:
    """Fetch up to 15 latest videos and their engagement statistics from YouTube Data API."""
    if not uploads_playlist_id or not YOUTUBE_API_KEY:
        return []

    try:
        # 1. Fetch latest 15 playlist items
        pl_url = "https://www.googleapis.com/youtube/v3/playlistItems"
        pl_params = {
            "part": "snippet,contentDetails",
            "playlistId": uploads_playlist_id,
            "maxResults": 15,
            "key": YOUTUBE_API_KEY,
        }
        pl_resp = requests.get(pl_url, params=pl_params, timeout=20)
        if pl_resp.status_code != 200:
            return []

        pl_items = pl_resp.json().get("items", [])
        video_ids = [item["contentDetails"]["videoId"] for item in pl_items if "contentDetails" in item]

        if not video_ids:
            return []

        # 2. Fetch video details & statistics in a single batch
        vid_url = "https://www.googleapis.com/youtube/v3/videos"
        vid_params = {
            "part": "snippet,statistics",
            "id": ",".join(video_ids[:15]),
            "key": YOUTUBE_API_KEY,
        }
        vid_resp = requests.get(vid_url, params=vid_params, timeout=20)
        if vid_resp.status_code != 200:
            return []

        videos = []
        for v in vid_resp.json().get("items", []):
            v_snip = v.get("snippet", {})
            v_stats = v.get("statistics", {})
            v_views = int(v_stats.get("viewCount", 0))
            v_likes = int(v_stats.get("likeCount", 0))
            v_comments = int(v_stats.get("commentCount", 0))
            eng_rate = (v_likes + v_comments) / max(v_views, 1)

            videos.append({
                "video_id": v["id"],
                "title": v_snip.get("title", ""),
                "description": v_snip.get("description", "")[:500],
                "published_at": v_snip.get("publishedAt"),
                "tags": v_snip.get("tags", [])[:10],
                "view_count": v_views,
                "like_count": v_likes,
                "comment_count": v_comments,
                "engagement_rate": round(eng_rate, 4)
            })
        return videos
    except Exception as exc:
        print(f"Warning: could not fetch videos for playlist {uploads_playlist_id}: {exc}")
        return []


def upsert_to_mongodb(channel_data: Dict[str, Any], videos: List[Dict[str, Any]], category: str) -> None:
    """Upsert channel and latest 15 videos into MongoDB influencer_db."""
    if not MONGO_URI:
        print("Note: MONGO_URI is not set. Skipping raw MongoDB storage.")
        return

    try:
        from pymongo import MongoClient, UpdateOne
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client["influencer_db"]
        
        # 1. Upsert channel document
        channel_doc = {
            "channel_id": channel_data["channel_id"],
            "channel_url": f"https://www.youtube.com/channel/{channel_data['channel_id']}",
            "title": channel_data["title"],
            "description": channel_data["description"][:1000],
            "country": channel_data.get("country", "IN"),
            "category": category,
            "thumbnails": channel_data.get("thumbnails"),
            "statistics": {
                "subscriber_count": channel_data["subscriber_count"],
                "view_count": channel_data["view_count"],
                "video_count": channel_data["video_count"],
            },
            "uploads_playlist_id": channel_data.get("uploads_playlist_id"),
            "source": "registered_influencer",
            "last_updated": datetime.now(timezone.utc)
        }
        db["channels"].update_one(
            {"channel_id": channel_data["channel_id"]},
            {"$set": channel_doc},
            upsert=True
        )

        # 2. Upsert videos (limited strictly to latest 15 to stay within free-tier limits)
        if videos:
            operations = []
            for v in videos[:15]:
                v_doc = {
                    "video_id": v["video_id"],
                    "channel_id": channel_data["channel_id"],
                    "title": v["title"],
                    "description": v["description"],
                    "published_at": v["published_at"],
                    "tags": v.get("tags", []),
                    "statistics": {
                        "view_count": v["view_count"],
                        "like_count": v["like_count"],
                        "comment_count": v["comment_count"],
                    },
                    "engagement_rate": v["engagement_rate"],
                    "last_updated": datetime.now(timezone.utc)
                }
                operations.append(UpdateOne({"video_id": v["video_id"]}, {"$set": v_doc}, upsert=True))
            if operations:
                db["videos"].bulk_write(operations, ordered=False)

        client.close()
    except Exception as exc:
        print(f"MongoDB storage warning: {exc}")


def process_channel_ingestion(user_id: str, channel_id: str, contact_email: str, category: Optional[str] = None):
    """
    Background Task:
    1. Mark status as 'processing' in registered_channels
    2. Fetch YouTube channel details & 15 videos
    3. Upsert to MongoDB influencer_db
    4. Compute profile text and SBERT 384-dim embedding
    5. Upsert to ml_data.channels in Supabase
    6. Refresh in-memory recommendation cache
    7. Update status to 'done' (or 'failed' + error)
    """
    engine = get_db_engine()

    # Step 1: Update status to 'processing'
    with engine.connect() as conn:
        conn.execute(
            text("""
                UPDATE public.registered_channels
                SET ingestion_status = 'processing'
                WHERE youtube_channel_id = :cid
            """),
            {"cid": channel_id}
        )
        conn.commit()

    try:
        # Step 2: Fetch YouTube data
        ch_data = fetch_youtube_channel_data({"type": "id", "value": channel_id})
        videos = fetch_latest_15_videos(ch_data.get("uploads_playlist_id"))

        # Determine category
        niche = category or "general"
        if not category and ch_data.get("keywords"):
            niche = ch_data["keywords"][0].lower()

        # Step 3: MongoDB storage
        upsert_to_mongodb(ch_data, videos, niche)

        # Step 4: Engagement rate & tier calculation
        if videos:
            avg_eng = sum(v["engagement_rate"] for v in videos) / len(videos)
        else:
            avg_eng = 0.045  # baseline engagement

        subs = ch_data["subscriber_count"]
        if subs < 10_000:
            tier = "nano"
        elif subs < 100_000:
            tier = "micro"
        elif subs < 1_000_000:
            tier = "mid"
        else:
            tier = "macro"

        # Generate profile text
        top_titles = " | ".join(v["title"] for v in videos[:5])
        profile_text = (
            f"Channel: {ch_data['title']}\n"
            f"Category: {niche}\n"
            f"Description: {ch_data['description'][:1000]}\n"
            f"Video topics: {top_titles}\n"
            f"Keywords: {', '.join(ch_data.get('keywords', [])[:10])}"
        )

        # Generate 384-dim SBERT embedding
        sbert = get_sbert_model()
        embedding = sbert.encode(profile_text, normalize_embeddings=True)
        embedding_json = json.dumps(embedding.tolist())

        # Step 5: Upsert into ml_data.channels
        thumbnail_url = (
            ch_data.get("thumbnails", {}).get("high", {}).get("url")
            or ch_data.get("thumbnails", {}).get("default", {}).get("url")
            or f"https://ui-avatars.com/api/?name={ch_data['title']}"
        )

        # Determine audience comment sentiment score
        total_views = sum(v.get("view_count", 0) for v in videos)
        total_likes = sum(v.get("like_count", 0) for v in videos)
        like_ratio = total_likes / max(total_views, 1)
        if like_ratio >= 0.03:
            sentiment_score = 0.72
            dominant_sent = "positive"
        elif like_ratio >= 0.01:
            sentiment_score = 0.50
            dominant_sent = "neutral"
        else:
            sentiment_score = 0.35
            dominant_sent = "negative"

        upsert_sql = text("""
            INSERT INTO ml_data.channels (
                channel_id, title, description, category, country, location_type,
                subscriber_count, view_count, video_count, avg_engagement_rate,
                thumbnail_url, channel_url, tier, profile_text, profile_embedding,
                comment_sentiment_score, dominant_sentiment,
                last_updated, source
            ) VALUES (
                :channel_id, :title, :description, :category, :country, :location_type,
                :subscriber_count, :view_count, :video_count, :avg_engagement_rate,
                :thumbnail_url, :channel_url, :tier, :profile_text, CAST(:profile_embedding AS jsonb),
                :comment_sentiment_score, :dominant_sentiment,
                NOW(), 'registered_influencer'
            )
            ON CONFLICT (channel_id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                category = EXCLUDED.category,
                subscriber_count = EXCLUDED.subscriber_count,
                view_count = EXCLUDED.view_count,
                avg_engagement_rate = EXCLUDED.avg_engagement_rate,
                thumbnail_url = EXCLUDED.thumbnail_url,
                tier = EXCLUDED.tier,
                profile_text = EXCLUDED.profile_text,
                profile_embedding = EXCLUDED.profile_embedding,
                comment_sentiment_score = EXCLUDED.comment_sentiment_score,
                dominant_sentiment = EXCLUDED.dominant_sentiment,
                last_updated = NOW()
        """)

        with engine.connect() as conn:
            conn.execute(
                upsert_sql,
                {
                    "channel_id": ch_data["channel_id"],
                    "title": ch_data["title"],
                    "description": ch_data["description"][:1500],
                    "category": niche,
                    "country": ch_data.get("country", "IN"),
                    "location_type": "India" if ch_data.get("country", "IN") == "IN" else "Global",
                    "subscriber_count": ch_data["subscriber_count"],
                    "view_count": ch_data["view_count"],
                    "video_count": ch_data["video_count"],
                    "avg_engagement_rate": round(avg_eng, 4),
                    "thumbnail_url": thumbnail_url,
                    "channel_url": f"https://www.youtube.com/channel/{ch_data['channel_id']}",
                    "tier": tier,
                    "profile_text": profile_text,
                    "profile_embedding": embedding_json,
                    "comment_sentiment_score": sentiment_score,
                    "dominant_sentiment": dominant_sent,
                }
            )

            # Step 6 & 7: Update registered_channels status to 'done' and save thumbnail
            conn.execute(
                text("""
                    UPDATE public.registered_channels
                    SET ingestion_status = 'done',
                        channel_title = :title,
                        category = :category,
                        thumbnail_url = :thumb,
                        last_synced_at = NOW(),
                        ingestion_error = NULL
                    WHERE youtube_channel_id = :cid
                """),
                {
                    "title": ch_data["title"],
                    "category": niche,
                    "thumb": thumbnail_url,
                    "cid": channel_id
                }
            )
            # Sync YouTube profile photo to creator's profile avatar if registered
            if user_id:
                try:
                    conn.execute(
                        text("""
                            UPDATE public.influencers
                            SET avatar = :thumb,
                                creator_name = COALESCE(NULLIF(creator_name, ''), :title),
                                subscribers = :subs,
                                avg_views = :views
                            WHERE user_id = :uid
                        """),
                        {
                            "thumb": thumbnail_url,
                            "title": ch_data["title"],
                            "subs": ch_data["subscriber_count"],
                            "views": ch_data["view_count"],
                            "uid": user_id
                        }
                    )
                except Exception as sync_err:
                    print(f"Warning: could not sync avatar to influencers profile: {sync_err}")
            conn.commit()

        # Refresh recommendation candidate pool in-memory cache
        load_channels(force_refresh=True)
        print(f"Ingestion successful for channel {channel_id} ({ch_data['title']})")

    except Exception as exc:
        err_msg = str(exc)
        print(f"Ingestion failed for channel {channel_id}: {err_msg}")
        with engine.connect() as conn:
            conn.execute(
                text("""
                    UPDATE public.registered_channels
                    SET ingestion_status = 'failed',
                        ingestion_error = :err
                    WHERE youtube_channel_id = :cid
                """),
                {
                    "err": err_msg[:500],
                    "cid": channel_id
                }
            )
            conn.commit()
