from fastapi import FastAPI, HTTPException
from schemas import CampaignRequest
from db import load_channels
from engine import RecommendationEngine

app = FastAPI(title="Influencer Recommendation API", version="0.1.0")
# Load SBERT once at application startup.
recommender = RecommendationEngine()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recommend")
def recommend(request: CampaignRequest):
    try:
        channels = load_channels()
        results = recommender.recommend(channels, request.model_dump())
        return {"campaign_category": request.category, "count": len(results), "recommendations": results}
    except Exception as exc:
        # Replace with structured server-side logging before production deployment.
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {exc}") from exc
