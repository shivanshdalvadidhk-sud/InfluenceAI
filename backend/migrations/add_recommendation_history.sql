-- Add recommendation history table and campaign AI fields
CREATE TABLE IF NOT EXISTS public.recommendation_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign_id TEXT,
  campaign_name TEXT,
  category TEXT,
  campaign_description TEXT,
  budget_inr NUMERIC,
  target_country TEXT,
  campaign_goal TEXT,
  top_n INT DEFAULT 10,
  strict_category BOOLEAN DEFAULT TRUE,
  user_id TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on recommendation_history
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on recommendation_history" ON public.recommendation_history;
CREATE POLICY "Allow public read access on recommendation_history" ON public.recommendation_history FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow full access on recommendation_history" ON public.recommendation_history;
CREATE POLICY "Allow full access on recommendation_history" ON public.recommendation_history FOR ALL USING (true);
GRANT ALL ON public.recommendation_history TO anon, authenticated, service_role;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendation_history_campaign ON public.recommendation_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_user ON public.recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_created ON public.recommendation_history(created_at);

-- Add AI recommendation input & output columns to public.campaigns
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_country TEXT DEFAULT 'India';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS campaign_goal TEXT DEFAULT 'awareness';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS top_n INT DEFAULT 10;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS strict_category BOOLEAN DEFAULT TRUE;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS top_match TEXT;

-- Create read-only view for ml_data.channels so backend can query channels via Supabase client
CREATE OR REPLACE VIEW public.ml_channels AS
SELECT channel_id, country, description, title, channel_url, category, location_type,
       subscriber_count, view_count, avg_engagement_rate, thumbnail_url, profile_text, tier, video_count
FROM ml_data.channels;
GRANT SELECT ON public.ml_channels TO anon, authenticated, service_role;

-- Update legacy sample campaigns to use AI engine supported categories
UPDATE public.campaigns
SET name = 'Festive Fashion & Lifestyle YouTube Launch 2026',
    category = 'fashion',
    description = 'Sponsoring dedicated lookbook videos and festive outfit styling segments with Indian fashion creators.',
    target_country = 'India',
    campaign_goal = 'awareness',
    top_n = 10,
    strict_category = TRUE
WHERE id = 'b6068ab6-7fac-45ce-90ac-4bff66a56aab';

UPDATE public.campaigns
SET name = 'Glow Serum & Everyday Skincare Campaign',
    category = 'beauty',
    budget = 50000,
    description = 'Promote a gentle skincare serum for young adults in India. Prefer skincare routines, sunscreen advice, ingredient explanations and honest product reviews.',
    target_country = 'India',
    campaign_goal = 'engagement',
    top_n = 10,
    strict_category = TRUE
WHERE id = '710df46b-a45a-44d2-857c-5af6348b957c';

NOTIFY pgrst, 'reload schema';
