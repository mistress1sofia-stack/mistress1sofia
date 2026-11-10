import { getRequest } from '@tanstack/react-start/server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { sendTemplateEmail } from './email-templates/send-email';
import { OWNER_EMAIL } from './inbox';
import type { z } from 'zod';
import type { submissionSchema } from './submission-validation';

const RATE_LIMIT_PER_HOUR = 5;
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateReference(prefix: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const code = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
  return `${prefix}-${code}`;
}

async function clientIpHash() {
  const headers = getRequest().headers;
  const ip = (headers.get('cf-connecting-ip') ?? headers.get('x-forwarded-for') ?? 'unknown').split(',')[0]!.trim();
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(ip).digest('hex');
}

async function enforceRateLimit(ipHash: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from('submission_events')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  if (error) throw new Error('Your request could not be saved. Please try again.');
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    throw new Error('Too many requests from your connection. Please wait a while and try again.');
  }
}

export async function persistAndNotify(data: z.infer<typeof submissionSchema>) {
  const ipHash = await clientIpHash();
  await enforceRateLimit(ipHash);

  const application = data.table === 'applications';
  const prefix = application ? 'MS-APP' : 'MS-BKG';
  let row: { id: string } | null = null;
  let reference = '';
  // Retry on the rare reference collision (unique index).
  for (let attempt = 0; attempt < 5 && !row; attempt++) {
    reference = generateReference(prefix);
    const result = await supabaseAdmin.from(data.table).insert({
      reference,
      name: String(data.details['name']).trim(),
      email: String(data.details['email']).trim(),
      details: data.details as never,
    }).select('id').single();
    if (!result.error) row = result.data;
    else if (result.error.code !== '23505') throw new Error('Your request could not be saved. Please try again.');
  }
  if (!row) throw new Error('Your request could not be saved. Please try again.');

  await supabaseAdmin.from('submission_events').insert({ ip_hash: ipHash });
  // Opportunistic cleanup of old rate-limit events.
  await supabaseAdmin.from('submission_events').delete().lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const templateName = application ? 'owner-application' : 'owner-booking';
  try {
    const result = await sendTemplateEmail(templateName, OWNER_EMAIL, {
      templateData: { reference, kind: application ? 'application' : 'booking request' },
      idempotencyKey: `${templateName}-${row.id}`,
    });
    return { saved: true, reference, notification: result.sent ? 'sent' : 'suppressed' };
  } catch (error) {
    // Email failures must not lose requests or encourage duplicate form submissions.
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'send_failed';
    console.warn('Owner notification not sent', { code, submissionId: row.id });
    return { saved: true, reference, notification: 'unavailable' };
  }
}
