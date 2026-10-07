-- ==============================================================================
-- INFLUENCEAI: INFLUENCER SIDE SUPABASE DATABASE SCHEMA MIGRATION
-- Copy and run this script directly in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mshlqqsvhdqixoosqbsc/sql/new
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Shared between Brands & Influencers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  account_type TEXT NOT NULL CHECK (account_type IN ('brand', 'influencer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update on profiles" ON public.profiles FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 2. INFLUENCERS TABLE (Main Creator Database with Email)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.influencers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  youtube_handle TEXT NOT NULL,
  content_niche_category TEXT NOT NULL,
  state_ut TEXT NOT NULL,
  bio TEXT,
  primary_platform TEXT DEFAULT 'YouTube',
  subscribers BIGINT DEFAULT 50000,
  avg_views BIGINT DEFAULT 15000,
  engagement_rate NUMERIC(4, 2) DEFAULT 4.80,
  graph_score INT DEFAULT 85,
  estimated_cost NUMERIC(10, 2) DEFAULT 95000.00,
  avatar TEXT,
  terms_accepted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email column if table already exists without it
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS email TEXT;

-- Enable RLS on influencers
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on influencers" ON public.influencers FOR SELECT USING (true);
CREATE POLICY "Allow full access on influencers" ON public.influencers FOR ALL USING (true);

-- Indexes for performance filtering
CREATE INDEX IF NOT EXISTS idx_influencers_category ON public.influencers(content_niche_category);
CREATE INDEX IF NOT EXISTS idx_influencers_user_id ON public.influencers(user_id);
CREATE INDEX IF NOT EXISTS idx_influencers_email ON public.influencers(email);

-- ------------------------------------------------------------------------------
-- 3. BRANDS TABLE (Main Company Database with Email)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brands (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  company_name TEXT NOT NULL,
  brand_name TEXT,
  industry_category TEXT DEFAULT 'General',
  brand_website TEXT,
  headquarters_city TEXT NOT NULL,
  state_ut TEXT NOT NULL,
  terms_accepted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email column if table already exists without it
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS email TEXT;

-- Enable RLS on brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on brands" ON public.brands FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 4. INQUIRIES TABLE (Sponsorship Requests sent to Creators)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id TEXT NOT NULL,
  campaign_id TEXT,
  campaign_name TEXT,
  company_name TEXT,
  message TEXT,
  bid_amount NUMERIC(10, 2),
  deliverables JSONB DEFAULT '["60s Video Integration", "Instagram Story Cross-post"]'::jsonb,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Interested', 'Declined', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on inquiries" ON public.inquiries FOR ALL USING (true);

-- Index on inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_influencer_id ON public.inquiries(influencer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_company_id ON public.inquiries(company_id);

-- ------------------------------------------------------------------------------
-- 5. SAVED INFLUENCERS TABLE (Brand Creator Bookmarks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, influencer_id)
);

-- Enable RLS on saved_influencers
ALTER TABLE public.saved_influencers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on saved_influencers" ON public.saved_influencers FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 6. SAVED OPPORTUNITIES TABLE (Influencer Saved Campaigns)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(influencer_user_id, campaign_id)
);

-- Enable RLS on saved_opportunities
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on saved_opportunities" ON public.saved_opportunities FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 7. INITIAL SEED DATA FOR INFLUENCER SIDE
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (id, account_type) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'brand'),
  ('a0000000-0000-0000-0000-000000000002', 'influencer')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.influencers (user_id, email, full_name, creator_name, youtube_handle, content_niche_category, state_ut, bio, primary_platform, subscribers, avg_views, engagement_rate, graph_score, estimated_cost, avatar) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'rohan.mehta@gmail.com', 'Rohan Mehta', 'Rohan Mehta', '@techwithrohan', 'Technology', 'Karnataka', 'Deep-dive smartphone reviews, AI gadgets & PC builds.', 'YouTube', 1850000, 420000, 4.80, 92, 184800.00, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
  ('a0000000-0000-0000-0000-000000000002', 'vikram.fit@gmail.com', 'Vikramaditya Roy', 'Vikramaditya Roy', '@fit_vikram_yt', 'Fitness', 'Delhi', 'Home workout programs, diet nutrition guides & sports science.', 'YouTube', 680000, 190000, 5.20, 91, 95000.00, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON CONFLICT DO NOTHING;
