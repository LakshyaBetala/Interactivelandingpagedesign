-- Run this script in the Supabase SQL Editor to perfectly sync the database schema!

-- 1. Convert Enum columns to TEXT to prevent rigid enum errors
ALTER TABLE IF EXISTS public.clients ALTER COLUMN stage TYPE TEXT USING stage::TEXT;
ALTER TABLE IF EXISTS public.clients ALTER COLUMN category TYPE TEXT USING category::TEXT;
ALTER TABLE IF EXISTS public.outreach_leads ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE IF EXISTS public.outreach_leads ALTER COLUMN source TYPE TEXT USING source::TEXT;
ALTER TABLE IF EXISTS public.internal_tasks ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE IF EXISTS public.project_flags ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE IF EXISTS public.project_flags ALTER COLUMN priority TYPE TEXT USING priority::TEXT;
ALTER TABLE IF EXISTS public.social_media ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE IF EXISTS public.internal_products ALTER COLUMN stage TYPE TEXT USING stage::TEXT;
ALTER TABLE IF EXISTS public.releases ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- 2. Add any missing columns for Clients
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS amount_paid bigint DEFAULT 0;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS margin bigint DEFAULT 0;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS last_activity text;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);

-- 3. Add any missing columns for Outreach Leads
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS engagement_score bigint DEFAULT 10;
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS sourced_by_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS estimated_value bigint DEFAULT 0;

-- 4. Add any missing columns for Project Flags
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS sprint_logs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- 5. Add any missing columns for Comments
ALTER TABLE IF EXISTS public.comments ADD COLUMN IF NOT EXISTS time_elapsed text;
ALTER TABLE IF EXISTS public.comments ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- 6. Add any missing columns for Releases
ALTER TABLE IF EXISTS public.releases ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE IF EXISTS public.releases ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- 7. Add any missing columns for Activities
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS client text;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS time text;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS type text;

-- 8. Add any missing columns for Social Media
ALTER TABLE IF EXISTS public.social_media ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.social_media ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE IF EXISTS public.social_media ADD COLUMN IF NOT EXISTS scheduled_date text;

-- 9. Add any missing columns for Internal Products
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS progress bigint DEFAULT 0;

-- 10. Fix internal_tasks
ALTER TABLE IF EXISTS public.internal_tasks ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.internal_tasks ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- Ensure RLS is enabled but permissive for all Authenticated Users (your team)
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "Allow authenticated users full access" ON public.%I FOR ALL USING (auth.role() = ''authenticated'');', t);
  END LOOP;
END $$;
