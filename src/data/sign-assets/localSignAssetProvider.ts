import type { SignAsset, SignAssetProvider } from './types';

// Intentionally empty until a source and redistribution terms are verified.
const verifiedAssets: readonly SignAsset[] = [];

export const localSignAssetProvider: SignAssetProvider = {
  id: 'local-verified-sign-assets',
  getByArabicLetter: (letter) => verifiedAssets.find((asset) => asset.arabicLetter === letter) ?? null,
  list: () => verifiedAssets,
};
