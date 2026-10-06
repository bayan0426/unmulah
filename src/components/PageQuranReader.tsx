import { useEffect, useMemo, useState } from 'react';
import { HandTrackingCamera, type AcceptedArabicSign } from './HandTrackingCamera';
import { compareRecognizedSequence, type RecitationComparison } from '../lib/recitationComparison';
import { deriveLiveRecitationFeedback, reviewableAlignmentOperations } from '../lib/quranLiveRecitation';
import { createRecognitionTargetFromKfgqpc, type KfgqpcRecognitionTarget } from '../lib/quranCoverageAudit';
import { loadKfgqpcSmartRecords, type KfgqpcSmartRecord } from '../data/quran/kfgqpcSmartProvider';
import { arabicDisplayLabelFor } from '../data/arabicSignLabels';

function maskedText(text: string) {
  return Array.from(text).map((character) => /\s/.test(character) ? ' ' : '□').join('');
}

function feedbackText(kind: 'correct' | 'extra' | 'substitution', expected: string | null, recognized: string) {
  if (kind === 'correct') return 'تمت مطابقة الحرف المرجعي، ويُكشف النص الأصلي فقط.';
  if (kind === 'extra') return `زائد: ${arabicDisplayLabelFor(recognized)}`;
  return `المتوقع: ${expected ?? '—'} · تم التعرف: ${arabicDisplayLabelFor(recognized)}`;
}

function operationText(operation: RecitationComparison['operations'][number]) {
  if (operation.type === 'missing') return `مفقود: ${operation.expected ?? '—'}`;
  if (operation.type === 'extra') return `زائد: ${operation.recognized ?? 'غير محسوم'}`;
  return `مستبدل: المتوقع ${operation.expected ?? '—'} · تم التعرف ${operation.recognized ?? 'غير محسوم'}`;
}

export function PageQuranReader() {
  const [records, setRecords] = useState<KfgqpcSmartRecord[] | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<KfgqpcSmartRecord | null>(null);
  const [textHidden, setTextHidden] = useState(false);
  const [active, setActive] = useState<{ record: KfgqpcSmartRecord; target: KfgqpcRecognitionTarget } | null>(null);
  const [sequence, setSequence] = useState<AcceptedArabicSign[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<RecitationComparison | null>(null);
  const [reviewErrors, setReviewErrors] = useState(false);

  useEffect(() => { loadKfgqpcSmartRecords().then(setRecords).catch(() => setRecords([])); }, []);

  const pageRecords = useMemo(() => records?.filter((record) => record.page === page) ?? [], [records, page]);
  const starts = new Set(pageRecords.filter((record, index) => index === 0 || pageRecords[index - 1].sura_no !== record.sura_no).map((record) => record.id));
  const live = active ? deriveLiveRecitationFeedback(active.target.expectedRawLabels, sequence) : { revealedCount: 0, feedback: [] };
  const revealPercent = active ? Math.min(100, (live.revealedCount / active.target.expectedRawLabels.length) * 100) : 0;
  const lastFeedback = live.feedback.at(-1) ?? null;
  const expectedFeedbackCharacter = lastFeedback?.expectedIndex === null || lastFeedback?.expectedIndex === undefined || !active
    ? null
    : Array.from(active.target.normalizedText)[lastFeedback.expectedIndex] ?? null;
  const hasLiveError = Boolean(lastFeedback && lastFeedback.kind !== 'correct');
  const reviewOperations = result ? reviewableAlignmentOperations(result.operations) : [];

  if (!records) return <section className="quran-data-state" aria-live="polite">جارٍ تجهيز النص العثماني…</section>;
  if (records.length === 0) return <section className="quran-data-state is-error" role="alert">تعذر تجهيز النص العثماني المحلي.</section>;

  const target = selected ? createRecognitionTargetFromKfgqpc(selected) : null;
  const startInline = () => {
    if (!selected || !target) return;
    setActive({ record: selected, target });
    setSelected(null); setSequence([]); setResult(null); setFinished(false); setReviewErrors(false);
    setResetKey((value) => value + 1);
  };
  const retry = () => {
    setSequence([]); setResult(null); setFinished(false); setReviewErrors(false);
    setResetKey((value) => value + 1);
  };
  const finish = () => {
    if (!active) return;
    setResult(compareRecognizedSequence(sequence, {
      id: active.target.id,
      label: `${active.record.sura_name_ar} · الآية ${active.record.aya_no}`,
      normalized: active.target.normalizedText,
    }));
    setFinished(true); setReviewErrors(false);
  };

  return <section className="page-quran-reader" dir="rtl" aria-label="عرض الصفحات">
    <header className="page-reader-toolbar">
      <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>السابقة</button>
      <div><span>عرض الصفحات</span><strong>الصفحة {page}</strong></div>
      <div className="page-reader-controls"><button type="button" onClick={() => setTextHidden((value) => !value)}>{textHidden ? 'إظهار النص' : 'إخفاء النص'}</button><button type="button" onClick={() => setPage((value) => Math.min(604, value + 1))} disabled={page === 604}>التالية</button></div>
    </header>
    <div className="page-quran-paper">
      {pageRecords.map((record) => {
        const isActive = active?.record.id === record.id;
        const isMasked = textHidden || isActive;
        return <div className={`page-ayah-flow${isActive ? ' is-inline-recite' : ''}${isActive && hasLiveError ? ' is-needs-review' : ''}`} key={record.id}>
          {starts.has(record.id) && <div className="page-surah-heading">{record.sura_name_ar}</div>}
          <button type="button" onClick={() => !active && setSelected(record)} className="page-ayah-text" aria-label={`خيارات الآية ${record.aya_no}`} disabled={Boolean(active && !isActive)}>
            {isMasked ? <span className="page-mask-wrap"><span className="page-mask">{maskedText(record.aya_text)}</span>{isActive && <span className="page-revealed-official" style={{ clipPath: `inset(0 ${100 - revealPercent}% 0 0)` }}>{record.aya_text}</span>}</span> : <span lang="ar">{record.aya_text}</span>}
            <b aria-hidden="true">۝{record.aya_no}</b>
          </button>
        </div>;
      })}
      <footer>صفحة {page} · الجزء {pageRecords[0]?.jozz}</footer>
    </div>
    {selected && <div className="ayah-sheet-backdrop" onClick={() => setSelected(null)} role="presentation"><section className="ayah-action-sheet" role="dialog" aria-modal="true" aria-label={`خيارات الآية ${selected.aya_no}`} onClick={(event) => event.stopPropagation()}><header><div><p className="eyebrow">خيارات الآية</p><h3>{selected.sura_name_ar} · الآية {selected.aya_no}</h3></div><button type="button" onClick={() => setSelected(null)} aria-label="إغلاق خيارات الآية">×</button></header><p>يمكنك التسميع هنا مباشرة إن كانت حروف الآية مدعومة، أو فتح مساحة المراجعة التفصيلية من النص الذكي.</p>{target ? <button type="button" className="button button-primary" onClick={startInline}>سمّع بالإشارة هنا</button> : <span className="reader-unavailable">التسميع بالإشارة غير متاح لهذه الآية حاليًا بسبب حروف غير مدعومة.</span>}</section></div>}
    {active && <aside className="inline-camera-panel" aria-label="التسميع بالإشارة"><header><div><p className="eyebrow">تسميع مباشر داخل المصحف</p><h2>{active.record.sura_name_ar} · الآية {active.record.aya_no}</h2><span>تم الكشف الصحيح: {live.revealedCount} من {active.target.expectedRawLabels.length}</span></div><button type="button" onClick={() => { setActive(null); retry(); }}>إغلاق</button></header>
      <div className="inline-live-feedback">{lastFeedback ? feedbackText(lastFeedback.kind, expectedFeedbackCharacter, lastFeedback.recognizedRawLabel) : 'جارٍ انتظار الإشارة الثابتة…'}</div>
      <div className="inline-feedback-list" aria-live="polite">{lastFeedback && <div className={`inline-feedback-item is-${lastFeedback.kind}`}>{feedbackText(lastFeedback.kind, expectedFeedbackCharacter, lastFeedback.recognizedRawLabel)}</div>}</div>
      <HandTrackingCamera onAcceptedLetter={(item) => setSequence((items) => [...items, item])} acceptanceResetKey={resetKey} acceptanceEnabled={!finished} allowedRawLabels={active.target.expectedRawLabels} />
      <div className="inline-recite-actions"><button type="button" onClick={retry}>إعادة المحاولة</button><button type="button" onClick={() => setSequence((items) => items.slice(0, -1))} disabled={sequence.length === 0}>تراجع</button><button type="button" onClick={finish} disabled={sequence.length === 0 || finished}>إنهاء المحاولة</button></div>
    </aside>}
    {result && <section className="inline-result-sheet" aria-live="polite"><h2>نتيجة المحاولة</h2><div><span>صحيح <b>{result.correct}</b></span><span>مفقود <b>{result.missing}</b></span><span>زائد <b>{result.extra}</b></span><span>مستبدل <b>{result.substitutions}</b></span><span>نسبة التطابق <b>{(result.accuracy * 100).toFixed(1)}%</b></span></div>{reviewErrors && <ul className="inline-error-list" aria-label="مراجعة الأخطاء">{reviewOperations.length ? reviewOperations.map((operation, index) => <li key={`${operation.type}-${index}`}>{operationText(operation)}</li>) : <li>لا توجد أخطاء للمراجعة.</li>}</ul>}<button type="button" onClick={() => setReviewErrors((value) => !value)}>{reviewErrors ? 'إخفاء الأخطاء' : 'راجع الأخطاء'}</button><button type="button" onClick={retry}>أعد المحاولة</button><button type="button" onClick={() => { setActive(null); retry(); }}>متابعة القراءة</button></section>}
  </section>;
}
