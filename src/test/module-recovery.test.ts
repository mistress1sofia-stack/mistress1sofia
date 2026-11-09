import { describe, expect, it, vi } from 'vitest';
import { recoverModuleLoad } from '@/lib/module-recovery';

function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
describe('Failed module recovery', () => {
  it.each(['Importing a module script failed.', 'Failed to fetch dynamically imported module: /assets/auth.js'])('reloads for %s', (message) => {
    const reload = vi.fn();
    expect(recoverModuleLoad(new Error(message), storage(), reload, 100000)).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });
  it('does not loop when the module still fails after reload', () => {
    const saved = storage(); const reload = vi.fn(); const error = new Error('Importing a module script failed.');
    recoverModuleLoad(error, saved, reload, 100000);
    expect(recoverModuleLoad(error, saved, reload, 100001)).toBe(false);
    expect(reload).toHaveBeenCalledOnce();
  });
  it('does not reload unrelated errors', () => {
    const reload = vi.fn();
    expect(recoverModuleLoad(new Error('Invalid password'), storage(), reload, 100000)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});