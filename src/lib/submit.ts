import { submitRequest } from './submissions.functions';
export { sanitizeDetails } from './submission-validation';

export async function saveSubmission(
  table: "applications" | "booking_requests",
  reference: string,
  details: Record<string, unknown>,
) {
  return submitRequest({ data: { table, reference, details } });
}
