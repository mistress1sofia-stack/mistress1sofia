import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submissionSchema } from '@/lib/submission-validation';
import { OWNER_EMAIL } from '@/lib/inbox';

const { send, insert, single, eventsSelect, eventsInsert, eventsDelete } = vi.hoisted(() => ({
  send: vi.fn(), insert: vi.fn(), single: vi.fn(),
  eventsSelect: vi.fn(), eventsInsert: vi.fn(), eventsDelete: vi.fn(),
}));
vi.mock('@tanstack/react-start', () => ({
  getRequest: () => new Request('https://test.local', { headers: { 'x-forwarded-for': '203.0.113.9' } }),
}));
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: {
    from: (table: string) => table === 'submission_events'
      ? { select: eventsSelect, insert: eventsInsert, delete: eventsDelete }
      : { insert },
  },
}));
vi.mock('@/lib/email-templates/send-email', () => ({ sendTemplateEmail: send }));
import { persistAndNotify } from '@/lib/submissions.server';

const details = { name: 'Alert test', email: 'test@example.com', age: '30', consent: true, sensitiveConsent: true, pay: 'paypal' };
const parse = (table: 'applications' | 'booking_requests') =>
  submissionSchema.parse({ table, details, elapsedMs: 5000 });

beforeEach(() => {
  vi.clearAllMocks();
  insert.mockReturnValue({ select: () => ({ single }) });
  single.mockResolvedValue({ data: { id: 'submission-123' }, error: null });
  eventsSelect.mockReturnValue({ eq: () => ({ gte: async () => ({ count: 0, error: null }) }) });
  eventsInsert.mockResolvedValue({ error: null });
  eventsDelete.mockReturnValue({ lt: async () => ({ error: null }) });
  send.mockResolvedValue({ sent: true });
});

describe('Owner request alerts', () => {
  it.each([
    ['applications', 'owner-application', /^MS-APP-[A-Z2-9]{10}$/],
    ['booking_requests', 'owner-booking', /^MS-BKG-[A-Z2-9]{10}$/],
  ] as const)('sends %s only to the owner after saving, with a server-generated reference', async (table, template, refPattern) => {
    await persistAndNotify(parse(table));
    expect(send).toHaveBeenCalledWith(template, 'mistress.sofia8@yahoo.com', {
      templateData: { reference: expect.stringMatching(refPattern), kind: table === 'applications' ? 'application' : 'booking request' },
      idempotencyKey: `${template}-submission-123`,
    });
    expect(insert.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0] ?? 0);
    expect(OWNER_EMAIL).toBe('mistress.sofia8@yahoo.com');
  });
  it('returns the server-generated reference to the confirmation screen', async () => {
    const result = await persistAndNotify(parse('applications'));
    expect(result.reference).toMatch(/^MS-APP-[A-Z2-9]{10}$/);
    expect(result).toMatchObject({ saved: true, notification: 'sent' });
  });
  it('keeps the saved request when domain verification blocks sending', async () => {
    send.mockRejectedValue({ code: 'domain_not_verified' });
    const result = await persistAndNotify(parse('applications'));
    expect(result).toMatchObject({ saved: true, notification: 'unavailable' });
    expect(insert).toHaveBeenCalledTimes(1);
  });
  it('does not send when saving fails', async () => {
    single.mockResolvedValue({ data: null, error: new Error('Insert failed') });
    await expect(persistAndNotify(parse('applications'))).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
  it('never retries suppressed recipients', async () => {
    send.mockResolvedValue({ sent: false, reason: 'recipient_suppressed' });
    expect(await persistAndNotify(parse('applications'))).toMatchObject({ saved: true, notification: 'suppressed' });
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('rejects submissions beyond 5 per hour from one connection', async () => {
    eventsSelect.mockReturnValue({ eq: () => ({ gte: async () => ({ count: 5, error: null }) }) });
    await expect(persistAndNotify(parse('applications'))).rejects.toThrow('Too many requests');
    expect(insert).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});

describe('Submission spam validation', () => {
  it('rejects a filled honeypot', () => {
    expect(() => submissionSchema.parse({ table: 'applications', details, elapsedMs: 5000, website: 'spammy' })).toThrow();
  });
  it('rejects submissions faster than the minimum time', () => {
    expect(() => submissionSchema.parse({ table: 'applications', details, elapsedMs: 800 })).toThrow();
  });
  it('requires sensitive-data consent', () => {
    const { sensitiveConsent, ...without } = details;
    expect(() => submissionSchema.parse({ table: 'applications', details: without, elapsedMs: 5000 })).toThrow();
  });
});
