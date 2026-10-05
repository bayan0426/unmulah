import { localSignAssetProvider } from './localSignAssetProvider';
import type { SignAsset } from './types';

export function getVerifiedSignAsset(letter: string): SignAsset | null {
  return localSignAssetProvider.getByArabicLetter(letter);
}

export { localSignAssetProvider };
export type { SignAsset, SignAssetProvider } from './types';
