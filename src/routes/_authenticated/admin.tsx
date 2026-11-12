import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, Inbox, LogOut, RefreshCw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDetail } from '@/lib/inbox';

const STATUSES = ['new', 'reviewed', 'accepted', 'declined'] as const;
type Status = (typeof STATUSES)[number];
type Table = 'applications' | 'booking_requests';

export const Route = createFileRoute('/_authenticated/admin')({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: 'Private Inbox — Mistress Sofia' },
    { name: 'description', content: 'Private application and booking request review.' },
    { property: 'og:title', content: 'Private Inbox — Mistress Sofia' },
    { property: 'og:description', content: 'Private application and booking request review.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }), component: Admin,
});

function statusLabel(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Table>('applications');
  const [filter, setFilter] = useState<'all' | Status>('new');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [offerDelete, setOfferDelete] = useState(false);
  const [notes, setNotes] = useState('');
  const [refDelete, setRefDelete] = useState('');
  const [confirmRefDelete, setConfirmRefDelete] = useState(false);

  const access = useQuery({ queryKey: ['inbox-access'], queryFn: async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('Please sign in again.');
    const { data, error } = await supabase.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
    if (error) throw error;
    return data;
  }});
  const requests = useQuery({ queryKey: ['inbox', tab], enabled: access.data === true, queryFn: async () => {
    const { data, error } = await supabase.from(tab).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }});
  const mfa = useQuery({ queryKey: ['mfa-factors'], enabled: access.data === true, queryFn: async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    return (data.totp ?? []).filter(f => f.status === 'verified').length > 0;
  }});

  const term = search.trim().toLowerCase();
  const rows = (requests.data ?? []).filter(row =>
    (filter === 'all' || row.status === filter) &&
    (!term || [row.name, row.email, row.reference].some(v => v?.toLowerCase().includes(term))),
  );
  const active = requests.data?.find(row => row.id === selected);

  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true });
  }
  async function setStatus(status: Status) {
    if (!active) return;
    setSaving(true); setMessage('');
    const { error } = await supabase.from(tab).update({ status }).eq('id', active.id);
    if (error) setMessage('Could not update this request. Please try again.');
    else {
      await queryClient.invalidateQueries({ queryKey: ['inbox', tab] });
      if (status === 'declined') setOfferDelete(true);
    }
    setSaving(false);
  }
  async function deleteRow(id: string) {
    setSaving(true); setMessage('');
    const { error } = await supabase.from(tab).delete().eq('id', id);
    if (error) setMessage('Could not delete this request. Please try again.');
    else {
      setSelected(null); setConfirmDelete(false); setOfferDelete(false);
      await queryClient.invalidateQueries({ queryKey: ['inbox', tab] });
    }
    setSaving(false);
  }
  async function deleteByReference() {
    const ref = refDelete.trim();
    if (!ref) return;
    setSaving(true); setMessage('');
    const { data, error } = await supabase.from(tab).delete().eq('reference', ref).select('id');
    if (error) setMessage('Could not delete that reference. Please try again.');
    else if (!data?.length) setMessage(`No ${tab === 'applications' ? 'application' : 'booking request'} found with reference ${ref}.`);
    else { setRefDelete(''); setConfirmRefDelete(false); if (data.some(r => r.id === selected)) setSelected(null); await queryClient.invalidateQueries({ queryKey: ['inbox', tab] }); }
    setSaving(false);
  }
  async function saveNotes() {
    if (!active) return;
    setSaving(true); setMessage('');
    const { error } = await supabase.from(tab).update({ notes }).eq('id', active.id);
    if (error) setMessage('Could not save notes. Please try again.');
    else await queryClient.invalidateQueries({ queryKey: ['inbox', tab] });
    setSaving(false);
  }

  return <section className="mx-auto max-w-7xl px-6 py-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Inbox className="mb-3 size-6 text-gold" /><h1 className="text-4xl text-gold">Private inbox</h1></div><Button variant="outline" onClick={signOut}><LogOut />Sign out</Button></div>
    {access.isPending ? <p className="mt-8">Checking access…</p> : access.error ? <p role="alert" className="mt-8">Unable to verify access. Please sign in again.</p> : !access.data ? <p role="alert" className="mt-8">Access denied. This inbox is restricted to the owner’s verified account.</p> : <>
      <MfaPanel enabled={mfa.data === true} pending={mfa.isPending} onChanged={() => queryClient.invalidateQueries({ queryKey: ['mfa-factors'] })} />
      <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <div className="flex gap-2" role="tablist" aria-label="Request type">{(['applications', 'booking_requests'] as const).map(value => <Button key={value} role="tab" aria-selected={tab === value} variant={tab === value ? 'default' : 'outline'} onClick={() => { setTab(value); setSelected(null); setConfirmDelete(false); setOfferDelete(false); }}>{value === 'applications' ? 'Applications' : 'Bookings'}</Button>)}</div>
        <select aria-label="Request status" className="field max-w-40" value={filter} onChange={e => setFilter(e.target.value as 'all' | Status)}>
          <option value="new">New</option><option value="reviewed">Reviewed</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="all">All requests</option>
        </select>
        <label className="relative">
          <span className="sr-only">Search by name, email or reference</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className="field max-w-64 pl-9" placeholder="Search name, email, reference" value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <Button size="icon" variant="outline" title="Refresh requests" aria-label="Refresh requests" onClick={() => queryClient.invalidateQueries({ queryKey: ['inbox'] })}><RefreshCw /></Button>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground" htmlFor="ref-delete">Delete by reference</label>
        <input id="ref-delete" className="field max-w-56" placeholder="MS-APP-…" value={refDelete} onChange={e => { setRefDelete(e.target.value); setConfirmRefDelete(false); }} />
        {confirmRefDelete ? <>
          <Button variant="destructive" disabled={saving} onClick={deleteByReference}>Confirm permanent delete</Button>
          <Button variant="outline" onClick={() => setConfirmRefDelete(false)}>Cancel</Button>
        </> : <Button variant="outline" disabled={!refDelete.trim()} onClick={() => setConfirmRefDelete(true)}><Trash2 />Delete</Button>}
      </div>
      {requests.isPending ? <p className="py-10">Loading requests…</p> : requests.error ? <p role="alert" className="py-10">Unable to load requests. Please refresh.</p> : <div className="grid min-w-0 gap-8 py-7 lg:grid-cols-[340px_1fr]">
        <div className="min-w-0">{!rows.length ? <p className="text-muted-foreground">No {filter === 'all' ? '' : `${filter} `}requests.</p> : rows.map(row => <Button key={row.id} variant="ghost" className="h-auto w-full justify-start whitespace-normal border-b border-border p-4 text-left" onClick={() => { setSelected(row.id); setNotes(row.notes ?? ''); setConfirmDelete(false); setOfferDelete(false); setMessage(''); }}><span className="block min-w-0"><span className="block break-words text-gold">{row.name || 'Unnamed request'}</span><span className="mt-1 block text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString('en-GB')} · {statusLabel(row.status)}</span><span className="mt-1 block break-all text-xs">{row.reference}</span></span></Button>)}</div>
        <div className="min-w-0">{active ? <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="break-words text-3xl">{active.name || 'Request details'}</h2>
            <div className="flex flex-wrap gap-2">
              {STATUSES.filter(s => s !== active.status).map(s => <Button key={s} size="sm" variant="outline" disabled={saving} onClick={() => setStatus(s)}><Check />Mark {s}</Button>)}
            </div>
          </div>
          <p className="mt-3 break-all text-sm text-muted-foreground">{active.reference} · {new Date(active.created_at).toLocaleString('en-GB')} · {statusLabel(active.status)}</p>
          {active.email && <a className="mt-3 block break-all text-gold underline" href={`mailto:${active.email}`}>{active.email}</a>}
          <dl className="mt-8 divide-y divide-border">{Object.entries(active.details ?? {}).map(([key, value]) => <div key={key} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]"><dt className="break-words text-sm capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</dt><dd className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6">{formatDetail(value)}</dd></div>)}</dl>
          <div className="mt-8 border-t border-border pt-6">
            <label className="block text-[0.65rem] uppercase tracking-[0.25em] text-gold" htmlFor="owner-notes">Private notes (never shown to the applicant)</label>
            <textarea id="owner-notes" rows={3} className="field mt-2" value={notes} onChange={e => setNotes(e.target.value)} />
            <Button className="mt-3" size="sm" variant="outline" disabled={saving || notes === (active.notes ?? '')} onClick={saveNotes}>Save notes</Button>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            {offerDelete && <p className="mb-4 text-sm text-muted-foreground">This request is marked Declined. Declined requests are deleted automatically within 24 hours of the decision — you can delete it now, or mark it another status before then to keep it.</p>}
            {confirmDelete ? <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-danger">Permanently delete {active.reference}? This cannot be undone.</p>
              <Button variant="destructive" disabled={saving} onClick={() => deleteRow(active.id)}>Confirm delete</Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div> : <Button variant="outline" disabled={saving} onClick={() => setConfirmDelete(true)}><Trash2 />Delete this request</Button>}
          </div>
          {message && <p role="alert" className="mt-4 text-danger">{message}</p>}
        </> : <p className="text-muted-foreground">No request selected.</p>}</div>
      </div>}
    </>}
  </section>;
}

function MfaPanel({ enabled, pending, onChanged }: { enabled: boolean; pending: boolean; onChanged: () => void }) {
  const [enrolling, setEnrolling] = useState<{ factorId: string; qr: string } | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function enroll() {
    setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Owner authenticator' });
      if (error) throw error;
      setEnrolling({ factorId: data.id, qr: data.totp.qr_code });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not start two-step setup.'); }
    finally { setBusy(false); }
  }
  async function verify() {
    if (!enrolling) return;
    setBusy(true); setMessage('');
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrolling.factorId });
      if (challengeError) throw challengeError;
      const { error } = await supabase.auth.mfa.verify({ factorId: enrolling.factorId, challengeId: challenge.id, code: code.trim() });
      if (error) throw error;
      setEnrolling(null); setCode(''); onChanged();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'That code was not accepted. Please try again.'); }
    finally { setBusy(false); }
  }

  return <div className="mt-8 border border-border bg-card/60 p-5">
    <p className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.25em] text-gold"><ShieldCheck className="size-4" />Two-step login</p>
    {pending ? <p className="mt-3 text-sm text-muted-foreground">Checking…</p> : enabled ? <p className="mt-3 text-sm text-muted-foreground">Two-step login is on. You will be asked for an authenticator code at each sign-in.</p> : enrolling ? <div className="mt-4 space-y-4">
      <p className="text-sm text-muted-foreground">Scan this code with your authenticator app, then enter the 6-digit code it shows.</p>
      <img alt="Authenticator setup QR code" className="h-40 w-40 bg-white p-2" src={`data:image/svg+xml;utf8,${encodeURIComponent(enrolling.qr)}`} />
      <label className="block max-w-xs text-sm">Authentication code
        <input className="field mt-2" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value)} autoComplete="one-time-code" />
      </label>
      <div className="flex gap-3"><Button size="sm" disabled={busy || code.trim().length !== 6} onClick={verify}>{busy ? 'Checking…' : 'Turn on two-step login'}</Button><Button size="sm" variant="outline" onClick={() => setEnrolling(null)}>Cancel</Button></div>
    </div> : <div className="mt-3"><p className="text-sm text-muted-foreground">Two-step login is off. Turn it on so a code from your phone is also required to sign in.</p><Button className="mt-3" size="sm" variant="outline" disabled={busy} onClick={enroll}>{busy ? 'Please wait…' : 'Set up two-step login'}</Button></div>}
    {message && <p role="alert" className="mt-3 text-sm text-danger">{message}</p>}
  </div>;
}
