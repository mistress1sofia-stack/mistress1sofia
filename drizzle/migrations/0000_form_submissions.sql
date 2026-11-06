CREATE TABLE public.applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL, name text, email text, details jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.booking_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL, name text, email text, details jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
GRANT INSERT ON public.applications, public.booking_requests TO anon, authenticated;
GRANT ALL ON public.applications, public.booking_requests TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an application" ON public.applications FOR INSERT TO anon, authenticated WITH CHECK (length(reference) < 40 AND pg_column_size(details) < 50000);
CREATE POLICY "Anyone can submit a booking" ON public.booking_requests FOR INSERT TO anon, authenticated WITH CHECK (length(reference) < 40 AND pg_column_size(details) < 50000);