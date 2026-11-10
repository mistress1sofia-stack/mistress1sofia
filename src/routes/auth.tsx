import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [mfaFactor, setMfaFactor] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => { if (data.user) void navigate({ to: '/admin' }); });
  }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      // If two-step login is enrolled, a second code is required before entry.
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.[0];
        if (totp) { setMfaFactor(totp.id); return; }
      }
      await navigate({ to: '/admin' });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }

  async function verifyMfa(event: FormEvent) {
    event.preventDefault(); if (!mfaFactor) return;
    setBusy(true); setMessage('');
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactor });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: mfaFactor, challengeId: challenge.id, code: mfaCode.trim() });
      if (verifyError) throw verifyError;
      await navigate({ to: '/admin' });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'That code was not accepted. Please try again.'); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto max-w-md px-6 py-16">
    <LockKeyhole className="mb-5 size-7 text-gold" />
    <h1 className="text-4xl text-gold">Owner access</h1>
    {mfaFactor ? (
      <form onSubmit={verifyMfa} className="mt-8 space-y-5">
        <p className="flex items-start gap-3 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />Two-step login is on. Enter the 6-digit code from your authenticator app.</p>
        <label className="block text-sm">Authentication code
          <input className="field mt-2" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={mfaCode} onChange={e => setMfaCode(e.target.value)} autoComplete="one-time-code" autoFocus />
        </label>
        <Button className="w-full" disabled={busy} type="submit">{busy ? 'Checking…' : 'Verify and sign in'}</Button>
      </form>
    ) : (
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm">Email<input className="field mt-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /></label>
        <label className="block text-sm">Password<input className="field mt-2" type="password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <Button className="w-full" disabled={busy} type="submit">{busy ? 'Please wait…' : 'Sign in'}</Button>
      </form>
    )}
    {message && <p role="status" className="mt-5 text-sm text-gold break-words">{message}</p>}
  </section>;
}
