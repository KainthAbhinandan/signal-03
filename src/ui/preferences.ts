export type Preferences = { muted: boolean; volume: number };
const KEY = 'signal-03.preferences.v1';
export function loadPreferences(): Preferences {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (typeof value === 'object' && value !== null && 'muted' in value && 'volume' in value
      && typeof value.muted === 'boolean' && typeof value.volume === 'number' && Number.isFinite(value.volume)) {
      return { muted: value.muted, volume: Math.max(0, Math.min(1, value.volume)) };
    }
  } catch { /* Storage is optional, including in private or restricted browsing. */ }
  return { muted: false, volume: 0.35 };
}
export function savePreferences(preferences: Preferences): void {
  try { localStorage.setItem(KEY, JSON.stringify(preferences)); } catch { /* Gameplay never depends on storage. */ }
}
