import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, Inbox, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDetail } from '@/lib/inbox';
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
function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'applications' | 'booking_requests'>('applications');
  const [filter, setFilter] = useState<'all' | 'new'>('new');
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
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
  const rows = (requests.data ?? []).filter(row => filter === 'all' || !row.reviewed_at);
  const active = requests.data?.find(row => row.id === selected);
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true });
  }
  async function review() {
    if (!active) return;
    setSaving(true); setMessage('');
    const { error } = await supabase.from(tab).update({ reviewed_at: active.reviewed_at ? null : new Date().toISOString() }).eq('id', active.id);
    if (error) setMessage('Could not update this request. Please try again.');
    else await queryClient.invalidateQueries({ queryKey: ['inbox', tab] });
    setSaving(false);
  }
  return <section className="mx-auto max-w-7xl px-6 py-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Inbox className="mb-3 size-6 text-gold" /><h1 className="text-4xl text-gold">Private inbox</h1></div><Button variant="outline" onClick={signOut}><LogOut />Sign out</Button></div>
    {access.isPending ? <p className="mt-8">Checking access…</p> : access.error ? <p role="alert" className="mt-8">Unable to verify access. Please sign in again.</p> : !access.data ? <p role="alert" className="mt-8">Access denied. This inbox is restricted to the owner’s verified account.</p> : <>
      <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <div className="flex gap-2" role="tablist" aria-label="Request type">{(['applications', 'booking_requests'] as const).map(value => <Button key={value} role="tab" aria-selected={tab === value} variant={tab === value ? 'default' : 'outline'} onClick={() => { setTab(value); setSelected(null); }}>{value === 'applications' ? 'Applications' : 'Bookings'}</Button>)}</div>
        <select aria-label="Request status" className="field max-w-40" value={filter} onChange={e => setFilter(e.target.value === 'new' ? 'new' : 'all')}><option value="new">New requests</option><option value="all">All requests</option></select>
        <Button size="icon" variant="outline" title="Refresh requests" aria-label="Refresh requests" onClick={() => queryClient.invalidateQueries({ queryKey: ['inbox'] })}><RefreshCw /></Button>
      </div>
      {requests.isPending ? <p className="py-10">Loading requests…</p> : requests.error ? <p role="alert" className="py-10">Unable to load requests. Please refresh.</p> : <div className="grid min-w-0 gap-8 py-7 lg:grid-cols-[340px_1fr]">
        <div className="min-w-0">{!rows.length ? <p className="text-muted-foreground">No {filter === 'new' ? 'new ' : ''}requests.</p> : rows.map(row => <Button key={row.id} variant="ghost" className="h-auto w-full justify-start whitespace-normal border-b border-border p-4 text-left" onClick={() => setSelected(row.id)}><span className="block min-w-0"><span className="block break-words text-gold">{row.name || 'Unnamed request'}</span><span className="mt-1 block text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString('en-GB')} · {row.reviewed_at ? 'Reviewed' : 'New'}</span><span className="mt-1 block break-all text-xs">{row.reference}</span></span></Button>)}</div>
        <div className="min-w-0">{active ? <>
          <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="break-words text-3xl">{active.name || 'Request details'}</h2><Button disabled={saving} onClick={review} variant="outline"><Check />{active.reviewed_at ? 'Mark as new' : 'Mark reviewed'}</Button></div>
          <p className="mt-3 break-all text-sm text-muted-foreground">{active.reference} · {new Date(active.created_at).toLocaleString('en-GB')}</p>
          {active.email && <a className="mt-3 block break-all text-gold underline" href={`mailto:${active.email}`}>{active.email}</a>}
          <dl className="mt-8 divide-y divide-border">{Object.entries(active.details ?? {}).map(([key, value]) => <div key={key} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]"><dt className="break-words text-sm capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</dt><dd className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6">{formatDetail(value)}</dd></div>)}</dl>
          {message && <p role="alert" className="mt-4 text-destructive">{message}</p>}
        </> : <p className="text-muted-foreground">No request selected.</p>}</div>
      </div>}
    </>}
  </section>;
}
