import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submissionSchema } from '@/lib/submission-validation';
import { OWNER_EMAIL } from '@/lib/inbox';

const { send, insert, single } = vi.hoisted(() => ({ send: vi.fn(), insert: vi.fn(), single: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: { from: () => ({ insert }) },
}));
vi.mock('@/lib/email-templates/send-email', () => ({ sendTemplateEmail: send }));
import { persistAndNotify } from '@/lib/submissions.server';

const details = { name: 'Alert test', email: 'test@example.com', age: '30', consent: true, pay: 'paypal' };
beforeEach(() => {
  vi.clearAllMocks();
  insert.mockReturnValue({ select: () => ({ single }) });
  single.mockResolvedValue({ data: { id: 'submission-123' }, error: null });
  send.mockResolvedValue({ sent: true });
});
describe('Owner request alerts', () => {
  it.each([
    ['applications', 'MS-APP-TEST', 'owner-application'],
    ['booking_requests', 'MS-BKG-TEST', 'owner-booking'],
  ] as const)('sends %s only to the owner after saving', async (table, reference, template) => {
    await persistAndNotify(submissionSchema.parse({ table, reference, details }));
    expect(send).toHaveBeenCalledWith(template, 'mistress.sofia8@yahoo.com', {
      templateData: { reference, kind: table === 'applications' ? 'application' : 'booking request' },
      idempotencyKey: `${template}-submission-123`,
    });
    expect(insert.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0] ?? 0);
    expect(OWNER_EMAIL).toBe('mistress.sofia8@yahoo.com');
  });
  it('keeps the saved request when domain verification blocks sending', async () => {
    send.mockRejectedValue({ code: 'domain_not_verified' });
    const result = await persistAndNotify(submissionSchema.parse({ table: 'applications', reference: 'MS-APP-TEST', details }));
    expect(result).toEqual({ saved: true, notification: 'unavailable' });
    expect(insert).toHaveBeenCalledTimes(1);
  });
  it('does not send when saving fails', async () => {
    single.mockResolvedValue({ data: null, error: new Error('Insert failed') });
    await expect(persistAndNotify(submissionSchema.parse({ table: 'applications', reference: 'MS-APP-TEST', details }))).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
  it('never retries suppressed recipients', async () => {
    send.mockResolvedValue({ sent: false, reason: 'recipient_suppressed' });
    expect(await persistAndNotify(submissionSchema.parse({ table: 'applications', reference: 'MS-APP-TEST', details }))).toEqual({ saved: true, notification: 'suppressed' });
    expect(send).toHaveBeenCalledTimes(1);
  });
});