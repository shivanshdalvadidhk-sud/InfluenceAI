-- Migration: Create registered_channels table with RLS and public view
-- Date: 2026-10-16

CREATE TABLE IF NOT EXISTS public.registered_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    youtube_channel_id text NOT NULL UNIQUE,   -- the UC... id
    contact_email text NOT NULL,
    channel_title text,
    category text,
    ingestion_status text NOT NULL DEFAULT 'pending',  -- pending|processing|done|failed
    ingestion_error text,
    show_email_publicly boolean NOT NULL DEFAULT true,
    registered_at timestamptz DEFAULT now(),
    last_synced_at timestamptz
);

-- Index on youtube_channel_id for fast joins/lookups
CREATE INDEX IF NOT EXISTS idx_registered_channels_yt_id ON public.registered_channels (youtube_channel_id);
CREATE INDEX IF NOT EXISTS idx_registered_channels_user_id ON public.registered_channels (user_id);

-- Enable Row Level Security
ALTER TABLE public.registered_channels ENABLE ROW LEVEL SECURITY;

-- Policy: Influencers can insert, select, and update only their own rows
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'registered_channels' 
        AND policyname = 'Influencers can manage own registered channels'
    ) THEN
        CREATE POLICY "Influencers can manage own registered channels"
            ON public.registered_channels
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Policy: Service role has full access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'registered_channels' 
        AND policyname = 'Service role full access on registered_channels'
    ) THEN
        CREATE POLICY "Service role full access on registered_channels"
            ON public.registered_channels
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- View: Brands (and any authenticated user) can SELECT only youtube_channel_id, channel_title, contact_email where show_email_publicly = true
CREATE OR REPLACE VIEW public.registered_channels_public WITH (security_invoker = false) AS
    SELECT 
        youtube_channel_id,
        channel_title,
        contact_email
    FROM public.registered_channels
    WHERE show_email_publicly = true;

-- Grant permissions on table and view
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registered_channels TO authenticated, service_role;
GRANT SELECT ON public.registered_channels_public TO authenticated, service_role, anon;
