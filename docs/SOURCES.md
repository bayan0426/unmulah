# Quran text source

The displayed Arabic text for Surah Al-Ikhlas is extracted, without editing, from
the Hafs Uthmanic data file `hafs/data/hafsData_v18.json` in the public
`thetruetruth/quran-data-kfgqpc` repository. That repository identifies the King
Fahd Glorious Quran Printing Complex's Quran developer platform as its upstream
source:

- Official developer platform: <https://qurancomplex.gov.sa/en/techquran/dev/>
- Public mirror: <https://github.com/thetruetruth/quran-data-kfgqpc>
- Pinned mirror commit: `281dbbe8eed1370daa5a023b6cd81655cbfd6473`
- Data file: `hafs/data/hafsData_v18.json`
- Data README version/date: 0.18 / 2021-10-25
- The source-file URL at that commit is
  <https://github.com/thetruetruth/quran-data-kfgqpc/blob/281dbbe8eed1370daa5a023b6cd81655cbfd6473/hafs/data/hafsData_v18.json>
- SHA-256 of the full source JSON file used for extraction:
  `5d8bb91726e482839d0057633cb1973031e4d706fa9604eea5e08892f20ba140`

Only the four `aya_text` fields for Surah 112 are included in this app. Their
Unicode text, diacritics, non-breaking spaces, and verse markers are retained
as supplied by the source. The separate `aya_text_emlaey` field is not used.
No LLM was used to generate, reconstruct, or correct Quran text.

## Reuse and verification status

The public mirror README attributes its contents to the official Complex, but
the mirror's GitHub repository metadata does not declare a license. The
official developer page describes downloadable developer formats, but its
redistribution terms could not be confirmed during this setup. Before public
distribution, verify the official source package and its applicable reuse
terms, and record that decision here. The live UI should not imply that the
third-party mirror itself is an official Complex service.

No tafsir, translation, or comparison normalization is included in Phase 1.