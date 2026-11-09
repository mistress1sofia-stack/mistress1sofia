import { z } from 'zod';

const BLOCKED_KEYS = new Set(['code', 'cardImage', 'giftCardCode', 'wallet', 'password']);
export function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(details).filter(([key]) => !BLOCKED_KEYS.has(key)));
}

export const submissionSchema = z.object({
  table: z.enum(['applications', 'booking_requests']),
  // Spam protection: honeypot must stay empty, and the form must have been
  // open for a minimum time before submitting.
  website: z.string().max(0).optional().default(''),
  elapsedMs: z.coerce.number().finite().min(2500),
  details: z.record(z.unknown()).transform(sanitizeDetails).refine(
    (details) => JSON.stringify(details).length < 45000, 'Request is too large',
  ),
}).superRefine(({ details }, ctx) => {
  const result = z.object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(254),
    age: z.coerce.number().finite().min(18).max(120),
    consent: z.literal(true),
    sensitiveConsent: z.literal(true),
    pay: z.enum(['giftcard', 'bitcoin', 'paypal']),
  }).safeParse(details);
  if (!result.success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please complete the required request details' });
  }
});
