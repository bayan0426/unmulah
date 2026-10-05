# Importing an official KFGQPC Quran package

1. Download a Hafs/Uthmanic developer package directly from the King Fahd Complex.
2. Confirm its version, official source, and redistribution permission before adding it to this repository.
3. Keep the original package outside this repository until that decision is recorded.
4. Run one of:

```sh
node scripts/import_kfgqpc_quran.mjs path/to/official.json
node scripts/import_kfgqpc_quran.mjs path/to/official.csv src/data/quran/imported-kfgqpc.json
```

The importer accepts only a local JSON or CSV file. JSON must be an array or an
object containing `ayahs`; CSV requires KFGQPC field names including `sura_no`,
`aya_no`, and `aya_text`. Optional documented fields are `jozz`, `page`,
`line_start`, `line_end`, and `sura_name_ar`.

The importer rejects invalid Surah/Ayah/page/juz values, empty text, invalid line
ranges, and duplicate Surah/Ayah keys. It preserves `aya_text` exactly and never
normalizes, repairs, or completes Quran text. Review its error report rather than
editing source content to make it pass.

Generated data is intentionally not automatically registered in the app; a human
must review provenance and then add a provider adapter.
