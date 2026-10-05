import { describe, expect, it } from 'vitest';
import { validateSignAssets } from './validation';
import type { SignAsset } from './types';

const asset: SignAsset = { arabicLetter: 'ا', rawLabel: 'aleff', mediaType: 'image', assetPath: '/sign-assets/alef.png', sourceOrganization: 'Example', sourceUrl: 'https://example.test', license: 'CC BY 4.0', attribution: 'Example', verificationStatus: 'verified' };

describe('sign asset manifest validation', () => {
  it('accepts a complete verified mapping', () => expect(validateSignAssets([asset])).toEqual([]));
  it('rejects pending and duplicate mappings', () => {
    expect(validateSignAssets([{ ...asset, verificationStatus: 'pending' }]).join('\n')).toMatch(/verified/);
    expect(validateSignAssets([asset, { ...asset, assetPath: '/sign-assets/duplicate.png' }]).join('\n')).toMatch(/duplicate/);
  });
});
