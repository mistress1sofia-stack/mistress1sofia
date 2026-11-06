import { describe, expect, it } from 'vitest';
import { isOwnerEmail } from '@/lib/inbox';
describe('owner identity', () => {
  it('accepts only the chosen owner email', () => {
    expect(isOwnerEmail('mistress.sofia8@yahoo.com')).toBe(true);
    expect(isOwnerEmail('visitor@yahoo.com')).toBe(false);
    expect(isOwnerEmail(undefined)).toBe(false);
  });
});