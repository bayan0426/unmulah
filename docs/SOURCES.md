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

## Official KFGQPC Hafs Smart v0.8 — interactive smart text

The product owner supplied the local official archive `kfgqpc_hafs_smart_4.zip`.
The application uses its unedited `hafs_smart_v8.json` and `HafsSmart_08.ttf`:

- Organization: King Fahd Glorious Quran Printing Complex.
- Package: KFGQPC Hafs Uthmanic Data for Smart Phone v0.8.
- Package readme date: 2022-06-30.
- Runtime record count: exactly 6,236; validation rejects any other count.
- Fields used: id, juz, surah/ayah numbers and names, page, line start/end,
  `aya_text`, and `aya_text_emlaey`.
- JSON SHA-256: `a272a119a4272f10cf42d8e389857b469183d3217fa23aa38b6a7331d0ac4aa2`.
- Font SHA-256: `18c5641d1a9433499660122eccc6388bf89b9c8b752e5957aff41a2bed2c976b`.

The package readme states that Hafs Smart is for smart-device, ayah-level
display/search/Tafsir-style applications and is **not** intended to reproduce a
complete printed Madinah Mushaf page exactly. UNMULAH therefore labels this mode
`النص العثماني الذكي`. Display uses the supplied font because `aya_text` contains
the package’s smart-font glyph encoding. `aya_text_emlaey` is used only as a
search index; search results display the untouched official `aya_text`.

The archive was supplied locally by the owner. Its wider redistribution terms
still require owner/legal review before a public distribution decision. This is
separate from the authority and provenance of the supplied content.

## Official Mushaf publication viewer — page view

`صفحات مصحف المدينة` is a **temporary external-reference** shell pointing to
the official publication viewer: <https://qurancomplex.gov.sa/isdarat-hafs/#flipbook-df_11311/1/>.
It is not presented as the application's primary interactive Mushaf. The
in-app, ayah-interactive reading experience is the supplied Hafs Smart text.
The official developer platform also describes a separate vector digital copy
of the Madinah Mushaf for application use, but those files and their applicable
reuse decision have not been supplied to this repository. If the official site
blocks framing through CSP or frame ancestors policy, the app provides an
explicit direct-open fallback and does not bypass browser security or scrape
the viewer.

## Sign Mushaf

No full sign Quran or verified reusable full fingerspelling asset source is
integrated. `المصحف الإشاري` remains Coming Soon and is intentionally distinct
from both official KFGQPC viewing modes.

## Local recognition dependencies

- **MediaPipe Tasks Vision** — Google / MediaPipe; <https://www.npmjs.com/package/@mediapipe/tasks-vision>.
  Used for local hand landmarks. Distributed locally with the build under its package terms.
- **Arabic Sign Language Recognition** — katyy2000; <https://huggingface.co/katyy2000/arabic-sign-language-recognition>.
  Used for the local MLP weights and verified encoder order. Model card license: MIT.
- Keras artifact SHA-256 used to export the local MLP weights:
  `f263eba58dfd10c4ea7b8720b4e672f2d2acf230857b87dbbb2499291dd58057`.
- Encoder artifact SHA-256 used to verify the 43-class order:
  `88ee7638cfb47bcf7ca2e4d7fde226fac66789662ee7884dca1d2018c2cc08af`.
- The strict verified/unresolved mapping boundary is recorded in
  [`ARABIC_SIGN_MAPPING_AUDIT.md`](ARABIC_SIGN_MAPPING_AUDIT.md). It avoids
  treating raw English label names as proof of Arabic-letter identity.

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

The official developer page lists a Tafseer Muyassar package and describes it
as developer content for desktop, mobile, browser applications, and research.
It was not downloaded or integrated because the app has not recorded the exact
package download, checksum, and redistribution decision. No Tafsir text is
present in the app. See the official [developer platform](https://qurancomplex.gov.sa/en/techquran/dev/).

## Quran audio

The smart reader uses the official public [MP3Quran developer API](https://www.mp3quran.net/ar/api)
at runtime; no audio is bundled or preloaded. It queries the official timing-read
list for Hafs reads with 114 surahs over HTTPS, then exposes only those verified
records. Ahmed bin Ali Al-Ajmi, Hafs `read=5`, is the default because the API
reports all 114 surahs and per-ayah timing. Faisal Al-Hajri and Abdulbadi
Ghaylan are separately included only as official full-Hafs audio records without
ayah timing; their UI truthfully limits controls to full-surah playback.
Audio and timing requests are made only after an explicit play action. The API's
timing data is used as supplied for seeking, repeat, range repeat, and the
active-ayah indicator; no boundary is estimated. Reuse terms for downloaded or
redistributed audio remain unverified, so no media asset is copied into this
repository.

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
