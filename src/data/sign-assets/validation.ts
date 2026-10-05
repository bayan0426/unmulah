import type { SignAsset } from './types';

export function validateSignAssets(assets: readonly SignAsset[]): string[] {
  const errors: string[] = [];
  const letters = new Set<string>();
  const labels = new Set<string>();
  assets.forEach((asset, index) => {
    const location = `asset ${index + 1}`;
    for (const [name, value] of Object.entries({ arabicLetter: asset.arabicLetter, rawLabel: asset.rawLabel, assetPath: asset.assetPath, sourceOrganization: asset.sourceOrganization, sourceUrl: asset.sourceUrl, license: asset.license, attribution: asset.attribution })) if (!value) errors.push(`${location}: ${name} is required.`);
    if (asset.verificationStatus !== 'verified') errors.push(`${location}: only verified assets may be published.`);
    if (letters.has(asset.arabicLetter)) errors.push(`${location}: duplicate Arabic-letter mapping ${asset.arabicLetter}.`);
    if (labels.has(asset.rawLabel)) errors.push(`${location}: duplicate raw-label mapping ${asset.rawLabel}.`);
    letters.add(asset.arabicLetter); labels.add(asset.rawLabel);
  });
  return errors;
}
