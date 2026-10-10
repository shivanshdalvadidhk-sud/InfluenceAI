from pydantic import BaseModel, Field
from typing import Optional

class CampaignRequest(BaseModel):
    category: str = Field(..., min_length=2)
    campaign_description: str = Field(..., min_length=10)
    budget_inr: Optional[float] = Field(default=None, gt=0)
    target_country: Optional[str] = None
    campaign_goal: str = "awareness"
    top_n: int = Field(default=5, ge=1, le=50)
    strict_category: bool = True
