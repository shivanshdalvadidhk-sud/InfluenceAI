from db import load_channels
from engine import RecommendationEngine

campaign = {
    "category": "beauty",
    "campaign_description": "Promote a gentle skincare serum for young adults in India. Prefer skincare routines, sunscreen advice, ingredient explanations and honest product reviews.",
    "budget_inr": 50000,
    "target_country": "India",
    "campaign_goal": "engagement",
    "top_n": 5,
    "strict_category": True,
}

if __name__ == "__main__":
    channels = load_channels()
    print(f"Loaded {len(channels)} channels")
    results = RecommendationEngine().recommend(channels, campaign)
    for result in results:
        print(result)
