import { ARABIC_SIGN_MODEL_LABELS, VERIFIED_ARABIC_SIGN_LABELS, type ArabicSignModelLabel } from '../data/arabicSignLabels';

type HandLandmark = { x: number; y: number; z: number };

type WeightDescriptor = {
  name: string;
  shape: number[];
  offsetFloats: number;
  length: number;
};

type ModelMetadata = {
  format: string;
  inputShape: number[];
  outputClasses: number;
  weightsFile: string;
  weights: WeightDescriptor[];
};

type ModelWeights = {
  dense1Kernel: Float32Array;
  dense1Bias: Float32Array;
  dense2Kernel: Float32Array;
  dense2Bias: Float32Array;
  outputKernel: Float32Array;
  outputBias: Float32Array;
};

export type ArabicSignPrediction = {
  rawLabel: ArabicSignModelLabel;
  arabicLabel?: string;
  confidence: number;
};

export type ArabicSignInference = {
  prediction: ArabicSignPrediction;
  probabilities: Float32Array;
  outputLength: number;
  predictedIndex: number;
  probabilitySum: number;
};

export type ArabicSignClassifierSelfTest = {
  outputLength: number;
  allFinite: boolean;
  probabilitySum: number;
};

const MODEL_DIRECTORY = '/arabic-sign/model/';
const METADATA_PATH = `${MODEL_DIRECTORY}arabic-sign-mlp.json`;
const EXPECTED_SHAPES: Record<keyof ModelWeights, number[]> = {
  dense1Kernel: [63, 128],
  dense1Bias: [128],
  dense2Kernel: [128, 64],
  dense2Bias: [64],
  outputKernel: [64, 43],
  outputBias: [43],
};

function descriptorFor(metadata: ModelMetadata, name: keyof ModelWeights): WeightDescriptor {
  const descriptor = metadata.weights.find((weight) => weight.name === name);
  const expectedShape = EXPECTED_SHAPES[name];
  const expectedLength = expectedShape.reduce((total, dimension) => total * dimension, 1);

  if (!descriptor || descriptor.length !== expectedLength || descriptor.shape.join(',') !== expectedShape.join(',')) {
    throw new Error(`Arabic sign model has invalid ${name} metadata.`);
  }
  return descriptor;
}

function relu(value: number): number {
  return value > 0 ? value : 0;
}

function dense(input: Float32Array, kernel: Float32Array, bias: Float32Array, activation: (value: number) => number): Float32Array {
  const output = new Float32Array(bias.length);
  for (let outputIndex = 0; outputIndex < bias.length; outputIndex += 1) {
    let total = bias[outputIndex];
    for (let inputIndex = 0; inputIndex < input.length; inputIndex += 1) {
      total += input[inputIndex] * kernel[inputIndex * bias.length + outputIndex];
    }
    output[outputIndex] = activation(total);
  }
  return output;
}

function softmax(logits: Float32Array): Float32Array {
  let maximum = -Infinity;
  for (const value of logits) maximum = Math.max(maximum, value);

  const probabilities = new Float32Array(logits.length);
  let sum = 0;
  for (let index = 0; index < logits.length; index += 1) {
    const exponent = Math.exp(logits[index] - maximum);
    probabilities[index] = exponent;
    sum += exponent;
  }
  for (let index = 0; index < probabilities.length; index += 1) probabilities[index] /= sum;
  return probabilities;
}

export class ArabicSignClassifier {
  private constructor(private readonly weights: ModelWeights) {}

  static async create(): Promise<ArabicSignClassifier> {
    const metadataResponse = await fetch(METADATA_PATH);
    if (!metadataResponse.ok) throw new Error(`Unable to fetch Arabic sign model metadata: ${metadataResponse.status}.`);
    const metadata = await metadataResponse.json() as ModelMetadata;

    if (metadata.format !== 'float32-little-endian' || metadata.inputShape.join(',') !== '1,63' || metadata.outputClasses !== 43) {
      throw new Error('Arabic sign model metadata does not match the expected MLP.');
    }

    const weightsResponse = await fetch(`${MODEL_DIRECTORY}${metadata.weightsFile}`);
    if (!weightsResponse.ok) throw new Error(`Unable to fetch Arabic sign model weights: ${weightsResponse.status}.`);
    const buffer = await weightsResponse.arrayBuffer();
    if (buffer.byteLength % Float32Array.BYTES_PER_ELEMENT !== 0) throw new Error('Arabic sign model weights are not Float32 aligned.');

    const allWeights = new Float32Array(buffer);
    const weightSlice = (name: keyof ModelWeights) => {
      const descriptor = descriptorFor(metadata, name);
      const end = descriptor.offsetFloats + descriptor.length;
      if (end > allWeights.length) throw new Error(`Arabic sign model ${name} extends beyond the weights file.`);
      return allWeights.slice(descriptor.offsetFloats, end);
    };

    console.log('[ArabicSignClassifier] local MLP weights loaded', {
      timestamp: new Date().toISOString(),
      floats: allWeights.length,
    });
    return new ArabicSignClassifier({
      dense1Kernel: weightSlice('dense1Kernel'),
      dense1Bias: weightSlice('dense1Bias'),
      dense2Kernel: weightSlice('dense2Kernel'),
      dense2Bias: weightSlice('dense2Bias'),
      outputKernel: weightSlice('outputKernel'),
      outputBias: weightSlice('outputBias'),
    });
  }

  private probabilities(features: Float32Array): Float32Array {
    const hidden1 = dense(features, this.weights.dense1Kernel, this.weights.dense1Bias, relu);
    const hidden2 = dense(hidden1, this.weights.dense2Kernel, this.weights.dense2Bias, relu);
    return softmax(dense(hidden2, this.weights.outputKernel, this.weights.outputBias, (value) => value));
  }

  selfTest(): ArabicSignClassifierSelfTest {
    const features = new Float32Array(63);
    for (let index = 0; index < features.length; index += 1) features[index] = ((index % 11) - 5) / 10;
    const probabilities = this.probabilities(features);
    const result = {
      outputLength: probabilities.length,
      allFinite: probabilities.every(Number.isFinite),
      probabilitySum: probabilities.reduce((sum, value) => sum + value, 0),
    };
    console.log('[ArabicSignClassifier] self-test complete', result);
    return result;
  }

  predictWithDiagnostics(landmarks: HandLandmark[]): ArabicSignInference {
    if (landmarks.length !== 21) throw new Error('Arabic Sign classifier requires exactly 21 hand landmarks.');

    const features = new Float32Array(63);
    landmarks.forEach(({ x, y, z }, landmarkIndex) => {
      const featureIndex = landmarkIndex * 3;
      features[featureIndex] = x;
      features[featureIndex + 1] = y;
      features[featureIndex + 2] = z;
    });

    const probabilities = this.probabilities(features);

    let classIndex = 0;
    for (let index = 1; index < probabilities.length; index += 1) {
      if (probabilities[index] > probabilities[classIndex]) classIndex = index;
    }
    const rawLabel = ARABIC_SIGN_MODEL_LABELS[classIndex];
    if (!rawLabel) throw new Error('Arabic Sign classifier returned an unknown class index.');

    return {
      prediction: {
        rawLabel,
        arabicLabel: VERIFIED_ARABIC_SIGN_LABELS[rawLabel],
        confidence: probabilities[classIndex],
      },
      probabilities,
      outputLength: probabilities.length,
      predictedIndex: classIndex,
      probabilitySum: probabilities.reduce((sum, value) => sum + value, 0),
    };
  }

  predict(landmarks: HandLandmark[]): ArabicSignPrediction {
    return this.predictWithDiagnostics(landmarks).prediction;
  }
}
