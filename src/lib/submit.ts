import { submitRequest } from './submissions.functions';
export { sanitizeDetails } from './submission-validation';

export async function saveSubmission(
  table: "applications" | "booking_requests",
  details: Record<string, unknown>,
  spam: { website: string; elapsedMs: number },
) {
  return submitRequest({ data: { table, details, website: spam.website, elapsedMs: spam.elapsedMs } });
}
