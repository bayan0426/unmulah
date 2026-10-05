export type ImportedQuranAyah = {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  juz?: number;
  page?: number;
  lineStart?: number;
  lineEnd?: number;
  surahName?: string;
};

export function validateImportedQuranAyahs(records: readonly ImportedQuranAyah[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  records.forEach((record, index) => {
    const location = `record ${index + 1}`;
    if (!Number.isInteger(record.surahNumber) || record.surahNumber < 1 || record.surahNumber > 114) errors.push(`${location}: surah number must be an integer from 1 to 114.`);
    if (!Number.isInteger(record.ayahNumber) || record.ayahNumber < 1) errors.push(`${location}: ayah number must be a positive integer.`);
    if (typeof record.text !== 'string' || record.text.length === 0) errors.push(`${location}: Quran text must be a non-empty string.`);
    for (const [name, value] of [['juz', record.juz], ['page', record.page], ['lineStart', record.lineStart], ['lineEnd', record.lineEnd]] as const) {
      if (value !== undefined && (!Number.isInteger(value) || value < 1)) errors.push(`${location}: ${name} must be a positive integer when supplied.`);
    }
    if (record.lineStart !== undefined && record.lineEnd !== undefined && record.lineStart > record.lineEnd) errors.push(`${location}: lineStart cannot exceed lineEnd.`);
    const key = `${record.surahNumber}:${record.ayahNumber}`;
    if (seen.has(key)) errors.push(`${location}: duplicate surah/ayah key ${key}.`);
    seen.add(key);
  });
  return errors;
}
