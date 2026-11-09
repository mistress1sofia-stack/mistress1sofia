const RECOVERY_KEY = 'ms-module-recovery';
const RETRY_WINDOW_MS = 30_000;

export function isModuleLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk .+ failed|error loading dynamically imported module/i.test(message);
}

// Browsers cache rejected dynamic imports; router reset alone cannot retry them.
// Reload once per window, preserving the current URL and stored sign-in session.
export function recoverModuleLoad(error: unknown, storage: Pick<Storage, 'getItem' | 'setItem'>, reload: () => void, now = Date.now()): boolean {
  if (!isModuleLoadError(error)) return false;
  try {
    const previous = storage.getItem(RECOVERY_KEY);
    if (previous !== null && now - Number(previous) < RETRY_WINDOW_MS) return false;
    storage.setItem(RECOVERY_KEY, String(now));
  } catch {
    // Without storage there is no safe way to prevent a reload loop.
    return false;
  }
  reload();
  return true;
}