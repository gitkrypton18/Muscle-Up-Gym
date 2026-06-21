-- Run this in your Supabase SQL Editor
ALTER TABLE public.community_media ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' CHECK (category IN ('general', 'gym', 'trip'));
