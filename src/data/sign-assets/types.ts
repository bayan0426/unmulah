import type { ArabicSignModelLabel } from '../arabicSignLabels';

export type SignAsset = {
  arabicLetter: string;
  rawLabel: ArabicSignModelLabel;
  mediaType: 'image' | 'video';
  assetPath: string;
  sourceOrganization: string;
  sourceUrl: string;
  license: string;
  attribution: string;
  verificationStatus: 'verified' | 'pending';
};

export interface SignAssetProvider {
  readonly id: string;
  getByArabicLetter(letter: string): SignAsset | null;
  list(): readonly SignAsset[];
}
