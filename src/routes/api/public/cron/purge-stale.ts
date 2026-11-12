import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';

// Scheduled retention job (runs daily):
//  - Declined requests are deleted at the next run, i.e. within 24 hours of the decision
//    (the owner can also delete them at once from the inbox).
//  - Undecided (new / reviewed) requests older than 90 days are deleted.
//  - Accepted requests are kept until the owner deletes them or the person asks.
export const Route = createFileRoute('/api/public/cron/purge-stale')({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        let deleted = 0;
        for (const table of ['applications', 'booking_requests'] as const) {
          const stale = await supabaseAdmin
            .from(table)
            .delete()
            .in('status', ['new', 'reviewed'])
            .lt('created_at', cutoff)
            .select('id');
          if (stale.error) return new Response('Purge failed', { status: 500 });
          deleted += stale.data?.length ?? 0;

          const declined = await supabaseAdmin
            .from(table)
            .delete()
            .eq('status', 'declined')
            .select('id');
          if (declined.error) return new Response('Purge failed', { status: 500 });
          deleted += declined.data?.length ?? 0;
        }
        await supabaseAdmin.from('submission_events').delete().lt('created_at', cutoff);
        return Response.json({ ok: true, deleted });
      },
    },
  },
});
