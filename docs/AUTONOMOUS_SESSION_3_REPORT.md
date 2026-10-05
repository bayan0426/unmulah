# Deep autonomous build session 3

## Official Quran integration

The owner-supplied `kfgqpc_hafs_smart_4.zip` was inspected locally. Its readme
identifies Hafs Smart v0.8 as ayah-level smart-device content, explicitly not a
pixel-perfect printed Madinah Mushaf renderer. The runtime now serves the
unaltered `hafs_smart_v8.json` and supplied `HafsSmart_08.ttf` under
`public/quran/kfgqpc-hafs-smart-v8/`.

- Exactly 6,236 records are required before rendering is enabled.
- First record: Al-Fatihah 1; final record: An-Nas 6.
- `aya_text` is displayed with the official Smart font without normalization.
- `aya_text_emlaey` is only indexed for search; results render `aya_text`.
- JSON and font SHA-256 values are recorded in `SOURCES.md`.

## Three Quran modes

1. **النص العثماني الذكي:** interactive 114-surah official smart-text reader,
   surah selector, ayah metadata, and Emlaey-indexed search.
2. **مصحف المدينة — عرض الصفحات:** responsive official iframe shell plus an
   explicit direct-open fallback. No scraping or security bypass is used.
3. **المصحف الإشاري:** polished Coming Soon destination; no hand imagery or
   unverified sign content is displayed.

The selected view supports `/quran?view=smart`, `mushaf`, or `sign` and is saved
locally when changed. AI-recitation remains Al-Ikhlas-only and its locked
comparison reference remains unchanged.

## Tests and QA

- Added Playwright with Microsoft Edge channel and `npm.cmd run test:e2e`.
- E2E covers home/navigation, normalized catalogue search/filtering, three modes,
  source-reader key Surahs/search metadata, and reading/practice/details/sources/sign access without starting camera.
- Existing unit validation now covers official-format record counts and Emlaey-only search semantics.

## Known external constraint

The official page viewer may be blocked by its site’s frame-ancestors/CSP policy
in some browsers. The direct official-source action is the required safe fallback.

## Final validation

Run before checkpoint: `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, and `npm.cmd run test:e2e`.
