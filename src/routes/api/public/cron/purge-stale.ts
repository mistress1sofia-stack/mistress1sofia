import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';

// Scheduled retention job: delete undecided requests older than 90 days.
// Declined requests are deleted by the owner at decision time; accepted
// requests are kept until the owner deletes them or the person asks.
export const Route = createFileRoute('/api/public/cron/purge-stale')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        let deleted = 0;
        for (const table of ['applications', 'booking_requests'] as const) {
          const { data, error } = await supabaseAdmin
            .from(table)
            .delete()
            .in('status', ['new', 'reviewed'])
            .lt('created_at', cutoff)
            .select('id');
          if (error) return new Response('Purge failed', { status: 500 });
          deleted += data?.length ?? 0;
        }
        await supabaseAdmin.from('submission_events').delete().lt('created_at', cutoff);
        return Response.json({ ok: true, deleted });
      },
    },
  },
});
