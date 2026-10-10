import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# Starting weights, not proven optimal values. Tune using real campaign outcomes.
WEIGHTS_BY_GOAL = {
    "awareness": {"semantic": .40, "engagement": .15, "sentiment": .10, "tier": .10, "views": .25},
    "engagement": {"semantic": .40, "engagement": .25, "sentiment": .15, "tier": .10, "views": .10},
    "conversions": {"semantic": .40, "engagement": .20, "sentiment": .15, "tier": .10, "views": .15},
}
