import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  staticData: { sitemap: 'exclude-subtree' as const },
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: '/auth' });
  },
  component: Outlet,
});
