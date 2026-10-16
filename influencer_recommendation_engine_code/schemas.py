from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class CampaignRequest(BaseModel):
    category: str = Field(..., min_length=2)
    campaign_description: str = Field(..., min_length=10)
    budget_inr: Optional[float] = Field(default=None, gt=0)
    target_country: Optional[str] = None
    campaign_goal: str = "awareness"
    top_n: int = Field(default=5, ge=1, le=50)
    strict_category: bool = True

class RegisterChannelRequest(BaseModel):
    youtube_channel_id: str = Field(..., min_length=2, description="YouTube channel ID, handle, or channel URL")
    contact_email: EmailStr = Field(..., description="Contact email for brand collaborations")
    category: Optional[str] = Field(default=None, description="Primary content category/niche")
    show_email_publicly: bool = Field(default=True, description="Consent to display contact email publicly to brands")
