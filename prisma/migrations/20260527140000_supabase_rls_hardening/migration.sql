-- Supabase security hardening: enable RLS on all public tables and lock down
-- PostgREST roles (anon/authenticated). Content OS uses Prisma via DATABASE_URL
-- (postgres / service role), which bypasses RLS - app behavior is unchanged.
--
-- Also moves pgvector to the extensions schema (Supabase linter recommendation).

-- ---------------------------------------------------------------------------
-- 1. Move vector extension out of public (WARN: extension_in_public)
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- Prisma runs this file in a transaction; avoid ALTER DATABASE (not allowed).
GRANT USAGE ON SCHEMA extensions TO postgres, service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    EXECUTE 'ALTER ROLE postgres SET search_path TO public, extensions';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'ALTER ROLE service_role SET search_path TO public, extensions';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Enable RLS on every table in public (ERROR: rls_disabled_in_public)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      tbl.schemaname,
      tbl.tablename
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Deny PostgREST direct access (belt-and-suspenders with RLS + no policies)
--    Fixes sensitive_columns_exposed for tables like conversations.session_id
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Prisma migrations table: service role only
REVOKE ALL ON TABLE public._prisma_migrations FROM anon, authenticated;
