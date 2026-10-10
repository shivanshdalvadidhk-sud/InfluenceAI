
import time
from functools import lru_cache

import pandas as pd
from sqlalchemy import create_engine, inspect, text

from config import DATABASE_URL


# Cache channel data for 10 minutes.
_cached_channels = None
_cached_time = 0.0


@lru_cache(maxsize=1)
def get_db_engine():
    """Create and reuse the PostgreSQL engine."""
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is missing. Set it in your environment or .env."
        )

    return create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={
            "sslmode": "require",
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
    )


def load_channels(
    force_refresh: bool = False,
    ttl_seconds: int = 600,
) -> pd.DataFrame:
    """Load channel data, reusing the cache when it is still valid."""
    global _cached_channels, _cached_time

    now = time.time()

    if (
        not force_refresh
        and _cached_channels is not None
        and now - _cached_time < ttl_seconds
    ):
        return _cached_channels.copy()

    engine = get_db_engine()

    # Check which columns actually exist in the database.
    inspector = inspect(engine)
    existing_columns = {
        column["name"]
        for column in inspector.get_columns(
            "channels",
            schema="ml_data",
        )
    }

    required_columns = [
        "channel_id",
        "country",
        "description",
        "title",
        "channel_url",
        "category",
        "location_type",
        "subscriber_count",
        "view_count",
        "avg_engagement_rate",
        "thumbnail_url",
        "profile_text",
        "profile_embedding",
    ]

    # Select tier only when the database contains that column.
    if "tier" in existing_columns:
        required_columns.append("tier")

    # Avoid SQL errors if an optional field is absent.
    optional_columns = [
        "video_count",
    ]

    selected_columns = [
        column
        for column in required_columns + optional_columns
        if column in existing_columns
    ]

    if "channel_id" not in selected_columns:
        raise RuntimeError(
            "The ml_data.channels table does not contain channel_id."
        )

    columns_sql = ", ".join(
        f'"{column}"' for column in selected_columns
    )

    query = text(
        f"SELECT {columns_sql} FROM ml_data.channels"
    )

    last_exc = None

    for attempt in range(2):
        try:
            with engine.connect() as connection:
                df = pd.read_sql(query, connection)

            # Supply missing optional columns expected by the engine.
            defaults = {
                "country": None,
                "description": "",
                "title": "",
                "channel_url": "",
                "category": "",
                "tier": "",
                "location_type": "",
                "subscriber_count": None,
                "view_count": None,
                "video_count": None,
                "avg_engagement_rate": None,
                "thumbnail_url": "",
                "profile_text": "",
                "profile_embedding": None,
            }

            for column, default in defaults.items():
                if column not in df.columns:
                    df[column] = default

            _cached_channels = df.copy()
            _cached_time = time.time()

            print(f"Channels loaded: {len(df)}")
            print(f"Tier column available: {'tier' in existing_columns}")
            print(
                "Channels with stored embeddings:",
                int(df["profile_embedding"].notna().sum()),
            )

            return df.copy()

        except Exception as exc:
            last_exc = exc

            if attempt == 0:
                time.sleep(1)

    raise RuntimeError(
        f"Failed to load channels from PostgreSQL: {last_exc}"
    ) from last_exc
