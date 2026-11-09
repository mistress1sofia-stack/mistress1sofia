-- Four-state review status replaces the reviewed_at toggle
ALTER TABLE public.applications ADD COLUMN status text NOT NULL DEFAULT 'new';
ALTER TABLE public.booking_requests ADD COLUMN status text NOT NULL DEFAULT 'new';
UPDATE public.applications SET status = 'reviewed' WHERE reviewed_at IS NOT NULL;
UPDATE public.booking_requests SET status = 'reviewed' WHERE reviewed_at IS NOT NULL;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check CHECK (status IN ('new','reviewed','accepted','declined'));
ALTER TABLE public.booking_requests ADD CONSTRAINT booking_requests_status_check CHECK (status IN ('new','reviewed','accepted','declined'));
COMMENT ON COLUMN public.applications.reviewed_at IS 'DEPRECATED: replaced by status';
COMMENT ON COLUMN public.booking_requests.reviewed_at IS 'DEPRECATED: replaced by status';

-- Private owner notes, never shown to applicants
ALTER TABLE public.applications ADD COLUMN notes text;
ALTER TABLE public.booking_requests ADD COLUMN notes text;

-- Server-generated references must be unique
CREATE UNIQUE INDEX applications_reference_key ON public.applications (reference);
CREATE UNIQUE INDEX booking_requests_reference_key ON public.booking_requests (reference);

-- Owner may delete requests (retention policy)
CREATE POLICY "Owner deletes applications" ON public.applications FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Owner deletes bookings" ON public.booking_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can no longer write directly; submissions go through the validated server function (service role)
DROP POLICY "Anyone can submit an application" ON public.applications;
DROP POLICY "Anyone can submit a booking" ON public.booking_requests;
REVOKE INSERT ON public.applications FROM anon, authenticated;
REVOKE INSERT ON public.booking_requests FROM anon, authenticated;

-- Rate-limit events for the submission server function (service role only)
CREATE TABLE public.submission_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.submission_events TO service_role;
ALTER TABLE public.submission_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX submission_events_ip_created ON public.submission_events (ip_hash, created_at);