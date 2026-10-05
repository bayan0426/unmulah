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

No tafsir or translation text is included in the application.

## Product Polish status

The Quran browser contains the complete, local catalogue of 114 surah names and
ayah counts. It deliberately contains no Quran text other than the documented
Surah Al-Ikhlas extract above. During this work, automated access to the
official developer resource timed out, so the official complete Hafs package
(including page, line, juz, and ayah metadata) was not downloaded or added.
Consequently, the UI identifies full-surah reading and Mushaf-page browsing as
unavailable until that package and its reuse terms can be verified. No
third-party substitute was added for those features.

The Quran browser and the source/privacy page link to the official King Fahd
Complex developer resource above. The existing local Al-Ikhlas extract retains
the pinned-mirror provenance and licensing caveat documented in this file.

## Local recognition dependencies

- **MediaPipe Tasks Vision** — Google / MediaPipe; <https://www.npmjs.com/package/@mediapipe/tasks-vision>.
  Used for local hand landmarks. Distributed locally with the build under its package terms.
- **Arabic Sign Language Recognition** — katyy2000; <https://huggingface.co/katyy2000/arabic-sign-language-recognition>.
  Used for the local MLP weights and verified encoder order. Model card license: MIT.
- Keras artifact SHA-256 used to export the local MLP weights:
  `f263eba58dfd10c4ea7b8720b4e672f2d2acf230857b87dbbb2499291dd58057`.
- Encoder artifact SHA-256 used to verify the 43-class order:
  `88ee7638cfb47bcf7ca2e4d7fde226fac66789662ee7884dca1d2018c2cc08af`.

Camera frames, landmark processing, model inference, and deterministic
comparison remain in the browser. The current MVP does not upload or record
camera video, and it does not use face recognition. Recognition is assistive
feedback, not Quran interpretation or Quran-text generation.

## Sign-access assets

No sign image or video assets are redistributed by this repository. The local
sign-asset provider is deliberately empty until every asset has provenance,
license, attribution, and verification status recorded.

### Investigated datasets — checked 2026-10-05

- **ASLAD-190K: Arabic Sign Language Alphabet Dataset consisting of 190,000 Images** —
  Boulesnane, GHIRI, and Bellil; <https://data.mendeley.com/datasets/2fgpn5dwgc/2>.
  The Mendeley record reports 32 Arabic-sign alphabet classes and a CC BY 4.0
  license. The record/search result also reports no downloadable files for the
  inspected dataset record. No file was downloaded, copied, or used. Before any
  asset integration, a reviewer must confirm the exact downloadable version,
  license scope, attribution, and suitability for the intended Arabic-letter mapping.
- **ArASL2018** — <https://data.mendeley.com/datasets/y7pckrw6z2/1>.
  License and redistribution permissions were not verified from the source in
  this session. It is not used, downloaded, or redistributed.

Free access or a research-data listing is not treated as permission to ship
individual sign assets. The viewer displays neutral placeholders until a verified
asset record is added.

## Tafsir and official developer packages

The official developer page lists a Tafseer Muyassar package and Hafs datasets
with verse/page/line metadata. It was not downloaded or integrated because the
app has not recorded explicit redistribution terms for the package. No Tafsir
text is present in the app. See the official [developer platform](https://qurancomplex.gov.sa/en/techquran/dev/).

## Religious reference note

The project-supplied reference identifies Permanent Committee fatwa **25465**,
dated **28/7/1433H**, related request **32007536**. The supplied summary reports
that teaching Deaf users through photographic images of a man performing signs
known among specialists may be allowed when needed, and that educational testing
afterward was permitted. This repository does not reproduce the ruling, expand
its scope, or treat it as authorization for unverified sign assets. Human review
of the original Arabic ruling and its provenance is still required.

أُنملة لا تبتكر إشارات شرعية جديدة، وتعتمد في المحتوى الإشاري على مراجع موثقة
ومختصين قدر الإمكان.
