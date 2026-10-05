export type SavedQuranAyah = { id: string; kind: 'quran-ayah'; surahNumber: number; surahName: string; ayahNumber: number; page: number; juz: number; savedAt: string };

const KEY = 'unmulah.saved-content.v1';

export function readSavedContent(storage: Storage = window.localStorage): SavedQuranAyah[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(KEY) ?? '[]');
    return Array.isArray(value) ? value.filter(isSavedQuranAyah) : [];
  } catch { return []; }
}

export function saveQuranAyah(item: Omit<SavedQuranAyah, 'id' | 'kind' | 'savedAt'>, storage: Storage = window.localStorage): SavedQuranAyah[] {
  const saved = readSavedContent(storage);
  const id = `quran:${item.surahNumber}:${item.ayahNumber}`;
  if (saved.some((entry) => entry.id === id)) return saved;
  const next = [{ ...item, id, kind: 'quran-ayah' as const, savedAt: new Date().toISOString() }, ...saved];
  write(next, storage);
  return next;
}

export function removeSavedContent(id: string, storage: Storage = window.localStorage): SavedQuranAyah[] {
  const next = readSavedContent(storage).filter((entry) => entry.id !== id);
  write(next, storage);
  return next;
}

export function clearSavedContent(storage: Storage = window.localStorage): SavedQuranAyah[] { write([], storage); return []; }

function write(value: SavedQuranAyah[], storage: Storage) { try { storage.setItem(KEY, JSON.stringify(value)); } catch { /* Keep the visible state only. */ } }
function isSavedQuranAyah(value: unknown): value is SavedQuranAyah { if (!value || typeof value !== 'object') return false; const item = value as Record<string, unknown>; return item.kind === 'quran-ayah' && typeof item.id === 'string' && typeof item.surahNumber === 'number' && typeof item.surahName === 'string' && typeof item.ayahNumber === 'number' && typeof item.page === 'number' && typeof item.juz === 'number' && typeof item.savedAt === 'string'; }
