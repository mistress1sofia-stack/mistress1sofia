import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { sendTemplateEmail } from './email-templates/send-email';
import { OWNER_EMAIL } from './inbox';
import type { z } from 'zod';
import type { submissionSchema } from './submission-validation';

export async function persistAndNotify(data: z.infer<typeof submissionSchema>) {
  const { data: row, error } = await supabaseAdmin.from(data.table).insert({
    reference: data.reference,
    name: String(data.details.name).trim(),
    email: String(data.details.email).trim(),
    details: data.details as never,
  }).select('id').single();
  if (error || !row) throw new Error('Your request could not be saved. Please try again.');
  const application = data.table === 'applications';
  const templateName = application ? 'owner-application' : 'owner-booking';
  try {
    const result = await sendTemplateEmail(templateName, OWNER_EMAIL, {
      templateData: { reference: data.reference, kind: application ? 'application' : 'booking request' },
      idempotencyKey: `${templateName}-${row.id}`,
    });
    return { saved: true, notification: result.sent ? 'sent' : 'suppressed' };
  } catch (error) {
    // Email failures must not lose requests or encourage duplicate form submissions.
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'send_failed';
    console.warn('Owner notification not sent', { code, submissionId: row.id });
    return { saved: true, notification: 'unavailable' };
  }
}