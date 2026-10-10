from demo import sample_channels, DemoEmbedder
from engine import RecommendationEngine

def test_only_requested_category_is_returned():
    results = RecommendationEngine(embedder=DemoEmbedder()).recommend(sample_channels, {
        "category":"beauty", "campaign_description":"skincare serum sunscreen beauty routines",
        "target_country":"India", "campaign_goal":"engagement", "top_n":5, "strict_category":True
    })
    assert results
    assert all(item["category"] == "beauty" for item in results)

def test_unique_and_descending_scores():
    results = RecommendationEngine(embedder=DemoEmbedder()).recommend(sample_channels, {
        "category":"beauty", "campaign_description":"skincare serum sunscreen beauty routines",
        "target_country":"India", "campaign_goal":"engagement", "top_n":5, "strict_category":True
    })
    assert len({item["channel_id"] for item in results}) == len(results)
    scores = [item["recommendation_score"] for item in results]
    assert scores == sorted(scores, reverse=True)
