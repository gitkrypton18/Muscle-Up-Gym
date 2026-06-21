-- Run this in your Supabase SQL Editor
ALTER TABLE public.community_media DROP CONSTRAINT IF EXISTS community_media_media_type_check;
ALTER TABLE public.community_media ADD CONSTRAINT community_media_media_type_check CHECK (media_type IN ('image', 'video', 'instagram'));
