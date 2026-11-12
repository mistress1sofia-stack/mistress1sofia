import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { isOwnerEmail } from '@/lib/inbox';

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
  // One-time owner account setup. Only reachable at /auth?setup=owner, and it only works
  // while sign-up is switched on in the backend (switch it off again afterwards).
  const [setup, setSetup] = useState(false);
  useEffect(() => { setSetup(new URLSearchParams(window.location.search).get('setup') === 'owner'); }, []);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      // Already signed in. If two-step login is on but the code has not been entered in this
      // session, ask for the code here instead of opening the inbox (which would bounce back).
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.[0];
        if (totp) { setMfaFactor(totp.id); return; }
        setMessage('Two-step login could not be started. Please sign in again.');
        return;
      }
      void navigate({ to: '/admin' });
    })();
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

  // Sends a password-reset link. The reply is the same whether or not an account exists,
  // so nobody can use this page to find out which emails have accounts.
  async function sendReset() {
    const address = email.trim();
    if (!address) { setMessage('Type your email in the box above first, then press "Forgot password?".'); return; }
    setBusy(true); setMessage('');
    try {
      await supabase.auth.resetPasswordForEmail(address, { redirectTo: `${window.location.origin}/reset-password` });
    } catch { /* same reply either way */ }
    setMessage('If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.');
    setBusy(false);
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

  async function createOwner(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      if (!isOwnerEmail(email.trim())) throw new Error('Only the owner email can be set up here.');
      if (password.length < 12) throw new Error('Choose a password of at least 12 characters.');
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      if (error) throw error;
      setMessage('Account created. Open the confirmation email we just sent, confirm it, then sign in here.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to create the account. Please try again.'); }
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
        <label className="block text-sm">Password<input className="field mt-2" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <Button className="w-full" disabled={busy} type="submit">{busy ? 'Please wait…' : 'Sign in'}</Button>
        <button type="button" disabled={busy} onClick={() => void sendReset()} className="block w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-gold">Forgot password?</button>
      </form>
    )}
    {setup && !mfaFactor && (
      <form onSubmit={createOwner} className="mt-12 space-y-5 border-t border-border pt-8">
        <p className="text-sm text-muted-foreground">One-time owner setup. This only works while sign-up is switched on in the backend; switch it off again once your account is confirmed.</p>
        <label className="block text-sm">Owner email<input className="field mt-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /></label>
        <label className="block text-sm">New password (at least 12 characters)<input className="field mt-2" type="password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label>
        <Button className="w-full" variant="outline" disabled={busy} type="submit">{busy ? 'Please wait…' : 'Create owner account'}</Button>
      </form>
    )}
    {message && <p role="status" className="mt-5 text-sm text-gold break-words">{message}</p>}
  </section>;
}
