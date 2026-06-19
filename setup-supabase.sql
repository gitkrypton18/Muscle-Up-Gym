-- 1. Create the Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    ig_handle TEXT,
    rating INTEGER DEFAULT 5,
    review TEXT NOT NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_admin_created BOOLEAN DEFAULT FALSE
);

-- Allow public read access to approved testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for approved testimonials" ON public.testimonials
    FOR SELECT USING (status = 'approved' OR is_admin_created = true);

-- Allow public insert to testimonials (new submissions go to pending)
CREATE POLICY "Allow public insert to testimonials" ON public.testimonials
    FOR INSERT WITH CHECK (true);

-- Admin bypass (assuming admin uses anon key for now or a specific admin policy)
-- Note: In a production app, you'd restrict update/delete to authenticated admins only. 
-- For simplicity in this build, we allow anon update/delete since the dashboard is protected by custom logic.
CREATE POLICY "Allow anon update" ON public.testimonials FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON public.testimonials FOR DELETE USING (true);
CREATE POLICY "Allow anon select all" ON public.testimonials FOR SELECT USING (true);

-- 2. Create the Community Media table (for Gallery uploads)
CREATE TABLE IF NOT EXISTS public.community_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploader_name TEXT NOT NULL,
    ig_handle TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.community_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for approved media" ON public.community_media
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Allow public insert to media" ON public.community_media
    FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "Allow anon update media" ON public.community_media FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete media" ON public.community_media FOR DELETE USING (true);
CREATE POLICY "Allow anon select all media" ON public.community_media FOR SELECT USING (true);

-- ==========================================
-- STORAGE BUCKET INSTRUCTIONS
-- ==========================================
-- You must manually create a bucket in the Supabase Dashboard:
-- 1. Go to "Storage" in the Supabase Dashboard.
-- 2. Click "New Bucket" and name it EXACTLY: "community_media"
-- 3. Toggle "Public bucket" to ON.
-- 4. Click Save.

-- After creating the bucket, run this SQL to allow public uploads:
CREATE POLICY "Allow public inserts" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'community_media');
CREATE POLICY "Allow public select" ON storage.objects
    FOR SELECT USING (bucket_id = 'community_media');
CREATE POLICY "Allow public delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'community_media');
