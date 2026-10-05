#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const [inputPath, outputPath = 'src/data/quran/imported-kfgqpc.json'] = process.argv.slice(2);
if (!inputPath) fail('Usage: node scripts/import_kfgqpc_quran.mjs <official-json-or-csv> [output-json]');

const input = resolve(inputPath);
const extension = extname(input).toLowerCase();
const source = readFileSync(input, 'utf8');
const rows = extension === '.json' ? parseJson(source) : extension === '.csv' ? parseCsv(source) : fail('Only local .json and .csv source files are supported.');
const ayahs = rows.map((row, index) => toAyah(row, index + 1));
const errors = validate(ayahs);
if (errors.length) fail(`Import rejected; source text was not modified:\n${errors.map((error) => `- ${error}`).join('\n')}`);

const destination = resolve(outputPath);
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, `${JSON.stringify({ schemaVersion: 1, sourceFile: input, ayahs }, null, 2)}\n`, 'utf8');
console.log(`Imported ${ayahs.length} ayahs without normalization or text edits to ${destination}`);

function parseJson(value) {
  const parsed = JSON.parse(value);
  const rows = Array.isArray(parsed) ? parsed : parsed.ayahs;
  if (!Array.isArray(rows)) fail('JSON must be an array or an object with an ayahs array.');
  return rows;
}
function parseCsv(value) {
  const lines = value.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) fail('CSV must contain a header and at least one row.');
  const header = csvLine(lines[0]);
  return lines.slice(1).map((line) => Object.fromEntries(header.map((key, index) => [key, csvLine(line)[index] ?? ''])));
}
function csvLine(line) {
  const values = []; let value = ''; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { values.push(value); value = ''; }
    else value += char;
  }
  values.push(value); return values;
}
function toAyah(row, rowNumber) {
  const number = (name, required = false) => { const value = row[name]; if ((value === '' || value === undefined) && !required) return undefined; const numeric = Number(value); if (!Number.isInteger(numeric)) throw new Error(`row ${rowNumber}: ${name} must be an integer.`); return numeric; };
  return { surahNumber: number('sura_no', true), ayahNumber: number('aya_no', true), text: row.aya_text, juz: number('jozz'), page: number('page'), lineStart: number('line_start'), lineEnd: number('line_end'), surahName: row.sura_name_ar };
}
function validate(ayahs) {
  const errors = []; const keys = new Set();
  ayahs.forEach((ayah, index) => { const row = index + 1; if (ayah.surahNumber < 1 || ayah.surahNumber > 114) errors.push(`row ${row}: sura_no must be 1–114.`); if (ayah.ayahNumber < 1) errors.push(`row ${row}: aya_no must be positive.`); if (typeof ayah.text !== 'string' || ayah.text.length === 0) errors.push(`row ${row}: aya_text is required and must not be changed.`); for (const field of ['juz', 'page', 'lineStart', 'lineEnd']) if (ayah[field] !== undefined && ayah[field] < 1) errors.push(`row ${row}: ${field} must be positive.`); if (ayah.lineStart && ayah.lineEnd && ayah.lineStart > ayah.lineEnd) errors.push(`row ${row}: line_start exceeds line_end.`); const key = `${ayah.surahNumber}:${ayah.ayahNumber}`; if (keys.has(key)) errors.push(`row ${row}: duplicate ${key}.`); keys.add(key); });
  return errors;
}
function fail(message) { console.error(message); process.exit(1); }
