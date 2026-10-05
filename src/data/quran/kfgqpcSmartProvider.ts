import { validateImportedQuranAyahs, type ImportedQuranAyah } from './importValidation';
import type { QuranAyah, QuranSourceProvenance, QuranSurahContent } from './types';

export type KfgqpcSmartRecord = {
  id: number;
  jozz: number;
  sura_no: number;
  sura_name_en: string;
  sura_name_ar: string;
  page: number;
  line_start: number;
  line_end: number;
  aya_no: number;
  aya_text: string;
  aya_text_emlaey: string;
};

export const KFGQPC_SMART_SOURCE: QuranSourceProvenance = {
  id: 'kfgqpc-hafs-smart-v8',
  organization: 'King Fahd Glorious Quran Printing Complex',
  title: 'KFGQPC Hafs Uthmanic Data for Smart Phone v0.8',
  url: 'https://qurancomplex.gov.sa/en/techquran/dev/',
  license: 'Official package supplied by product owner; redistribution review required',
  redistribution: 'not-verified',
  notes: 'Official package dated 2022-06-30. Aya-level smart display only; not a pixel-perfect Mushaf page renderer.',
};

const DATA_URL = '/quran/kfgqpc-hafs-smart-v8/hafs_smart_v8.json';
const EXPECTED_RECORD_COUNT = 6236;

let cached: Promise<KfgqpcSmartRecord[]> | null = null;

export function loadKfgqpcSmartRecords(fetcher: typeof fetch = fetch): Promise<KfgqpcSmartRecord[]> {
  cached ??= fetcher(DATA_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`KFGQPC Smart data failed to load (${response.status}).`);
      return response.json() as Promise<unknown>;
    })
    .then((payload) => validateSmartRecords(payload));
  return cached;
}

export function validateSmartRecords(payload: unknown): KfgqpcSmartRecord[] {
  if (!Array.isArray(payload)) throw new Error('KFGQPC Smart data must be an array.');
  if (payload.length !== EXPECTED_RECORD_COUNT) throw new Error(`KFGQPC Smart data must contain ${EXPECTED_RECORD_COUNT} records; received ${payload.length}.`);
  const records = payload.map((value, index) => normalizeRecord(value, index + 1));
  const validationErrors = validateImportedQuranAyahs(records.map(toImportedAyah));
  if (validationErrors.length) throw new Error(`KFGQPC Smart data validation failed: ${validationErrors.join(' ')}`);
  if (records[0]?.id !== 1 || records.at(-1)?.id !== EXPECTED_RECORD_COUNT) throw new Error('KFGQPC Smart data has an unexpected record sequence.');
  return records;
}

export function getSmartSurah(records: readonly KfgqpcSmartRecord[], surahNumber: number): QuranSurahContent | null {
  const selected = records.filter((record) => record.sura_no === surahNumber);
  if (selected.length === 0) return null;
  return {
    surahNumber,
    name: selected[0].sura_name_ar,
    riwaya: 'حفص عن عاصم',
    script: 'الرسم العثماني الذكي',
    ayahs: selected.map(toQuranAyah),
    source: KFGQPC_SMART_SOURCE,
  };
}

export function searchSmartQuran(records: readonly KfgqpcSmartRecord[], query: string): KfgqpcSmartRecord[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  return records.filter((record) => normalizeSearch(record.aya_text_emlaey).includes(normalized));
}

export function normalizeSearch(value: string): string {
  return value.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ـ/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeRecord(value: unknown, index: number): KfgqpcSmartRecord {
  if (!value || typeof value !== 'object') throw new Error(`KFGQPC Smart record ${index} is not an object.`);
  const raw = value as Record<string, unknown>;
  const numeric = (key: string) => {
    const value = raw[key];
    if (typeof value !== 'number' || !Number.isInteger(value)) throw new Error(`KFGQPC Smart record ${index} has invalid ${key}.`);
    return value;
  };
  const text = (key: string) => {
    const value = raw[key];
    if (typeof value !== 'string' || value.length === 0) throw new Error(`KFGQPC Smart record ${index} has invalid ${key}.`);
    return value;
  };
  return { id: numeric('id'), jozz: numeric('jozz'), sura_no: numeric('sura_no'), sura_name_en: text('sura_name_en'), sura_name_ar: text('sura_name_ar'), page: numeric('page'), line_start: numeric('line_start'), line_end: numeric('line_end'), aya_no: numeric('aya_no'), aya_text: text('aya_text'), aya_text_emlaey: text('aya_text_emlaey') };
}

function toImportedAyah(record: KfgqpcSmartRecord): ImportedQuranAyah {
  return { surahNumber: record.sura_no, ayahNumber: record.aya_no, text: record.aya_text, juz: record.jozz, page: record.page, lineStart: record.line_start, lineEnd: record.line_end, surahName: record.sura_name_ar };
}

function toQuranAyah(record: KfgqpcSmartRecord): QuranAyah {
  return { surahNumber: record.sura_no, ayahNumber: record.aya_no, text: record.aya_text, juz: record.jozz, page: record.page, lineStart: record.line_start, lineEnd: record.line_end };
}
