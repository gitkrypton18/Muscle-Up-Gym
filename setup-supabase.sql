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
CREATE POLICY "Allow auth update" ON public.testimonials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete" ON public.testimonials FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth select all" ON public.testimonials FOR SELECT USING (auth.role() = 'authenticated');

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

CREATE POLICY "Allow auth update media" ON public.community_media FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete media" ON public.community_media FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth select all media" ON public.community_media FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Create the Leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'called', 'converted', 'not_interested'))
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for Enquiry Form submissions)
CREATE POLICY "Allow public insert to leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Allow select/update/delete for the app (matches the testimonial bypass policies)
CREATE POLICY "Allow auth select leads" ON public.leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update leads" ON public.leads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete leads" ON public.leads FOR DELETE USING (auth.role() = 'authenticated');

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


