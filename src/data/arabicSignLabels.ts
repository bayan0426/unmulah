export const ARABIC_SIGN_MODEL_LABELS = [
  '0', '1', '10', '2', '3', '4', '5', '6', '7', '8', '9',
  'ain', 'al', 'aleff', 'bb', 'dal', 'dha', 'dhad', 'fa', 'gaaf',
  'ghain', 'ha', 'haa', 'jeem', 'kaaf', 'khaa', 'laam', 'meem', 'nun',
  'ra', 'saad', 'seen', 'sheen', 'space', 'ta', 'taa', 'thaa', 'thal',
  'toot', 'waw', 'ya', 'yaa', 'zay',
] as const;

export type ArabicSignModelLabel = (typeof ARABIC_SIGN_MODEL_LABELS)[number];

// Verified against the published ArASL class map. `al` is a compound token (ال),
// so it remains outside the character-by-character Quran comparison map.
export const VERIFIED_ARABIC_SIGN_LABELS: Partial<Record<ArabicSignModelLabel, string>> = {
  ain: 'ع',
  aleff: 'ا',
  bb: 'ب',
  haa: 'ح',
  khaa: 'خ',
  dal: 'د',
  thal: 'ذ',
  ra: 'ر',
  zay: 'ز',
  seen: 'س',
  sheen: 'ش',
  saad: 'ص',
  dhad: 'ض',
  ta: 'ط',
  dha: 'ظ',
  ghain: 'غ',
  fa: 'ف',
  gaaf: 'ق',
  kaaf: 'ك',
  laam: 'ل',
  meem: 'م',
  nun: 'ن',
  ha: 'ه',
  waw: 'و',
  ya: 'ئ',
  yaa: 'ي',
  jeem: 'ج',
  thaa: 'ث',
  taa: 'ت',
  toot: 'ة',
};

/** Presentation-only conversion for Arabic-facing UI. Raw class labels stay internal. */
export function arabicDisplayLabelFor(rawLabel: string): string {
  return VERIFIED_ARABIC_SIGN_LABELS[rawLabel as ArabicSignModelLabel] ?? 'غير معروف';
}
