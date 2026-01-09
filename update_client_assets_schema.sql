-- 1. Enable UUID extension (try/catch style not fully supported in simple SQL, so we use IF NOT EXISTS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create client_assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.client_assets (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_type text,
    file_size integer,
    uploaded_at timestamptz DEFAULT now(),
    uploaded_by uuid REFERENCES auth.users(id)
);

-- 3. Enable RLS on Table
ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;

-- 4. Table Policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.client_assets;
CREATE POLICY "Enable read access for authenticated users" ON public.client_assets
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.client_assets;
CREATE POLICY "Enable insert access for authenticated users" ON public.client_assets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.client_assets;
CREATE POLICY "Enable delete access for authenticated users" ON public.client_assets
    FOR DELETE USING (auth.role() = 'authenticated');


-- 5. STORAGE BUCKET SETUP (CRITICAL FOR UPLOADS)
-- Attempt to insert the bucket configuration. If it exists, this might fail, which is fine in some environments,
-- but for Supabase SQL Editor, it's safer to just set up policies.
-- Note: You usually create buckets in the dashboard, but we can try to force policies.

-- 5. STORAGE BUCKET SETUP (CRITICAL FOR UPLOADS)

-- Attempt to insert the bucket configuration.
-- We use ON CONFLICT DO NOTHING to avoid errors if it already exists.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clients', 'clients', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- STORAGE POLICIES
-- We need to enable RLS on storage.objects usually, but let's strictly define policies for the 'clients' bucket.

-- 5a. SELECT (View/Download)
DROP POLICY IF EXISTS "Give public access to clients bucket" ON storage.objects;
CREATE POLICY "Give public access to clients bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'clients' AND auth.role() = 'authenticated');

-- 5b. INSERT (Upload)
DROP POLICY IF EXISTS "Allow authenticated uploads to clients bucket" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to clients bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'clients' AND auth.role() = 'authenticated');

-- 5c. DELETE (Remove assets)
DROP POLICY IF EXISTS "Allow authenticated deletes in clients bucket" ON storage.objects;
CREATE POLICY "Allow authenticated deletes in clients bucket" ON storage.objects
    FOR DELETE USING (bucket_id = 'clients' AND auth.role() = 'authenticated');
