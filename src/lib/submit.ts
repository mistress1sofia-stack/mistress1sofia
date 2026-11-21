import { submitRequest } from './submissions.functions';
export { sanitizeDetails } from './submission-validation';

// "How did you find me?" is chosen in the form (see SourceField) and kept in this browser tab only.
const SOURCE_KEY = 'ms-source';

export async function saveSubmission(
  table: "applications" | "booking_requests",
  details: Record<string, unknown>,
  spam: { website: string; elapsedMs: number },
) {
  let source = '';
  try { source = sessionStorage.getItem(SOURCE_KEY) ?? ''; } catch { /* storage blocked */ }
  const withSource = source && !details['source'] ? { ...details, source } : details;
  const result = await submitRequest({ data: { table, details: withSource, website: spam.website, elapsedMs: spam.elapsedMs } });
  try { sessionStorage.removeItem(SOURCE_KEY); } catch { /* storage blocked */ }
  return result;
}
