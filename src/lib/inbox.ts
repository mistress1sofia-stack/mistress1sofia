export const OWNER_EMAIL = 'mistress.sofia8@yahoo.com';
export function isOwnerEmail(email: string | undefined) {
  return email?.trim().toLowerCase() === OWNER_EMAIL;
}
export function formatDetail(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map(formatDetail).join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return Object.entries(value).map(([key, val]) => `${key}: ${formatDetail(val)}`).join('; ');
  return String(value);
}