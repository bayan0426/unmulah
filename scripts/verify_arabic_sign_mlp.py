"""Run a deterministic synthetic inference check against exported Arabic-sign MLP weights."""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
MODEL_DIRECTORY = ROOT / "public" / "arabic-sign" / "model"


def main() -> None:
    metadata = json.loads((MODEL_DIRECTORY / "arabic-sign-mlp.json").read_text(encoding="utf-8"))
    all_weights = np.fromfile(MODEL_DIRECTORY / "arabic-sign-mlp.f32", dtype="<f4")
    weights = {
        item["name"]: all_weights[item["offsetFloats"] : item["offsetFloats"] + item["length"]].reshape(item["shape"])
        for item in metadata["weights"]
    }

    features = np.asarray([((index % 11) - 5) / 10 for index in range(63)], dtype=np.float32)
    hidden1 = np.maximum(features @ weights["dense1Kernel"] + weights["dense1Bias"], 0)
    hidden2 = np.maximum(hidden1 @ weights["dense2Kernel"] + weights["dense2Bias"], 0)
    logits = hidden2 @ weights["outputKernel"] + weights["outputBias"]
    exponentials = np.exp(logits - logits.max())
    probabilities = exponentials / exponentials.sum()

    labels_source = (ROOT / "src" / "data" / "arabicSignLabels.ts").read_text(encoding="utf-8")
    labels_block = labels_source.split("ARABIC_SIGN_MODEL_LABELS = [", 1)[1].split("] as const", 1)[0]
    labels = re.findall(r"'([^']+)'", labels_block)
    predicted_index = int(probabilities.argmax())

    assert probabilities.shape == (43,)
    assert np.isfinite(probabilities).all()
    assert abs(float(probabilities.sum()) - 1.0) < 1e-6
    assert len(labels) == 43
    assert labels[predicted_index]

    print(
        json.dumps(
            {
                "outputLength": int(probabilities.size),
                "allFinite": bool(np.isfinite(probabilities).all()),
                "probabilitySum": float(probabilities.sum()),
                "predictedIndex": predicted_index,
                "mappedLabel": labels[predicted_index],
                "confidence": float(probabilities[predicted_index]),
            }
        )
    )


if __name__ == "__main__":
    main()
