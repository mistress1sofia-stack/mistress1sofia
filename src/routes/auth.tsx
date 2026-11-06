import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { OWNER_EMAIL } from '@/lib/inbox';
export const Route = createFileRoute('/auth')({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: 'Owner Sign In — Mistress Sofia' },
    { name: 'description', content: 'Private owner access to the request inbox.' },
    { property: 'og:title', content: 'Owner Sign In — Mistress Sofia' },
    { property: 'og:description', content: 'Private owner access to the request inbox.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }), component: Auth,
});
function Auth() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => { if (data.user) void navigate({ to: '/admin' }); });
  }, [navigate]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = creating
        ? await supabase.auth.signUp({ email: OWNER_EMAIL, password, options: { emailRedirectTo: `${window.location.origin}/auth` } })
        : await supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password });
      if (result.error) throw result.error;
      if (result.data.session) await navigate({ to: '/admin' });
      else setMessage('Check your email to confirm your account, then sign in.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }
  async function social(provider: 'google' | 'lovable') {
    setBusy(true); setMessage('');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) { setMessage(result.error.message); return; }
      if (!result.redirected) await navigate({ to: '/admin' });
    } catch { setMessage('Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-md px-6 py-16">
    <LockKeyhole className="mb-5 size-7 text-gold" />
    <h1 className="text-4xl text-gold">Owner access</h1>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-sm">Email<input className="field mt-2" type="email" value={OWNER_EMAIL} readOnly autoComplete="username" /></label>
      <label className="block text-sm">Password<input className="field mt-2" type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} autoComplete={creating ? 'new-password' : 'current-password'} /></label>
      <Button className="w-full" disabled={busy} type="submit">{busy ? 'Please wait…' : creating ? 'Create owner account' : 'Sign in'}</Button>
    </form>
    {message && <p role="status" className="mt-5 text-sm text-gold break-words">{message}</p>}
    <Button variant="link" className="mt-3 px-0 text-gold" onClick={() => { setCreating(!creating); setMessage(''); }}>{creating ? 'Already registered? Sign in' : 'Create owner account'}</Button>
    <div className="mt-6 grid gap-3">
      <Button variant="outline" disabled={busy} onClick={() => social('google')}>Sign in with Google</Button>
      <Button variant="outline" disabled={busy} onClick={() => social('lovable')}>Sign in with Lovable</Button>
    </div>
  </section>;
}
