# Feature status

| Capability | Status | Scope / boundary |
|---|---|---|
| Searchable Quran catalogue | Implemented | 114 names and ayah counts; no unverified text added. |
| Al-Ikhlas reading | Implemented | Existing documented local Uthmanic Hafs text. |
| AI sign recitation | Implemented | Al-Ikhlas MVP only; local browser processing. |
| Target-constrained decoding | Implemented | Retains original model probabilities. |
| Deterministic comparison | Implemented | Fixed trusted target, no LLM. |
| Local attempt history | Implemented | Metadata only in browser localStorage. |
| Full official Quran import | Implemented | 6,236 owner-supplied official Hafs Smart records, verified at load time; smart-font display and Emlaey-only search. |
| Interactive Quran reading | Implemented | Native responsive Smart Quran reader with ayah metadata and contextual actions. |
| Quran-wide AI targets | Blocked | The supplied Smart `aya_text` uses private-use font glyphs in all 6,236 records; no official glyph-to-Arabic comparison map is bundled. |
| Mushaf page browsing | Partial | Temporary official external reference only; native page viewer awaits supplied/reviewed official vector assets. |
| Tafsir Muyassar | Coming Soon | No Tafsir text is bundled. |
| Fingerspelling image/video assets | Partial | Provider/viewer/importer ready; no assets included. |
| Meaning interpretation in sign language | Coming Soon | Separate from fingerspelling. |
| Audio recitation | Coming Soon | No audio source or assets included. |
| Learn before reciting | Coming Soon | Depends on verified sign assets. |
| Gamification | Coming Soon | Out of current MVP scope. |
