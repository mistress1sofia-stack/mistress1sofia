import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/reset-password')({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: 'Set a New Password — Mistress Sofia' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  // null = still checking the emailed link, true = link accepted, false = invalid or expired.
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // The emailed link signs the owner in with a short-lived recovery session. Wait for it.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setReady(true);
    });
    const timer = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    }, 1500);
    return () => { sub.subscription.unsubscribe(); window.clearTimeout(timer); };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage('');
    if (password.length < 12) { setMessage('Choose a password of at least 12 characters.'); return; }
    if (password !== confirm) { setMessage('The two passwords do not match.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // The sign-in page continues to the inbox, asking for the two-step code first if it is turned on.
      await navigate({ to: '/auth' });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to set the password. Please try again.'); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto max-w-md px-6 py-16">
    <LockKeyhole className="mb-5 size-7 text-gold" />
    <h1 className="text-4xl text-gold">Set a new password</h1>
    {ready === null ? (
      <p className="mt-8 text-sm text-muted-foreground">Checking your link…</p>
    ) : ready ? (
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm">New password (at least 12 characters)<input className="field mt-2" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label>
        <label className="block text-sm">Confirm new password<input className="field mt-2" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></label>
        <Button className="w-full" disabled={busy} type="submit">{busy ? 'Please wait…' : 'Save password'}</Button>
      </form>
    ) : (
      <div className="mt-8 space-y-5 text-sm text-muted-foreground">
        <p>This link is invalid or has expired. Request a new one from the sign-in page.</p>
        <Link to="/auth" className="text-gold underline">Back to sign in</Link>
      </div>
    )}
    {message && <p role="status" className="mt-5 text-sm text-gold break-words">{message}</p>}
  </section>;
}
