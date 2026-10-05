export const ARABIC_SIGN_MODEL_LABELS = [
  '0', '1', '10', '2', '3', '4', '5', '6', '7', '8', '9',
  'ain', 'al', 'aleff', 'bb', 'dal', 'dha', 'dhad', 'fa', 'gaaf',
  'ghain', 'ha', 'haa', 'jeem', 'kaaf', 'khaa', 'laam', 'meem', 'nun',
  'ra', 'saad', 'seen', 'sheen', 'space', 'ta', 'taa', 'thaa', 'thal',
  'toot', 'waw', 'ya', 'yaa', 'zay',
] as const;

export type ArabicSignModelLabel = (typeof ARABIC_SIGN_MODEL_LABELS)[number];

// Verified against the ArASL class mapping; only verified mappings are exposed to the UI.
export const VERIFIED_ARABIC_SIGN_LABELS: Partial<Record<ArabicSignModelLabel, string>> = {
  aleff: 'ا',
  haa: 'ح',
  dal: 'د',
  saad: 'ص',
  fa: 'ف',
  gaaf: 'ق',
  kaaf: 'ك',
  laam: 'ل',
  meem: 'م',
  nun: 'ن',
  ha: 'ه',
  waw: 'و',
  yaa: 'ي',
};
