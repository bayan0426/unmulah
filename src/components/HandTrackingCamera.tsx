import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArabicSignClassifier, type ArabicSignPrediction } from '../lib/ArabicSignClassifier';

type CameraState = 'idle' | 'preparing' | 'no-hand' | 'hand-detected' | 'permission-denied' | 'error';
type ClassifierState = 'idle' | 'loading' | 'ready' | 'error';
type HandLandmark = { x: number; y: number; z: number };
type PreprocessingDiagnostic = {
  name: string;
  rawLabel: string;
  confidence: number;
};
export type AcceptedArabicSign = Omit<ArabicSignPrediction, 'arabicLabel'> & {
  rawLabel: string;
  arabicLabel: string | null;
  supportingFrames: number;
  timestamp: number;
};
type StabilityState = 'waiting' | 'verifying' | 'stable';
type FramePrediction = ArabicSignPrediction;
type IntegrationDiagnostics = {
  loadStatus: string;
  loadError: string | null;
  classifierReady: boolean;
  handDetected: boolean;
  landmarkCount: number;
  inferenceCallCount: number;
  lastOutputLength: number | null;
  lastPredictedIndex: number | null;
  lastRawLabel: string | null;
  lastConfidence: number | null;
  selfTest: { outputLength: number; allFinite: boolean; probabilitySum: number } | null;
};

const WASM_PATH = '/mediapipe/wasm';
const MODEL_PATH = '/mediapipe/models/hand_landmarker.task';
const CLASSIFIER_LOAD_TIMEOUT_MS = 15_000;
const STABILITY_WINDOW_SIZE = 12;
const STABILITY_MIN_DOMINANT_FRAMES = 9;
const RELEASE_FRAME_COUNT = 5;
const EMPTY_DIAGNOSTICS: IntegrationDiagnostics = {
  loadStatus: 'لم يبدأ',
  loadError: null,
  classifierReady: false,
  handDetected: false,
  landmarkCount: 0,
  inferenceCallCount: 0,
  lastOutputLength: null,
  lastPredictedIndex: null,
  lastRawLabel: null,
  lastConfidence: null,
  selfTest: null,
};

function logStartup(stage: string, details: Record<string, unknown> = {}): void {
  console.debug(`[HandTrackingCamera] ${stage}`, { timestamp: new Date().toISOString(), ...details });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function isUsableVideo(video: HTMLVideoElement, stream: MediaStream): boolean {
  return video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    && !video.paused
    && stream.getVideoTracks().some((track) => track.readyState === 'live');
}

function waitForUsableVideo(video: HTMLVideoElement, stream: MediaStream, isCurrentRun: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    let timer: number | null = null;
    let timeout: number | null = null;

    const cleanup = () => {
      if (timer !== null) window.clearInterval(timer);
      if (timeout !== null) window.clearTimeout(timeout);
      video.removeEventListener('loadedmetadata', checkVideo);
      video.removeEventListener('loadeddata', checkVideo);
      video.removeEventListener('playing', checkVideo);
    };

    const checkVideo = () => {
      if (!isCurrentRun()) {
        cleanup();
        reject(new DOMException('Camera startup was cancelled.', 'AbortError'));
        return;
      }
      if (isUsableVideo(video, stream)) {
        console.debug('[HandTrackingCamera] video usable', {
          readyState: video.readyState,
          currentTime: video.currentTime,
          trackStates: stream.getVideoTracks().map((track) => track.readyState),
        });
        cleanup();
        resolve();
      }
    };

    video.addEventListener('loadedmetadata', checkVideo);
    video.addEventListener('loadeddata', checkVideo);
    video.addEventListener('playing', checkVideo);
    timer = window.setInterval(checkVideo, 100);
    timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Camera video did not become usable.'));
    }, 10_000);
    checkVideo();
  });
}

function statusText(state: CameraState): string {
  switch (state) {
    case 'preparing': return 'جاري تجهيز الكاميرا';
    case 'no-hand': return 'لم يتم اكتشاف يد';
    case 'hand-detected': return 'تم اكتشاف اليد';
    case 'permission-denied': return 'رفض إذن الكاميرا';
    case 'error': return 'تعذر تشغيل الكاميرا';
    default: return 'الكاميرا غير مفعّلة';
  }
}

function clearCanvas(canvas: HTMLCanvasElement | null): void {
  const context = canvas?.getContext('2d');
  if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
}

function sizeCanvas(canvas: HTMLCanvasElement, video: HTMLVideoElement): CanvasRenderingContext2D | null {
  const rect = video.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * scale));
  const height = Math.max(1, Math.round(rect.height * scale));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext('2d');
  if (context) context.setTransform(scale, 0, 0, scale, 0, 0);
  return context;
}

function drawHand(canvas: HTMLCanvasElement, video: HTMLVideoElement, landmarks: HandLandmark[]): void {
  const context = sizeCanvas(canvas, video);
  if (!context) return;

  const { width, height } = video.getBoundingClientRect();
  context.clearRect(0, 0, width, height);
  context.strokeStyle = '#aee8be';
  context.fillStyle = '#f8f5ee';
  context.lineWidth = 2;

  for (const { start, end } of HandLandmarker.HAND_CONNECTIONS) {
    const first = landmarks[start];
    const second = landmarks[end];
    if (!first || !second) continue;
    context.beginPath();
    context.moveTo(first.x * width, first.y * height);
    context.lineTo(second.x * width, second.y * height);
    context.stroke();
  }

  for (const landmark of landmarks) {
    context.beginPath();
    context.arc(landmark.x * width, landmark.y * height, 3.5, 0, Math.PI * 2);
    context.fill();
  }
}

function handSize(landmarks: HandLandmark[]): number {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  if (!wrist || !middleMcp) return 1;

  const distance = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y, middleMcp.z - wrist.z);
  if (distance > 1e-6) return distance;

  return Math.max(
    1e-6,
    ...landmarks.map((landmark) => Math.hypot(landmark.x - wrist.x, landmark.y - wrist.y, landmark.z - wrist.z)),
  );
}

function wristCenter(landmarks: HandLandmark[]): HandLandmark[] {
  const wrist = landmarks[0];
  return landmarks.map(({ x, y, z }) => ({ x: x - wrist.x, y: y - wrist.y, z: z - wrist.z }));
}

function scaleNormalize(landmarks: HandLandmark[]): HandLandmark[] {
  const size = handSize(landmarks);
  return landmarks.map(({ x, y, z }) => ({ x: x / size, y: y / size, z: z / size }));
}

function mirrored(landmarks: HandLandmark[]): HandLandmark[] {
  return landmarks.map(({ x, y, z }) => ({ x: 1 - x, y, z }));
}

function preprocessingVariants(landmarks: HandLandmark[]): Array<{ name: string; landmarks: HandLandmark[] }> {
  const centered = wristCenter(landmarks);
  const mirroredCentered = wristCenter(mirrored(landmarks));
  return [
    { name: 'خام [x,y,z]', landmarks },
    { name: 'مرآة أفقية [1-x,y,z]', landmarks: mirrored(landmarks) },
    { name: 'متمركز حول الرسغ', landmarks: centered },
    { name: 'رسغ + تطبيع الحجم', landmarks: scaleNormalize(centered) },
    { name: 'مرآة + رسغ + تطبيع الحجم', landmarks: scaleNormalize(mirroredCentered) },
  ];
}

function dominantPrediction(window: FramePrediction[]): { prediction: ArabicSignPrediction; count: number; confidence: number } | null {
  if (window.length === 0) return null;

  const groups = new Map<string, FramePrediction[]>();
  for (const prediction of window) {
    const group = groups.get(prediction.rawLabel) ?? [];
    group.push(prediction);
    groups.set(prediction.rawLabel, group);
  }

  let dominant: FramePrediction[] = [];
  for (const group of groups.values()) {
    if (group.length > dominant.length) dominant = group;
  }
  const latest = dominant[dominant.length - 1];
  return {
    prediction: latest,
    count: dominant.length,
    confidence: dominant.reduce((sum, item) => sum + item.confidence, 0) / dominant.length,
  };
}

export function HandTrackingCamera({
  onAcceptedLetter,
  acceptanceResetKey = 0,
  acceptanceEnabled = true,
}: {
  onAcceptedLetter?: (prediction: AcceptedArabicSign) => void;
  acceptanceResetKey?: number;
  acceptanceEnabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const classifierRef = useRef<ArabicSignClassifier | null>(null);
  const classifierLoadingRef = useRef<Promise<ArabicSignClassifier> | null>(null);
  const inferenceCallCountRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const predictionWindowRef = useRef<FramePrediction[]>([]);
  const acceptedLabelRef = useRef<string | null>(null);
  const noHandFramesRef = useRef(0);
  const acceptanceEnabledRef = useRef(acceptanceEnabled);
  const [state, setState] = useState<CameraState>('idle');
  const [classifierState, setClassifierState] = useState<ClassifierState>('idle');
  const [prediction, setPrediction] = useState<ArabicSignPrediction | null>(null);
  const [handedness, setHandedness] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<IntegrationDiagnostics>(EMPTY_DIAGNOSTICS);
  const [preprocessingDiagnostics, setPreprocessingDiagnostics] = useState<PreprocessingDiagnostic[]>([]);
  const [stabilityState, setStabilityState] = useState<StabilityState>('waiting');
  const [stablePrediction, setStablePrediction] = useState<AcceptedArabicSign | null>(null);

  const resetAcceptance = useCallback(() => {
    predictionWindowRef.current = [];
    acceptedLabelRef.current = null;
    noHandFramesRef.current = 0;
    if (mountedRef.current) {
      setStabilityState('waiting');
      setStablePrediction(null);
    }
  }, []);

  useEffect(() => {
    resetAcceptance();
  }, [acceptanceResetKey, resetAcceptance]);

  useEffect(() => {
    acceptanceEnabledRef.current = acceptanceEnabled;
    if (!acceptanceEnabled) resetAcceptance();
  }, [acceptanceEnabled, resetAcceptance]);

  const stopCamera = useCallback(() => {
    runIdRef.current += 1;
    startingRef.current = false;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    clearCanvas(canvasRef.current);
    inferenceCallCountRef.current = 0;
    predictionWindowRef.current = [];
    acceptedLabelRef.current = null;
    noHandFramesRef.current = 0;
    if (mountedRef.current) {
      setState('idle');
      setPrediction(null);
      setHandedness(null);
      setDiagnostics({ ...EMPTY_DIAGNOSTICS, classifierReady: Boolean(classifierRef.current) });
      setPreprocessingDiagnostics([]);
      setStabilityState('waiting');
      setStablePrediction(null);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    if (startingRef.current || streamRef.current) return;
    startingRef.current = true;
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setState('preparing');
    inferenceCallCountRef.current = 0;
    setDiagnostics({ ...EMPTY_DIAGNOSTICS, classifierReady: Boolean(classifierRef.current) });
    setPreprocessingDiagnostics([]);

    const isCurrentRun = () => runId === runIdRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      });
      console.debug('[HandTrackingCamera] getUserMedia resolved', {
        trackStates: stream.getVideoTracks().map((track) => track.readyState),
      });
      if (!isCurrentRun()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      video.addEventListener('loadedmetadata', () => {
        console.debug('[HandTrackingCamera] video metadata ready', {
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });
      }, { once: true });
      video.addEventListener('playing', () => {
        console.debug('[HandTrackingCamera] video playing', {
          readyState: video.readyState,
          currentTime: video.currentTime,
        });
      }, { once: true });
      video.srcObject = stream;
      void video.play().then(() => {
        console.debug('[HandTrackingCamera] video.play resolved', { readyState: video.readyState });
      }).catch((error: unknown) => {
        console.warn('[HandTrackingCamera] video.play rejected', error);
      });
      await waitForUsableVideo(video, stream, isCurrentRun);
      if (!isCurrentRun()) return;
      if (mountedRef.current) {
        setState('no-hand');
        logStartup('camera active', {
          readyState: video.readyState,
          currentTime: video.currentTime,
          trackStates: stream.getVideoTracks().map((track) => track.readyState),
        });
      }

      const initializeClassifier = () => {
        if (classifierRef.current) {
          if (mountedRef.current) setClassifierState('ready');
          setDiagnostics((current) => ({ ...current, classifierReady: true, loadStatus: 'جاهز (مخزّن محليًا)' }));
          console.log('[HandTrackingCamera] classifier create skipped: cached classifier is ready');
          logStartup('classifier ready (cached)');
          return;
        }
        if (classifierLoadingRef.current) return;

        setClassifierState('loading');
        setDiagnostics((current) => ({ ...current, loadStatus: 'يتم استدعاء ArabicSignClassifier.create()', loadError: null }));
        console.log('[HandTrackingCamera] ArabicSignClassifier.create called');
        logStartup('classifier init start');
        const loadingPromise = ArabicSignClassifier.create();
        classifierLoadingRef.current = loadingPromise;

        void withTimeout(
          loadingPromise,
          CLASSIFIER_LOAD_TIMEOUT_MS,
          'Arabic classifier initialization timed out.',
        ).then((classifier) => {
          if (!isCurrentRun()) return;
          const selfTest = classifier.selfTest();
          if (selfTest.outputLength !== 43 || !selfTest.allFinite || Math.abs(selfTest.probabilitySum - 1) > 1e-5) {
            throw new Error('Arabic classifier self-test did not produce a valid 43-class probability distribution.');
          }
          classifierRef.current = classifier;
          if (mountedRef.current) setClassifierState('ready');
          setDiagnostics((current) => ({
            ...current,
            loadStatus: 'جاهز محليًا',
            loadError: null,
            classifierReady: true,
            selfTest,
          }));
          console.log('[HandTrackingCamera] classifier ready', { selfTest });
          logStartup('classifier ready');
        }).catch((error: unknown) => {
          if (!isCurrentRun()) return;
          if (mountedRef.current) setClassifierState('error');
          const loadError = error instanceof Error ? error.message : String(error);
          setDiagnostics((current) => ({ ...current, loadStatus: 'تعذر التحميل', loadError, classifierReady: false }));
          console.error('[HandTrackingCamera] classifier failed', {
            timestamp: new Date().toISOString(),
            error,
          });
        });

        void loadingPromise.then(
          () => {
            if (classifierLoadingRef.current === loadingPromise) classifierLoadingRef.current = null;
          },
          () => {
            if (classifierLoadingRef.current === loadingPromise) classifierLoadingRef.current = null;
          },
        );
      };

      initializeClassifier();
      logStartup('MediaPipe init start');

      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      if (!isCurrentRun()) {
        landmarker.close();
        return;
      }
      landmarkerRef.current = landmarker;
      logStartup('MediaPipe ready');

      let lastVideoTime = -1;
      const processFrame = () => {
        if (runId !== runIdRef.current || !videoRef.current || !canvasRef.current || !landmarkerRef.current) return;
        const activeVideo = videoRef.current;
        if (activeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && activeVideo.currentTime !== lastVideoTime) {
          const result = landmarkerRef.current.detectForVideo(activeVideo, performance.now());
          lastVideoTime = activeVideo.currentTime;
          const detectedLandmarks = result.landmarks[0];
          const landmarkCount = detectedLandmarks?.length ?? 0;

          if (detectedLandmarks?.length === 21) {
            const handLandmarks = detectedLandmarks.map(({ x, y, z }) => ({ x, y, z }));
            drawHand(canvasRef.current, activeVideo, handLandmarks);
            if (mountedRef.current) {
              setState('hand-detected');
              setHandedness(result.handedness[0]?.[0]?.categoryName ?? null);
              setDiagnostics((current) => ({ ...current, handDetected: true, landmarkCount }));
              if (classifierRef.current) {
                try {
                  const primaryLandmarks = scaleNormalize(wristCenter(handLandmarks));
                  const inference = classifierRef.current.predictWithDiagnostics(primaryLandmarks);
                  const variants = preprocessingVariants(handLandmarks).map((variant) => {
                    const result = classifierRef.current!.predictWithDiagnostics(variant.landmarks);
                    return {
                      name: variant.name,
                      rawLabel: result.prediction.rawLabel,
                      confidence: result.prediction.confidence,
                    };
                  });
                  inferenceCallCountRef.current += 1;
                  setPrediction(inference.prediction);
                  setPreprocessingDiagnostics(variants);
                  noHandFramesRef.current = 0;
                  if (acceptanceEnabledRef.current) {
                    predictionWindowRef.current = [
                      ...predictionWindowRef.current,
                      inference.prediction,
                    ].slice(-STABILITY_WINDOW_SIZE);
                    const dominant = dominantPrediction(predictionWindowRef.current);
                    if (dominant && predictionWindowRef.current.length >= STABILITY_WINDOW_SIZE
                      && dominant.count >= STABILITY_MIN_DOMINANT_FRAMES) {
                      if (acceptedLabelRef.current !== dominant.prediction.rawLabel) {
                        const accepted: AcceptedArabicSign = {
                          ...dominant.prediction,
                          arabicLabel: dominant.prediction.arabicLabel ?? null,
                          confidence: dominant.confidence,
                          supportingFrames: dominant.count,
                          timestamp: Date.now(),
                        };
                        acceptedLabelRef.current = accepted.rawLabel;
                        setStablePrediction(accepted);
                        setStabilityState('stable');
                        onAcceptedLetter?.(accepted);
                        console.log('[HandTrackingCamera] stable letter accepted', accepted);
                      } else {
                        setStabilityState('stable');
                      }
                    } else {
                      setStabilityState('verifying');
                    }
                  } else {
                    predictionWindowRef.current = [];
                    setStabilityState('waiting');
                  }
                  setDiagnostics((current) => ({
                    ...current,
                    classifierReady: true,
                    handDetected: true,
                    landmarkCount,
                    inferenceCallCount: inferenceCallCountRef.current,
                    lastOutputLength: inference.outputLength,
                    lastPredictedIndex: inference.predictedIndex,
                    lastRawLabel: inference.prediction.rawLabel,
                    lastConfidence: inference.prediction.confidence,
                  }));
                  if (inferenceCallCountRef.current === 1) console.log('[HandTrackingCamera] first classifier inference', inference);
                } catch (error) {
                  setPrediction(null);
                  setClassifierState('error');
                  const loadError = error instanceof Error ? error.message : String(error);
                  setDiagnostics((current) => ({ ...current, loadStatus: 'تعذر الاستدلال', loadError }));
                  console.error('[HandTrackingCamera] classifier inference failed', error);
                }
              }
            }
          } else {
            clearCanvas(canvasRef.current);
            if (mountedRef.current) {
              setState('no-hand');
              setPrediction(null);
              setHandedness(null);
              setDiagnostics((current) => ({ ...current, handDetected: false, landmarkCount }));
              setPreprocessingDiagnostics([]);
              predictionWindowRef.current = [];
              noHandFramesRef.current += 1;
              if (noHandFramesRef.current >= RELEASE_FRAME_COUNT) {
                acceptedLabelRef.current = null;
              }
              setStabilityState('waiting');
            }
          }
        }
        frameRef.current = requestAnimationFrame(processFrame);
      };
      processFrame();
    } catch (error) {
      if (!isCurrentRun()) return;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      clearCanvas(canvasRef.current);
      if (mountedRef.current) {
        const name = error instanceof DOMException ? error.name : '';
        setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'permission-denied' : 'error');
      }
    } finally {
      if (isCurrentRun()) startingRef.current = false;
    }
  };

  const isRunning = state === 'preparing' || state === 'no-hand' || state === 'hand-detected';

  return (
    <div className="camera-experience" dir="rtl">
      <div className="camera-preview" aria-live="polite">
        <video ref={videoRef} className="camera-video" playsInline muted aria-label="معاينة الكاميرا" />
        <canvas ref={canvasRef} className="landmark-canvas" aria-hidden="true" />
        {!isRunning && (
          <div className="camera-empty-state">
            <span className="camera-arch" aria-hidden="true">◌</span>
            <strong>{statusText(state)}</strong>
            <span>تتم المعالجة داخل المتصفح فقط</span>
          </div>
        )}
      </div>
      <div className={`camera-status is-${state}`} role="status">{statusText(state)}</div>
      {state === 'hand-detected' && <div className="landmark-count">٢١ نقطة مرسومة فوق المعاينة</div>}
      <section className="stable-prediction" aria-live="polite">
        {stabilityState === 'stable' && stablePrediction ? (
          <>
            <strong>فهمت الإشارة: {stablePrediction.arabicLabel ?? stablePrediction.rawLabel}</strong>
            <span>الثقة الفعلية: {(stablePrediction.confidence * 100).toFixed(1)}% · {stablePrediction.supportingFrames} من {STABILITY_WINDOW_SIZE} إطارًا متفقًا</span>
          </>
        ) : stabilityState === 'verifying' ? (
          <strong>جارٍ التحقق من الإشارة…</strong>
        ) : (
          <strong>بانتظار إشارة ثابتة</strong>
        )}
      </section>
      <section className="prediction-debug" aria-label="تشخيص نموذج الإشارات التجريبي" aria-live="polite">
        <strong>تشخيص النموذج التجريبي</strong>
        <div><span>حالة النموذج</span><b>{classifierState === 'loading' ? 'جاري تحميل النموذج محليًا' : classifierState === 'ready' ? 'جاهز محليًا' : classifierState === 'error' ? 'تعذر تحميل النموذج' : 'لم يبدأ'}</b></div>
        <div><span>اتجاه اليد</span><b dir="ltr">{handedness ?? '—'}</b></div>
        <div><span>الفئة الخام (إطار حالي، رسغ + تطبيع الحجم)</span><b dir="ltr">{prediction?.rawLabel ?? '—'}</b></div>
        <div><span>الحرف العربي الموثّق</span><b>{prediction?.arabicLabel ?? '—'}</b></div>
        <div><span>ثقة النموذج</span><b>{prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : '—'}</b></div>
        <div><span>حالة تحميل المصنّف</span><b>{diagnostics.loadStatus}</b></div>
        <div><span>خطأ التحميل</span><b dir="ltr">{diagnostics.loadError ?? '—'}</b></div>
        <div><span>classifierReady</span><b dir="ltr">{String(diagnostics.classifierReady)}</b></div>
        <div><span>handDetected</span><b dir="ltr">{String(diagnostics.handDetected)}</b></div>
        <div><span>عدد المعالم</span><b dir="ltr">{diagnostics.landmarkCount}</b></div>
        <div><span>عدد استدعاءات الاستدلال</span><b dir="ltr">{diagnostics.inferenceCallCount}</b></div>
        <div><span>طول آخر مخرج</span><b dir="ltr">{diagnostics.lastOutputLength ?? '—'}</b></div>
        <div><span>آخر فهرس متنبأ به</span><b dir="ltr">{diagnostics.lastPredictedIndex ?? '—'}</b></div>
        <div><span>آخر فئة خام</span><b dir="ltr">{diagnostics.lastRawLabel ?? '—'}</b></div>
        <div><span>آخر ثقة</span><b dir="ltr">{diagnostics.lastConfidence === null ? '—' : `${(diagnostics.lastConfidence * 100).toFixed(4)}%`}</b></div>
        <div><span>اختبار المصنّف</span><b dir="ltr">{diagnostics.selfTest ? `43 / finite=${diagnostics.selfTest.allFinite} / sum=${diagnostics.selfTest.probabilitySum.toFixed(6)}` : '—'}</b></div>
      </section>
      <section className="prediction-debug preprocessing-diagnostics" aria-label="تشخيص المعالجة المسبقة المؤقت" aria-live="polite">
        <strong>تشخيص المعالجة المسبقة المؤقت</strong>
        <p>قارِن الفئة الفعلية التي تؤديها بهذه النتائج؛ الثقة وحدها ليست نجاحًا.</p>
        <div><span>اتجاه MediaPipe</span><b dir="ltr">{handedness ?? '—'}</b></div>
        {preprocessingDiagnostics.length === 0 ? (
          <div><span>النتائج</span><b>بانتظار يد مكتشفة ومصنّف جاهز</b></div>
        ) : preprocessingDiagnostics.map((variant) => (
          <div key={variant.name}>
            <span>{variant.name}</span>
            <b dir="ltr">{variant.rawLabel} · {(variant.confidence * 100).toFixed(1)}%</b>
          </div>
        ))}
      </section>
      <div className="camera-controls">
        <button type="button" className="camera-start" onClick={startCamera} disabled={isRunning}>
          تشغيل الكاميرا
        </button>
        <button type="button" className="camera-stop" onClick={stopCamera} disabled={!isRunning}>
          إيقاف الكاميرا
        </button>
      </div>
    </div>
  );
}
