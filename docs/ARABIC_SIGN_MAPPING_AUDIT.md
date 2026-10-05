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

The following are the only raw-label-to-character mappings permitted by the
current verified table:

| Raw class | Arabic character |
|---|---|
| `aleff` | ا |
| `haa` | ح |
| `dal` | د |
| `saad` | ص |
| `fa` | ف |
| `gaaf` | ق |
| `kaaf` | ك |
| `laam` | ل |
| `meem` | م |
| `nun` | ن |
| `ha` | ه |
| `waw` | و |
| `yaa` | ي |

The 11 digit classes and `space` are non-letter classes and are never mapped to
Quranic letters.

## Quran coverage constraint

The KFGQPC display field uses private-use glyphs and is never normalized for
machine comparison. The separate non-displayed Emlaey field contains 32 unique
normalized Arabic characters. The 13 mappings above cover 13/32.

The remaining 19 characters are deliberately unresolved:

```text
ء ب ة ت ث ج خ ذ ر ز س ش ض ط ظ ع غ ؤ ئ
```

Likely-looking raw names such as `bb`, `ta`, `taa`, `thaa`, `jeem`, `khaa`,
`seen`, `sheen`, `dhad`, `toot`, `thal`, `ain`, and `ghain` remain unresolved
until an authoritative class-to-Arabic artifact from the model training source
or a reviewed expert mapping verifies each one. `al`, `dha`, `ha`, and `ya` are
also unresolved because their distinction from Arabic orthographic variants is
not established by the encoder label alone.

Consequently, dynamically generated practice targets are available only for
ayahs whose internal, normalized Emlaey comparison target uses all and only the
13 verified characters. The UI never silently substitutes an unresolved class.
