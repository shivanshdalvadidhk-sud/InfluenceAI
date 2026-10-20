import json
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSIONS = 384

# Recommendation score weights combining semantic similarity, engagement, and audience comment sentiment.
SEMANTIC_WEIGHT = 0.50
ENGAGEMENT_WEIGHT = 0.35
SENTIMENT_WEIGHT = 0.15

# Budget-based tier eligibility rules.
# These are proposed selection policies, not verified creator fees.
BUDGET_TIER_RULES = [
    (10_000, {"nano"}),
    (50_000, {"nano", "micro"}),
    (100_000, {"nano", "micro", "mid"}),
    (float("inf"), {"nano", "micro", "mid", "macro"}),
]


def text(value):
    """Safely convert a database value to a string."""
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass

    return str(value).strip()


def number(value, default=0.0):
    """Convert a value to a finite float."""
    try:
        if value is None or pd.isna(value):
            return default

        result = float(value)

        return result if np.isfinite(result) else default

    except (TypeError, ValueError, OverflowError):
        return default


def get_eligible_tiers(budget):
    """Return the database tiers eligible for the given budget."""
    budget = number(budget, default=-1)

    if budget <= 0:
        return set()

    for budget_limit, tiers in BUDGET_TIER_RULES:
        if budget < budget_limit:
            return tiers

    return set()


def get_embedding(value):
    """
    Parse an existing PostgreSQL JSONB embedding.

    Invalid, empty, incorrectly sized, non-finite and zero vectors
    are rejected instead of causing recommendation failures.
    """
    if value is None:
        return None

    try:
        if isinstance(value, str):
            value = json.loads(value)

        vector = np.asarray(value, dtype=np.float32)

        if vector.ndim != 1:
            return None

        if vector.size != EMBEDDING_DIMENSIONS:
            return None

        if not np.isfinite(vector).all():
            return None

        if np.linalg.norm(vector) == 0:
            return None

        return vector

    except (TypeError, ValueError, json.JSONDecodeError):
        return None


def scale_engagement(values):
    """
    Scale engagement values to 0..1 for relative ranking.

    Handles common storage formats:
    0.04 means 4% when all values use fractional notation.
    4.0 means 4% when all values use percentage notation.

    Keep the database representation consistent. Mixed formats
    cannot be identified reliably from the numbers alone.
    """
    values = pd.to_numeric(
        pd.Series(values), errors="coerce"
    )

    values = values.replace(
        [np.inf, -np.inf], np.nan
    ).fillna(0).clip(lower=0)

    # Convert fractional rates to percentage units for display.
    # Scaling itself is relative, so consistent units are essential.
    if values.max() <= 1:
        values = values * 100

    low = values.quantile(0.05)
    high = values.quantile(0.95)

    if high <= low:
        score = 0.5 if values.max() > 0 else 0.0

        return pd.Series(
            score, index=values.index, dtype=float
        )

    return (
        (values.clip(lower=low, upper=high) - low)
        / (high - low)
    ).clip(0, 1)


class RecommendationEngine:

    def __init__(self, embedder=None):
        # Load the model once at API startup, not on every request.
        if embedder is None:
            from sentence_transformers import SentenceTransformer

            try:
                embedder = SentenceTransformer(
                    MODEL_NAME,
                    local_files_only=True
                )
            except Exception:
                # Download the model if it is not cached locally.
                embedder = SentenceTransformer(MODEL_NAME)

        self.embedder = embedder

        # Reuse this executor across requests.
        # The embedding task and DataFrame filtering can run together.
        self.executor = ThreadPoolExecutor(max_workers=2)

    def _filter_channels(self, channels, campaign):
        """
        Filter in the required order:
        1. Category
        2. Budget-based influencer tier eligibility
        """
        if channels is None or channels.empty:
            return pd.DataFrame()

        df = channels.copy()

        # Only columns required by this engine are necessary.
        defaults = {
            "channel_id": "",
            "title": "",
            "category": "",
            "tier": "",
            "profile_embedding": None,
            "avg_engagement_rate": np.nan,
            "subscriber_count": np.nan,
            "view_count": np.nan,
            "country": "",
            "channel_url": "",
            "thumbnail_url": "",
            "comment_sentiment_score": 0.5,
            "dominant_sentiment": "neutral",
            "positive_comment_count": 0,
            "neutral_comment_count": 0,
            "negative_comment_count": 0,
        }

        for column, default in defaults.items():
            if column not in df.columns:
                df[column] = default

        # Remove records without a usable channel ID.
        df = df[
            df["channel_id"].notna()
            & df["channel_id"].astype(str).str.strip().ne("")
        ].copy()

        if df.empty:
            return df

        # Minimum Platform Threshold: Creators with fewer than 5,000 followers are not recommended
        df["_subs_num"] = pd.to_numeric(
            df["subscriber_count"], errors="coerce"
        ).fillna(0)
        df = df[df["_subs_num"] >= 5000].drop(columns=["_subs_num"]).copy()

        if df.empty:
            return df

        # STEP 1: Filter by category.
        # Case-insensitive comparison; no fuzzy category matching.
        category = text(campaign.get("category"))

        if category:
            df = df[
                df["category"].fillna("").astype(str)
                .str.strip().str.casefold()
                .eq(category.casefold())
            ].copy()

        if df.empty:
            return df

        # STEP 2: Filter by budget.
        # Accept either supported campaign field name.
        target_country = text(campaign.get("target_country"))

        if target_country:
            country_aliases = {
                "india": "IN",
                "in": "IN",
            }

            target_code = country_aliases.get(
                target_country.casefold(),
                target_country.upper(),
            )

            df = df[
                df["country"].fillna("").astype(str)
                .str.strip().str.upper()
                .eq(target_code)
            ].copy()      
            
        # STEP 2: Filter by budget.
        budget_value = campaign.get("budget_inr")

        if budget_value is None:
            budget_value = campaign.get("budget")

        if budget_value is None:
            budget_value = campaign.get("campaign_budget")

        budget = number(budget_value, default=-1)

        # If budget is specified, filter by eligible tiers; otherwise allow all tiers
        if budget > 0:
            eligible_tiers = get_eligible_tiers(budget)
            df = df[
                df["tier"].astype(str).str.strip().str.casefold().isin(
                    {tier.casefold() for tier in eligible_tiers}
                )
            ].copy()

        return df


    def _embed_campaign(self, campaign):
        """Generate one embedding for the brand's campaign brief."""
        category = text(campaign.get("category"))
        description = text(campaign.get("campaign_description"))

        if not category and not description:
            raise ValueError(
                "Campaign category or description is required."
            )

        brief = (
            f"Category: {category}. "
            f"Campaign: {description}"
        )

        vector = self.embedder.encode(
            [brief],
            normalize_embeddings=True,
            show_progress_bar=False
        )[0]

        vector = np.asarray(vector, dtype=np.float32)

        if (
            vector.ndim != 1
            or vector.size != EMBEDDING_DIMENSIONS
            or not np.isfinite(vector).all()
            or np.linalg.norm(vector) == 0
        ):
            raise ValueError("Invalid campaign embedding.")

        return vector

    def recommend(
        self,
        channels: pd.DataFrame,
        campaign: dict
    ) -> list[dict]:

        if not isinstance(campaign, dict):
            raise ValueError("Campaign must be a dictionary.")

        if channels is None or channels.empty:
            return []

        # Start embedding generation and candidate filtering together.
        # Filtering does not need the campaign embedding.
        embedding_future = self.executor.submit(
            self._embed_campaign, campaign
        )

        filtering_future = self.executor.submit(
            self._filter_channels, channels, campaign
        )

        # Propagate errors rather than returning misleading results.
        campaign_vector = embedding_future.result()
        df = filtering_future.result()

        if df.empty:
            return []

        # Reuse stored profile embeddings; do not regenerate them.
        df["channel_vector"] = df["profile_embedding"].apply(
            get_embedding
        )

        # Remove channels without valid compatible embeddings.
        df = df[df["channel_vector"].notna()].copy()

        if df.empty:
            return []

        # One result per channel.
        df = df.drop_duplicates(
            subset=["channel_id"], keep="first"
        ).copy()

        if df.empty:
            return []

        # Stack vectors once for fast, vectorized similarity.
        channel_vectors = np.vstack(
            df["channel_vector"].tolist()
        )

        similarities = cosine_similarity(
            campaign_vector.reshape(1, -1),
            channel_vectors
        )[0]

        # Map cosine similarity from -1..1 to 0..1.
        df["semantic_similarity"] = np.clip(
            (similarities + 1.0) / 2.0,
            0.0,
            1.0
        )

        # Clean engagement values and handle missing data.
        df["engagement_rate"] = pd.to_numeric(
            df["avg_engagement_rate"],
            errors="coerce"
        ).replace(
            [np.inf, -np.inf], np.nan
        ).fillna(0).clip(lower=0)

        # Rank engagement relative to the filtered candidates.
        df["engagement_score"] = scale_engagement(
            df["engagement_rate"]
        )

        # Audience Comment Sentiment score (0..1)
        df["sentiment_score"] = pd.to_numeric(
            df["comment_sentiment_score"],
            errors="coerce"
        ).fillna(0.5).clip(lower=0.0, upper=1.0)

        # Combine content relevance, engagement, and audience comment sentiment.
        df["recommendation_score"] = (
            SEMANTIC_WEIGHT * df["semantic_similarity"]
            + ENGAGEMENT_WEIGHT * df["engagement_score"]
            + SENTIMENT_WEIGHT * df["sentiment_score"]
        )

        # Rank by overall score, then relevance, then engagement, then sentiment.
        df = df.sort_values(
            by=[
                "recommendation_score",
                "semantic_similarity",
                "engagement_score",
                "sentiment_score",
            ],
            ascending=False,
            kind="stable"
        )

        # Protect against invalid top_n values.
        try:
            top_n = int(campaign.get("top_n", 5))
        except (TypeError, ValueError, OverflowError):
            top_n = 5

        top_n = max(1, min(top_n, 100))

        results = []

        for rank, (_, row) in enumerate(
            df.head(top_n).iterrows(), start=1
        ):
            semantic = float(row["semantic_similarity"])
            engagement = float(row["engagement_score"])
            sentiment_val = float(row["sentiment_score"])
            dominant_sent = str(row.get("dominant_sentiment", "neutral")).lower()

            reasons = []

            if semantic >= 0.65:
                reasons.append("Strong campaign-content match")
            elif semantic >= 0.50:
                reasons.append("Moderate campaign-content match")

            if engagement >= 0.65:
                reasons.append("Strong relative engagement")

            if sentiment_val >= 0.60 or dominant_sent == "positive":
                reasons.append("Positive audience comment sentiment")
            elif sentiment_val < 0.40 or dominant_sent == "negative":
                reasons.append("Mixed or critical comment sentiment")

            if not reasons:
                reasons.append("Ranked by combined relevance, engagement, and audience sentiment")

            subscriber_count = number(
                row["subscriber_count"], default=-1
            )

            view_count = number(
                row["view_count"], default=-1
            )

            results.append({
                "rank": rank,
                "channel_id": text(row["channel_id"]),
                "channel_name": (
                    text(row["title"])
                    or text(row["channel_id"])
                ),
                "channel_url": text(row["channel_url"]) or None,
                "thumbnail_url": text(row["thumbnail_url"]) or None,
                "category": text(row["category"]) or None,
                "country": text(row["country"]) or None,

                # Return the stored tier without recalculating it.
                "tier": text(row["tier"]) or None,

                "subscriber_count": (
                    int(subscriber_count)
                    if subscriber_count >= 0 else None
                ),
                "view_count": (
                    int(view_count)
                    if view_count >= 0 else None
                ),
                "engagement_rate": round(
                    float(row["engagement_rate"]), 4
                ),
                "semantic_similarity": round(semantic, 4),
                "engagement_score": round(engagement, 4),
                "comment_sentiment_score": round(sentiment_val, 2),
                "dominant_sentiment": dominant_sent,
                "recommendation_score": round(
                    float(row["recommendation_score"]), 4
                ),
                "budget_fit": (
                    "not_verified - creator fee data unavailable"
                ),
                "reasons": reasons,
            })

        return results

    def close(self):
        """Shut down the executor during application shutdown."""
        self.executor.shutdown(wait=True)
