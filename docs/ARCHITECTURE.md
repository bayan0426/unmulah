# Architecture

## Recognition and comparison

The working recognition pipeline is deliberately isolated from presentation code:

```text
Explicit camera action
  → browser MediaStream
  → MediaPipe Hand Landmarker
  → one hand / 21 landmarks
  → wrist-centered, scale-normalized [x0,y0,z0,...] vector
  → local pretrained MLP
  → complete 43-class softmax vector
  → target-vocabulary constrained candidate (original probability retained)
  → 9-of-12 temporal stabilization
  → candidate
  → five no-hand frames / release
  → commit accepted sequence item
  → deterministic Levenshtein-style reference alignment
```

The MLP, normalization, model labels, confidence calculation, constrained
decoding, stabilization, and candidate/release/commit behavior are locked core
logic. Presentation components do not change their decisions.

Each accepted item retains the model raw label, verified Arabic mapping when
available, original confidence, and timestamp. Comparison uses only accepted
items. Confidence is never used to alter an already accepted comparison result.

## Local-first privacy

`HandTrackingCamera` starts `getUserMedia` only after the explicit Arabic camera
action. MediaPipe, landmark drawing, the MLP, and alignment run in the browser.
The application does not record or upload video, frames, landmarks, or face data.
No face-recognition feature exists.

The optional local attempt history stores only target label, timestamp, count
summary, and alignment percentage in `localStorage`. It never stores camera or
biometric material.

## Quran content

`src/data/quran/types.ts` defines provider types with source provenance,
redistribution state, verse, juz, page, and line metadata fields. The only
registered provider today is `trustedAlIkhlasProvider`, which exposes the
existing documented local Surah Al-Ikhlas content. `getLocalQuranSurah` provides
a stable seam for a future official King Fahd Complex import.

No provider invents missing Quran text. Pages and readers explicitly report when
official content is not installed.

## Sign-asset content

`src/data/sign-assets` defines `SignAsset` and `SignAssetProvider`, including
letter/raw-label mapping, source URL, organization, license, attribution, local
path, and verification status. The local provider is intentionally empty until
redistributable assets are verified. `FingerspellingViewer` therefore renders a
neutral Arabic-letter placeholder and a clear availability notice; it never
creates or implies a hand sign.

## No generated religious content

Quran comparison is dynamic programming over a fixed, documented reference. It
does not use an LLM. Quran text and Tafsir are not generated, corrected, or
completed by AI. Tafsir UI stays unavailable until a trusted source is integrated.
