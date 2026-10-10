
# import json
# import numpy as np
# import pandas as pd

# from sklearn.metrics.pairwise import cosine_similarity
# from config import WEIGHTS_BY_GOAL


# MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# EMBEDDING_DIMENSIONS = 384

# COUNTRY_NAME_TO_CODE = {
#     "india": "in",
#     "united states": "us",
#     "united states of america": "us",
#     "usa": "us",
#     "united kingdom": "gb",
#     "uk": "gb",
#     "great britain": "gb",
#     "canada": "ca",
#     "australia": "au",
#     "united arab emirates": "ae",
#     "uae": "ae",
#     "germany": "de",
#     "france": "fr",
#     "brazil": "br",
#     "indonesia": "id",
#     "bangladesh": "bd",
#     "pakistan": "pk",
#     "philippines": "ph",
#     "south africa": "za",
#     "mexico": "mx",
#     "italy": "it",
#     "south korea": "kr",
#     "korea": "kr",
#     "taiwan": "tw",
#     "spain": "es",
#     "russia": "ru",
#     "netherlands": "nl",
#     "thailand": "th",
#     "nigeria": "ng",
# }
# CODE_TO_COUNTRY_NAME = {v: k for k, v in COUNTRY_NAME_TO_CODE.items()}

# # Influencer classification based on subscriber count.
# # The ranges are inclusive at the lower bound and exclusive at the upper bound.

# INFLUENCER_TIERS = {
#     "nano": {
#         "min_subscribers": 0,
#         "max_subscribers": 9_999,
#         "label": "Nano Influencer"
#     },
#     "micro": {
#         "min_subscribers": 10_000,
#         "max_subscribers": 99_999,
#         "label": "Micro Influencer"
#     },
#     "mid": {
#         "min_subscribers": 100_000,
#         "max_subscribers": 999_999,
#         "label": "Mid-tier Influencer"
#     },
#     "macro": {
#         "min_subscribers": 1_000_000,
#         "max_subscribers": None,
#         "label": "Macro Influencer"
#     }
# }


# def classify_influencer(subscriber_count):
#     """
#     Classify an influencer using their subscriber count.

#     Returns the tier key, display label, and subscriber range.
#     """
#     count = number(subscriber_count, default=-1)

#     if count < 0:
#         return {
#             "tier": "unknown",
#             "tier_label": "Unknown",
#             "subscriber_range": None
#         }

#     for tier, details in INFLUENCER_TIERS.items():
#         minimum = details["min_subscribers"]
#         maximum = details["max_subscribers"]

#         if count >= minimum and (
#             maximum is None or count <= maximum
#         ):
#             if maximum is None:
#                 subscriber_range = "1,000,000+"
#             else:
#                 subscriber_range = (
#                     f"{minimum:,}-{maximum:,}"
#                 )

#             return {
#                 "tier": tier,
#                 "tier_label": details["label"],
#                 "subscriber_range": subscriber_range
#             }

#     return {
#         "tier": "unknown",
#         "tier_label": "Unknown",
#         "subscriber_range": None
#     }


# def text(value):
#     if value is None or pd.isna(value):
#         return ""
#     return str(value).strip()


# def number(value, default=0.0):
#     try:
#         if value is None or pd.isna(value):
#             return default
#         return float(value)
#     except (TypeError, ValueError):
#         return default


# def robust_scale(values):
#     values = pd.to_numeric(
#         pd.Series(values, index=getattr(values, "index", None)),
#         errors="coerce"
#     ).fillna(0).clip(lower=0)

#     low = values.quantile(0.05)
#     high = values.quantile(0.95)

#     if high <= low:
#         return pd.Series(0.5 if values.max() > 0 else 0.0, index=values.index)

#     return ((values.clip(low, high) - low) / (high - low)).clip(0, 1)


# def get_embedding(value):
#     """Convert a PostgreSQL JSONB embedding into a numeric vector."""
#     if value is None:
#         return None

#     try:
#         if isinstance(value, str):
#             value = json.loads(value)

#         vector = np.asarray(value, dtype=np.float32)

#         if vector.ndim != 1 or len(vector) == 0:
#             return None

#         if not np.isfinite(vector).all() or np.linalg.norm(vector) == 0:
#             return None

#         return vector

#     except (TypeError, ValueError, json.JSONDecodeError):
#         return None


# def get_tier(row):
#     tier = text(row.get("tier")).lower()

#     aliases = {
#         "mid-tier": "mid",
#         "mid_tier": "mid"
#     }
#     tier = aliases.get(tier, tier)

#     if tier in {"nano", "micro", "mid", "macro"}:
#         return tier

#     count = number(row.get("subscriber_count"))

#     if count < 10_000:
#         return "nano"
#     if count < 100_000:
#         return "micro"
#     if count < 1_000_000:
#         return "mid"

#     return "macro"


# def tier_fit(tier, goal):
#     preferences = {
#         "awareness": {
#             "nano": 0.45, "micro": 0.70,
#             "mid": 0.90, "macro": 1.0
#         },
#         "engagement": {
#             "nano": 1.0, "micro": 0.95,
#             "mid": 0.70, "macro": 0.50
#         },
#         "conversions": {
#             "nano": 0.85, "micro": 1.0,
#             "mid": 0.80, "macro": 0.60
#         }
#     }

#     return preferences.get(
#         goal, preferences["awareness"]
#     ).get(tier, 0.5)


# def sentiment_01(value):
#     """
#     Convert negative scores from -1..1 into 0..1.
#     Non-negative scores are assumed to already be 0..1.
#     Missing values are treated as neutral.
#     """
#     if value is None or pd.isna(value):
#         return 0.5

#     value = float(value)

#     if value < 0:
#         return float(np.clip((value + 1) / 2, 0, 1))

#     return float(np.clip(value, 0, 1))


# class RecommendationEngine:

#     def __init__(self, embedder=None):
#         # Load the model once when the API starts.
#         if embedder is None:
#             from sentence_transformers import SentenceTransformer
#             try:
#                 embedder = SentenceTransformer(MODEL_NAME, local_files_only=True)
#             except Exception:
#                 embedder = SentenceTransformer(MODEL_NAME)

#         self.embedder = embedder

#     def recommend(self, channels: pd.DataFrame, campaign: dict) -> list[dict]:
#         if channels.empty:
#             return []

#         df = channels.copy()

#         # Ensure expected columns exist.
#         defaults = {
#             "channel_id": "",
#             "country": "",
#             "description": "",
#             "title": "",
#             "channel_url": "",
#             "thumbnail_url": "",
#             "category": "",
#             "profile_text": "",
#             "profile_embedding": None,
#             "subscriber_count": np.nan,
#             "view_count": np.nan,
#             "avg_engagement_rate": np.nan,
#             "comment_sentiment_score": np.nan,
#             "authenticity_score": np.nan
#         }

#         for column, default in defaults.items():
#             if column not in df.columns:
#                 df[column] = default

#         for column in [
#             "channel_id", "country", "description",
#             "title", "channel_url", "thumbnail_url", "category", "profile_text"
#         ]:
#             df[column] = df[column].map(text)

#         for column in [
#             "subscriber_count", "view_count",
#             "avg_engagement_rate", "comment_sentiment_score",
#             "authenticity_score"
#         ]:
#             df[column] = pd.to_numeric(
#                 df[column], errors="coerce"
#             )

#         df = df[df["channel_id"].str.len() > 0].copy()
#         if df.empty:
#             return []

#         category = text(campaign.get("category")).lower()
#         country = text(campaign.get("target_country")).lower()
#         goal = text(campaign.get("campaign_goal")).lower()

#         if goal not in WEIGHTS_BY_GOAL:
#             goal = "awareness"

#         # Optional strict category filter.
#         if category and campaign.get("strict_category", True):
#             df = df[
#                 df["category"].str.lower() == category
#             ].copy()

#         if df.empty:
#             return []

#         # Target country filter with alias support (e.g. 'India' matches 'IN')
#         if country:
#             target_code = COUNTRY_NAME_TO_CODE.get(country, country)
#             target_variants = {country, target_code}
#             if target_code in CODE_TO_COUNTRY_NAME:
#                 target_variants.add(CODE_TO_COUNTRY_NAME[target_code])

#             def country_matches(val):
#                 c = text(val).lower()
#                 return c in target_variants or COUNTRY_NAME_TO_CODE.get(c, "") in target_variants

#             df = df[df["country"].apply(country_matches)].copy()

#         if df.empty:
#             return []

#         # Ensure profile text is populated
#         def resolve_profile_text(row):
#             prof = row["profile_text"]
#             if prof:
#                 return prof
#             parts = []
#             if row["title"]:
#                 parts.append(f"Channel: {row['title']}")
#             if row["category"]:
#                 parts.append(f"Category: {row['category']}")
#             if row["description"]:
#                 parts.append(f"Description: {row['description']}")
#             return ". ".join(parts) if parts else (row["title"] or row["channel_id"])

#         df["profile_text"] = df.apply(resolve_profile_text, axis=1)

#         # Parse embeddings already saved in PostgreSQL if present.
#         df["channel_vector"] = df["profile_embedding"].apply(
#             get_embedding
#         )

#         # For channels without stored embeddings (such as test/demo data), compute on the fly.
#         missing_vectors = df["channel_vector"].isna()
#         if missing_vectors.any():
#             texts_to_encode = df.loc[missing_vectors, "profile_text"].tolist()
#             if texts_to_encode:
#                 encoded = self.embedder.encode(
#                     texts_to_encode,
#                     normalize_embeddings=True,
#                     show_progress_bar=False
#                 )
#                 for idx, vec in zip(df.index[missing_vectors], encoded):
#                     df.at[idx, "channel_vector"] = np.asarray(vec, dtype=np.float32)

#         df = df[df["channel_vector"].notna()].copy()
#         if df.empty:
#             return []

#         df["tier_name"] = df.apply(get_tier, axis=1)

#         # Generate ONE embedding for this campaign brief.
#         brief = (
#             f"Category: {category}. "
#             f"Goal: {goal}. "
#             f"Campaign: {text(campaign.get('campaign_description'))}"
#         )

#         campaign_vector = self.embedder.encode(
#             [brief],
#             normalize_embeddings=True,
#             show_progress_bar=False
#         )[0]
#         campaign_vector = np.asarray(campaign_vector, dtype=np.float32)

#         dim = len(campaign_vector)
#         df = df[df["channel_vector"].apply(lambda v: len(v) == dim)].copy()
#         if df.empty:
#             return []

#         channel_vectors = np.vstack(
#             df["channel_vector"].to_list()
#         )

#         # Compare the campaign vector with stored channel vectors.
#         similarities = cosine_similarity(
#             campaign_vector.reshape(1, -1),
#             channel_vectors
#         )[0]

#         # Convert cosine similarity from -1..1 into 0..1.
#         df["semantic_score"] = np.clip(
#             (similarities + 1) / 2, 0, 1
#         )

#         # Engagement may be stored as 0.04 or 4.0.
#         df["engagement_raw"] = (
#             df["avg_engagement_rate"].fillna(0).apply(
#                 lambda x: x * 100 if 0 <= x <= 1 else x
#             )
#         )

#         df["engagement_score"] = robust_scale(
#             df["engagement_raw"]
#         )

#         safe_views = df["view_count"].fillna(0).clip(lower=0)

#         df["views_score"] = robust_scale(
#             np.log1p(safe_views)
#         )

#         df["tier_score"] = df["tier_name"].apply(
#             lambda tier: tier_fit(tier, goal)
#         )

#         df["sentiment_score"] = df[
#             "comment_sentiment_score"
#         ].apply(sentiment_01)

#         authenticity = df["authenticity_score"].apply(
#             lambda value: sentiment_01(value)
#             if pd.notna(value) else 0.5
#         )

#         df["audience_score"] = (
#             0.7 * df["sentiment_score"]
#             + 0.3 * authenticity
#         )

#         weights = WEIGHTS_BY_GOAL[goal]

#         df["recommendation_score"] = (
#             weights["semantic"] * df["semantic_score"]
#             + weights["engagement"] * df["engagement_score"]
#             + weights["sentiment"] * df["audience_score"]
#             + weights["tier"] * df["tier_score"]
#             + weights["views"] * df["views_score"]
#         )

#         df = (
#             df.sort_values(
#                 "recommendation_score", ascending=False
#             )
#             .drop_duplicates("channel_id")
#         )

#         # Maintain some diversity across creator tiers.
#         top_n = max(1, int(campaign.get("top_n", 5)))
#         max_per_tier = max(2, int(np.ceil(top_n * 0.6)))

#         chosen = []
#         counts = {}

#         for _, row in df.iterrows():
#             tier = row["tier_name"]

#             if counts.get(tier, 0) >= max_per_tier:
#                 continue

#             chosen.append(row)
#             counts[tier] = counts.get(tier, 0) + 1

#             if len(chosen) == top_n:
#                 break

#         # Backfill if the tier limit prevented enough results.
#         if len(chosen) < top_n:
#             selected_ids = {
#                 row["channel_id"] for row in chosen
#             }

#             for _, row in df.iterrows():
#                 if row["channel_id"] not in selected_ids:
#                     chosen.append(row)
#                     selected_ids.add(row["channel_id"])

#                 if len(chosen) == top_n:
#                     break

#         results = []

#         for rank, row in enumerate(chosen, start=1):
#             reasons = [f"{row['tier_name'].title()} tier"]

#             if row["semantic_score"] >= 0.65:
#                 reasons.append("strong campaign-content match")
#             elif row["semantic_score"] >= 0.50:
#                 reasons.append("moderate campaign-content match")

#             if row["engagement_score"] >= 0.65:
#                 reasons.append("strong relative engagement")

#             if row["sentiment_score"] >= 0.65:
#                 reasons.append("positive visible comment sentiment")

#             results.append({
#                 "rank": rank,
#                 "channel_id": row["channel_id"],
#                 "channel_name": row["title"] or row["channel_id"],
#                 "channel_url": row["channel_url"] or None,
#                 "thumbnail_url": row.get("thumbnail_url") or None,
#                 "category": row["category"] or None,
#                 "country": row["country"] or None,
#                 "tier": row["tier_name"],
#                 "subscriber_count": (
#                     int(row["subscriber_count"])
#                     if pd.notna(row["subscriber_count"])
#                     else None
#                 ),
#                 "engagement_rate": round(
#                     float(row["engagement_raw"]), 3
#                 ),
#                 "semantic_similarity": round(
#                     float(row["semantic_score"]), 4
#                 ),
#                 "sentiment_score": round(
#                     float(row["sentiment_score"]), 4
#                 ),
#                 "recommendation_score": round(
#                     float(row["recommendation_score"]), 4
#                 ),
#                 "budget_fit": "unknown - creator fee data unavailable",
#                 "reasons": reasons
#             })

#         return results



import json
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSIONS = 384

# Recommendation score weights. Tune using real campaign outcomes.
SEMANTIC_WEIGHT = 0.70
ENGAGEMENT_WEIGHT = 0.30

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

        # Missing, invalid, zero or negative budgets return no results.
        if budget <= 0:
            return df.iloc[0:0].copy()

        eligible_tiers = get_eligible_tiers(budget)

        # Match existing database tier values.
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

        # Combine content relevance and engagement.
        df["recommendation_score"] = (
            SEMANTIC_WEIGHT * df["semantic_similarity"]
            + ENGAGEMENT_WEIGHT * df["engagement_score"]
        )

        # Rank by overall score, then relevance, then engagement.
        df = df.sort_values(
            by=[
                "recommendation_score",
                "semantic_similarity",
                "engagement_score",
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

            reasons = []

            if semantic >= 0.65:
                reasons.append("Strong campaign-content match")
            elif semantic >= 0.50:
                reasons.append("Moderate campaign-content match")

            if engagement >= 0.65:
                reasons.append("Strong relative engagement")

            if not reasons:
                reasons.append("Ranked by combined relevance and engagement")

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
