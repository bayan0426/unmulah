# Product expansion session 4

## Delivered Quran interaction

- The official Smart Quran reader now gives each ayah an accessible contextual
  action sheet. It keeps Quran display text separate from the unavailable
  tafsir, audio, fingerspelling, and sign-tafsir features.
- Al-Ikhlas keeps its existing trusted route to the locked, local recitation
  experience. Other ayahs explicitly remain unavailable for AI recitation
  until their target letters can be verified.
- The dialog closes by its close action, backdrop, or Escape key. Its E2E test
  verifies that unavailable services are shown truthfully.

## Quran-wide recitation coverage audit

`src/lib/quranCoverageAudit.ts` only creates a generic recitation target from
actual Arabic display text when every normalized Arabic letter maps to a
verified raw classifier label. It never reads `aya_text_emlaey` for this
purpose.

The owner-supplied Hafs Smart JSON uses private-use glyphs in `aya_text` and
depends on its supplied display font. A direct JSON audit found this in all
6,236 records. The audit therefore reports zero auditable Arabic characters,
zero fully supported ayahs, and an explicit display-encoding blocker; it does
not treat the Emlaey search field as a substitute for Quran display text. This
prevents an unsupported claim of Quran-wide AI recitation coverage.

## Deferred external content

Audio, tafsir, and a digital page-native Mushaf need a source with explicit
reuse terms and integration details. They remain unavailable rather than being
filled with unverified assets, embedded scraped content, or generated Quranic
material.
