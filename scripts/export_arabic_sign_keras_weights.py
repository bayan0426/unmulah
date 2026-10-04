"""Export the pretrained Arabic-sign Keras MLP into browser-local Float32 assets.

Requires only numpy and h5py:
  python export_arabic_sign_keras_weights.py path/to/model.keras public/arabic-sign/model
"""

from __future__ import annotations

import argparse
import hashlib
import json
import tempfile
import zipfile
from pathlib import Path

import h5py
import numpy as np


SOURCE_URL = (
    "https://huggingface.co/katyy2000/arabic-sign-language-recognition/"
    "resolve/main/asl_mediapipe_new_version.keras"
)
SOURCE_REPOSITORY = "katyy2000/arabic-sign-language-recognition"
SOURCE_LICENSE = "MIT"
WEIGHT_SPECS = (
    # This Windows-authored Keras archive stores the layer paths with literal backslashes.
    ("dense1Kernel", r"layers\dense/vars/0", (63, 128)),
    ("dense1Bias", r"layers\dense/vars/1", (128,)),
    ("dense2Kernel", r"layers\dense_1/vars/0", (128, 64)),
    ("dense2Bias", r"layers\dense_1/vars/1", (64,)),
    ("outputKernel", r"layers\dense_2/vars/0", (64, 43)),
    ("outputBias", r"layers\dense_2/vars/1", (43,)),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("keras_model", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(dir=args.output_dir) as temporary_directory:
        archive_directory = Path(temporary_directory)
        with zipfile.ZipFile(args.keras_model) as archive:
            archive.extract("model.weights.h5", archive_directory)

        arrays: list[tuple[str, np.ndarray]] = []
        with h5py.File(archive_directory / "model.weights.h5", "r") as weights_file:
            for name, dataset_path, expected_shape in WEIGHT_SPECS:
                array = np.asarray(weights_file[dataset_path], dtype="<f4")
                if array.shape != expected_shape:
                    raise ValueError(f"{dataset_path} has shape {array.shape}; expected {expected_shape}.")
                arrays.append((name, array))

    binary_path = args.output_dir / "arabic-sign-mlp.f32"
    metadata_path = args.output_dir / "arabic-sign-mlp.json"

    offset_floats = 0
    metadata_weights = []
    with binary_path.open("wb") as binary_file:
        for name, array in arrays:
            flattened = array.reshape(-1)
            binary_file.write(flattened.tobytes())
            metadata_weights.append(
                {"name": name, "shape": list(array.shape), "offsetFloats": offset_floats, "length": flattened.size}
            )
            offset_floats += flattened.size

    metadata = {
        "format": "float32-little-endian",
        "architecture": "63 -> Dense(128, relu) -> Dense(64, relu) -> Dense(43, softmax)",
        "inputShape": [1, 63],
        "outputClasses": 43,
        "weightsFile": binary_path.name,
        "weights": metadata_weights,
        "source": {
            "repository": SOURCE_REPOSITORY,
            "url": SOURCE_URL,
            "license": SOURCE_LICENSE,
            "kerasSha256": sha256(args.keras_model),
        },
    }
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
