import { describe, expect, it } from 'vitest';
import { searchSmartQuran, validateSmartRecords } from './kfgqpcSmartProvider';

const records = Array.from({ length: 6236 }, (_, index) => ({
  id: index + 1, jozz: 1, sura_no: 1, sura_name_en: 'Test', sura_name_ar: 'اختبار', page: 1, line_start: 1, line_end: 1,
  aya_no: index + 1, aya_text: `DISPLAY_${index + 1}`, aya_text_emlaey: index === 0 ? 'الاخلاص اختبار' : `test ${index + 1}`,
}));

describe('KFGQPC Smart provider validation', () => {
  it('requires every one of the 6,236 official-format records', () => {
    expect(validateSmartRecords(records)).toHaveLength(6236);
    expect(() => validateSmartRecords(records.slice(0, -1))).toThrow(/6236/);
  });

  it('uses only the Emlaey index for normalized searching while retaining display text', () => {
    const found = searchSmartQuran(records, 'الإخلاص');
    expect(found).toHaveLength(1);
    expect(found[0].aya_text).toBe('DISPLAY_1');
  });
});
