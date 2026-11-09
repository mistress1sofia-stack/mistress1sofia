import { z } from 'zod';

const BLOCKED_KEYS = new Set(['code', 'cardImage', 'giftCardCode', 'wallet', 'password']);
export function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(details).filter(([key]) => !BLOCKED_KEYS.has(key)));
}

export const submissionSchema = z.object({
  table: z.enum(['applications', 'booking_requests']),
  reference: z.string().regex(/^MS-(APP|BKG)-[A-Z0-9-]+$/).max(39),
  details: z.record(z.unknown()).transform(sanitizeDetails).refine(
    (details) => JSON.stringify(details).length < 45000, 'Request is too large',
  ),
}).superRefine(({ table, reference, details }, ctx) => {
  const result = z.object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(254),
    age: z.coerce.number().finite().min(18).max(120),
    consent: z.literal(true),
    pay: z.enum(['giftcard', 'bitcoin', 'paypal']),
  }).safeParse(details);
  if (!result.success || !reference.startsWith(table === 'applications' ? 'MS-APP-' : 'MS-BKG-')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please complete the required request details' });
  }
});