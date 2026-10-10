"""Offline smoke test with five synthetic channels; no DB or model download needed."""
import numpy as np
import pandas as pd
from engine import RecommendationEngine

class DemoEmbedder:
    # A tiny topic-vector stand-in for pipeline testing only, not real semantic NLP.
    topics = {
        "beauty": {"skincare", "beauty", "makeup", "sunscreen", "serum"},
        "fitness": {"fitness", "workout", "gym", "training", "exercise"},
        "food": {"food", "recipe", "cooking", "meal", "kitchen"},
    }
    def encode(self, texts, normalize_embeddings=True, show_progress_bar=False):
        vectors = []
        for value in texts:
            words = set(str(value).lower().replace(".", " ").replace(",", " ").split())
            vector = np.array([len(words & self.topics[t]) for t in self.topics], dtype=float)
            if not vector.any(): vector = np.array([.1, .1, .1])
            if normalize_embeddings: vector = vector / np.linalg.norm(vector)
            vectors.append(vector)
        return np.vstack(vectors)

sample_channels = pd.DataFrame([
    {"channel_id":"DEMO001","title":"Skin Science India","description":"Skincare routines sunscreen and serum reviews","category":"beauty","country":"India","subscriber_count":18000,"view_count":120000,"avg_engagement_rate":.065,"tier":"micro","comment_sentiment_score":.82,"authenticity_score":.75,"channel_url":"https://youtube.com/@demo-skin-science"},
    {"channel_id":"DEMO002","title":"Everyday Makeup","description":"Beauty tutorials makeup looks and product demonstrations","category":"beauty","country":"India","subscriber_count":7500,"view_count":65000,"avg_engagement_rate":.082,"tier":"nano","comment_sentiment_score":.91,"authenticity_score":.80,"channel_url":"https://youtube.com/@demo-everyday-makeup"},
    {"channel_id":"DEMO003","title":"Power Workout","description":"Gym training fitness plans and home workout videos","category":"fitness","country":"India","subscriber_count":85000,"view_count":400000,"avg_engagement_rate":.045,"tier":"micro","comment_sentiment_score":.76,"authenticity_score":.70,"channel_url":"https://youtube.com/@demo-power-workout"},
    {"channel_id":"DEMO004","title":"Home Chef Stories","description":"Indian recipes easy meals and home cooking","category":"food","country":"India","subscriber_count":42000,"view_count":230000,"avg_engagement_rate":.052,"tier":"micro","comment_sentiment_score":.85,"authenticity_score":.77,"channel_url":"https://youtube.com/@demo-home-chef"},
    {"channel_id":"DEMO005","title":"Beauty and Lifestyle","description":"Lifestyle vlogs with occasional skincare and beauty product reviews","category":"beauty","country":"India","subscriber_count":850000,"view_count":2500000,"avg_engagement_rate":.018,"tier":"mid","comment_sentiment_score":.60,"authenticity_score":.55,"channel_url":"https://youtube.com/@demo-beauty-lifestyle"},
])

if __name__ == "__main__":
    engine = RecommendationEngine(embedder=DemoEmbedder())
    campaign = {
        "category":"beauty",
        "campaign_description":"Promote a skincare serum and sunscreen for everyday beauty routines.",
        "budget_inr":50000, "target_country":"India", "campaign_goal":"engagement",
        "top_n":5, "strict_category":True
    }
    results = engine.recommend(sample_channels, campaign)
    print("Synthetic examples only; these are not real influencers.")
    for item in results:
        print(f"{item['rank']}. {item['channel_name']} | tier={item['tier']} | score={item['recommendation_score']} | {', '.join(item['reasons'])}")
    assert results and all(item["category"] == "beauty" for item in results)
    assert len({item["channel_id"] for item in results}) == len(results)
    print(f"PASS: {len(results)} unique beauty recommendations returned.")
