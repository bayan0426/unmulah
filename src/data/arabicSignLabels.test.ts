import { describe, expect, it } from 'vitest';
import { arabicDisplayLabelFor, VERIFIED_ARABIC_SIGN_LABELS } from './arabicSignLabels';

describe('verified ArASL class map', () => {
  it('keeps the documented single-character classes and excludes the compound al token', () => {
    expect(VERIFIED_ARABIC_SIGN_LABELS).toMatchObject({ bb: 'ب', taa: 'ت', thaa: 'ث', jeem: 'ج', haa: 'ح', khaa: 'خ', thal: 'ذ', ra: 'ر', zay: 'ز', seen: 'س', sheen: 'ش', dhad: 'ض', ta: 'ط', dha: 'ظ', ain: 'ع', ghain: 'غ', toot: 'ة', ya: 'ئ' });
    expect(VERIFIED_ARABIC_SIGN_LABELS.al).toBeUndefined();
  });

  it('maps internal labels to verified Arabic display characters and fails safely', () => {
    expect(arabicDisplayLabelFor('bb')).toBe('ب');
    expect(arabicDisplayLabelFor('haa')).toBe('ح');
    expect(arabicDisplayLabelFor('not-a-model-label')).toBe('غير معروف');
  });
});
