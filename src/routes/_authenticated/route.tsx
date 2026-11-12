import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  staticData: { sitemap: 'exclude-subtree' as const },
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: '/auth' });
    // Two-step login: if it is turned on for this account, the authenticator code must have
    // been entered in this session. A password-only session is sent back to the sign-in page.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') throw redirect({ to: '/auth' });
  },
  component: Outlet,
});
