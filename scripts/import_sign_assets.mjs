#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

const [manifestPath, destinationPath = 'public/sign-assets'] = process.argv.slice(2);
if (!manifestPath) fail('Usage: node scripts/import_sign_assets.mjs <local-selection-manifest.json> [destination-folder]');
const manifest = JSON.parse(readFileSync(resolve(manifestPath), 'utf8'));
if (!Array.isArray(manifest.assets)) fail('Manifest must contain an assets array.');
const errors = validate(manifest.assets);
if (errors.length) fail(`Import rejected:\n${errors.map((error) => `- ${error}`).join('\n')}`);
const destination = resolve(destinationPath); mkdirSync(destination, { recursive: true });
const output = manifest.assets.map((asset) => {
  const sourcePath = resolve(asset.sourcePath);
  if (!existsSync(sourcePath)) fail(`Selected asset is missing: ${sourcePath}`);
  const filename = `${asset.rawLabel}${extname(sourcePath).toLowerCase()}`;
  copyFileSync(sourcePath, resolve(destination, filename));
  const { sourcePath: _sourcePath, ...metadata } = asset;
  return { ...metadata, assetPath: `/sign-assets/${filename}` };
});
writeFileSync(resolve(destination, 'manifest.json'), `${JSON.stringify({ schemaVersion: 1, assets: output }, null, 2)}\n`, 'utf8');
console.log(`Imported ${output.length} explicitly selected verified assets into ${destination}.`);

function validate(assets) {
  const errors = []; const letters = new Set(); const labels = new Set();
  assets.forEach((asset, index) => { const entry = index + 1; for (const key of ['arabicLetter', 'rawLabel', 'sourcePath', 'sourceOrganization', 'sourceUrl', 'license', 'attribution']) if (!asset[key]) errors.push(`asset ${entry}: ${key} is required.`); if (asset.verificationStatus !== 'verified') errors.push(`asset ${entry}: verificationStatus must be verified.`); if (letters.has(asset.arabicLetter)) errors.push(`asset ${entry}: duplicate Arabic letter ${asset.arabicLetter}.`); if (labels.has(asset.rawLabel)) errors.push(`asset ${entry}: duplicate raw label ${asset.rawLabel}.`); letters.add(asset.arabicLetter); labels.add(asset.rawLabel); });
  return errors;
}
function fail(message) { console.error(message); process.exit(1); }
