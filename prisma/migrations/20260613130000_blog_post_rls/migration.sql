-- Enable RLS on BlogPost when the table already exists but RLS was not set
-- (e.g. migration applied before RLS lines were added to the create migration).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'BlogPost'
  ) THEN
    EXECUTE 'ALTER TABLE public."BlogPost" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public."BlogPost" FROM anon, authenticated';
  END IF;
END $$;
