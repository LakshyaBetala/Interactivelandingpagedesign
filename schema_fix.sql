-- Run this script in the Supabase SQL Editor to perfectly sync the database schema!

-- 1. ADD ALL MISSING COLUMNS FIRST (This ensures they exist before we try to modify them)

-- Clients
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS stage text;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS amount_paid bigint DEFAULT 0;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS margin bigint DEFAULT 0;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS last_activity text;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);

-- Outreach Leads
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS engagement_score bigint DEFAULT 10;
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS sourced_by_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.outreach_leads ADD COLUMN IF NOT EXISTS estimated_value bigint DEFAULT 0;

-- Internal Tasks
ALTER TABLE IF EXISTS public.internal_tasks ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE IF EXISTS public.internal_tasks ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.internal_tasks ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- Project Flags
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS priority text;
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS sprint_logs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.project_flags ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- Social Media
ALTER TABLE IF EXISTS public.social_media ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE IF EXISTS public.social_media ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.social_media ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE IF EXISTS public.social_media ADD COLUMN IF NOT EXISTS scheduled_date text;

-- Internal Products
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS stage text;
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS progress bigint DEFAULT 0;
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS repo_link text;
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS sandbox_link text;
ALTER TABLE IF EXISTS public.internal_products ADD COLUMN IF NOT EXISTS metrics jsonb DEFAULT '{}'::jsonb;

-- Releases
ALTER TABLE IF EXISTS public.releases ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE IF EXISTS public.releases ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE IF EXISTS public.releases ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- Comments
ALTER TABLE IF EXISTS public.comments ADD COLUMN IF NOT EXISTS time_elapsed text;
ALTER TABLE IF EXISTS public.comments ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- Activities
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS client text;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS time text;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS type text;


-- 2. Convert any existing Enum columns to TEXT to prevent rigid enum errors
-- (We use a DO block to ignore errors if the table doesn't exist)
DO $$ 
BEGIN
  BEGIN ALTER TABLE public.clients ALTER COLUMN stage TYPE TEXT USING stage::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.clients ALTER COLUMN category TYPE TEXT USING category::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.outreach_leads ALTER COLUMN status TYPE TEXT USING status::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.outreach_leads ALTER COLUMN source TYPE TEXT USING source::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.internal_tasks ALTER COLUMN status TYPE TEXT USING status::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.project_flags ALTER COLUMN status TYPE TEXT USING status::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.project_flags ALTER COLUMN priority TYPE TEXT USING priority::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.social_media ALTER COLUMN status TYPE TEXT USING status::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.internal_products ALTER COLUMN stage TYPE TEXT USING stage::TEXT; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE public.releases ALTER COLUMN status TYPE TEXT USING status::TEXT; EXCEPTION WHEN OTHERS THEN END;
END $$;


-- 3. Ensure RLS is enabled but permissive for all Authenticated Users (your team)
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
