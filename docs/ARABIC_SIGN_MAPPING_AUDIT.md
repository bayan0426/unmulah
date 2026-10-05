# Arabic-sign label mapping audit

Reviewed: 2026-10-05. This audit is intentionally conservative: an English raw
class name is not evidence of an Arabic-letter mapping by itself.

## Model evidence

The installed model comes from
[`katyy2000/arabic-sign-language-recognition`](https://huggingface.co/katyy2000/arabic-sign-language-recognition),
licensed MIT. Its model card documents one 63-feature MediaPipe-hand-landmark
input and labels for Arabic letters, numbers, and space. The local model export
uses the upstream `encoder.pkl` SHA-256 recorded in `SOURCES.md`.

Exact ordered encoder classes (indices 0–42):

```text
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9,
ain, al, aleff, bb, dal, dha, dhad, fa, gaaf, ghain, ha, haa,
jeem, kaaf, khaa, laam, meem, nun, ra, saad, seen, sheen, space,
ta, taa, thaa, thal, toot, waw, ya, yaa, zay
```

`laam` is the encoder spelling at index 26. It is retained verbatim in code.

## Verified local map

The following raw-label-to-character mappings are permitted by the current
verified table. The upstream encoder has the same named 32 sign classes as the
published ArASL class list; its independent digits and `space` remain outside
this mapping.

| Raw class | Arabic character |
|---|---|
| `aleff` | ا |
| `bb` | ب |
| `taa` | ت |
| `thaa` | ث |
| `jeem` | ج |
| `haa` | ح |
| `khaa` | خ |
| `dal` | د |
| `thal` | ذ |
| `ra` | ر |
| `zay` | ز |
| `seen` | س |
| `sheen` | ش |
| `saad` | ص |
| `dhad` | ض |
| `ta` | ط |
| `dha` | ظ |
| `ain` | ع |
| `ghain` | غ |
| `fa` | ف |
| `gaaf` | ق |
| `kaaf` | ك |
| `laam` | ل |
| `meem` | م |
| `nun` | ن |
| `ha` | ه |
| `waw` | و |
| `ya` | ئ |
| `yaa` | ي |
| `toot` | ة |

The 11 digit classes and `space` are non-letter classes and are never mapped to
Quranic letters.

## Quran coverage constraint

The KFGQPC display field uses private-use glyphs and is never normalized for
machine comparison. The separate non-displayed Emlaey field contains 32 unique
normalized Arabic characters. The verified single-character mappings now cover
30/32 (including `ئ` and `ة`). The compound `al` class is deliberately not
used by character-by-character comparison.

The remaining two characters are deliberately unresolved:

```text
ء ؤ
```

`al` is a compound "ال" sign rather than one Arabic character, so it remains
outside the character-by-character target vocabulary. The model has no direct
class for standalone hamza or waw-with-hamza. The app does not normalize either
to another character for comparison.

Consequently, dynamically generated practice targets are available only for
ayahs whose internal, normalized Emlaey comparison target excludes `ء` and `ؤ`.
The UI never silently substitutes an unresolved class. With the supplied 6,236
records, the resulting coverage is 4,610 ayahs (73.9256%) across all 114 surahs.
