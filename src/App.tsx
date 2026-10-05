import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { HandTrackingCamera, type AcceptedArabicSign } from './components/HandTrackingCamera';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QuranBrowser } from './components/QuranBrowser';
import { SignAccessPage, SourcesPrivacyPage } from './components/InfoPages';
import { DataManagementPage, ProfilePage, ProgressPage, SavedContentPage } from './components/ExperiencePages';
import { LibraryPage } from './components/LibraryPage';
import { HomeExperience } from './components/HomeExperience';
import type { KfgqpcRecognitionTarget } from './lib/quranCoverageAudit';
import { readAccessibilitySettings } from './lib/accessibilitySettings';
import { recordLocalActivity } from './lib/localExperience';
import { quranSource } from './data/surahAlIkhlas';
import { addQuranProgress } from './lib/quranProgress';
import { clearAttemptHistory, readAttemptHistory, removeAttempt, saveAttempt, type LocalAttempt } from './lib/attemptHistory';
import {
  RECITATION_TARGETS,
  allowedRawLabelsForTarget,
  compareAlIkhlasRecitation,
  compareRecognizedSequence,
  getRecitationTarget,
  type RecitationComparison,
  type RecitationTargetId,
} from './lib/recitationComparison';

type Route = '/' | '/quran' | '/surah/al-ikhlas' | '/practice/al-ikhlas' | '/practice/ayah' | '/accessibility' | '/sources' | '/profile' | '/progress' | '/saved' | '/data' | '/library';
const REVIEW_KEY = 'unmulah.reviewed.al-ikhlas';
const DYNAMIC_TARGET_KEY = 'unmulah.dynamic-recitation-target.v1';

function readDynamicTarget(): { target: KfgqpcRecognitionTarget; label: string } | null {
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(DYNAMIC_TARGET_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const value = parsed as Record<string, unknown>;
    const target = value.target as Record<string, unknown> | undefined;
    if (!target || typeof value.label !== 'string' || typeof target.id !== 'string' || typeof target.surahNumber !== 'number' || typeof target.ayahNumber !== 'number' || typeof target.displayText !== 'string' || typeof target.recognitionTargetText !== 'string' || typeof target.normalizedText !== 'string' || !Array.isArray(target.expectedRawLabels) || target.source !== 'kfgqpc-emlaey') return null;
    return { target: target as unknown as KfgqpcRecognitionTarget, label: value.label };
  } catch { return null; }
}

function persistDynamicTarget(target: KfgqpcRecognitionTarget, label: string) {
  try { window.sessionStorage.setItem(DYNAMIC_TARGET_KEY, JSON.stringify({ target, label })); } catch { /* In-memory navigation remains available. */ }
}

function readReviewed(): boolean {
  try {
    return window.localStorage.getItem(REVIEW_KEY) === 'true';
  } catch {
    return false;
  }
}

function Icon({ name, size = 18 }: { name: 'arrow' | 'book' | 'eye' | 'check' | 'leaf'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  if (name === 'arrow') return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
  if (name === 'book') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5V21M8 7h8M8 11h7" /></svg>;
  if (name === 'eye') return <svg {...common}><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 12 4.2 4.2L19 6.5" /></svg>;
  return <svg {...common}><path d="M19.5 4.5c-7.8-.6-13 3.1-13 8.1a6.9 6.9 0 0 0 6.8 6.9c5.2 0 8.1-6.3 6.2-15Z" /><path d="M4.2 20c2.7-4.7 6.1-7.4 11.1-9.6" /></svg>;
}

function AppLink({ href, navigate, children, className, current }: {
  href: Route;
  navigate: (path: Route) => void;
  children: ReactNode;
  className?: string;
  current?: boolean;
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      navigate(href);
    }
  };
  return <a href={href} className={className} onClick={handleClick} aria-current={current ? 'page' : undefined}>{children}</a>;
}

function Header({ navigate, route }: { navigate: (path: Route) => void; route: Route }) {
  const isQuran = route === '/quran' || route === '/surah/al-ikhlas';
  const isPractice = route === '/practice/al-ikhlas' || route === '/practice/ayah';
  const isMore = ['/accessibility', '/saved', '/profile', '/data', '/sources'].includes(route);
  return <><header className="site-header" dir="rtl"><AppLink href="/" navigate={navigate} className="brand" aria-label="أُنملة — الرئيسية"><img src="/brand/unmulah-logo.png" alt="" /><span className="brand-wordmark"><strong>أُنملة</strong><span>تعلم القرآن للجميع</span></span></AppLink><nav className="header-nav" aria-label="التنقل الرئيسي"><AppLink href="/" navigate={navigate} current={route === '/'}>الرئيسية</AppLink><AppLink href="/quran" navigate={navigate} current={isQuran}>القرآن</AppLink><AppLink href="/surah/al-ikhlas" navigate={navigate} current={isPractice}>التسميع</AppLink><AppLink href="/progress" navigate={navigate} current={route === '/progress'}>تقدمي</AppLink><AppLink href="/library" navigate={navigate} current={route === '/library'}>المكتبة</AppLink></nav><details className="header-more"><summary>المزيد</summary><div className="more-menu"><AppLink href="/accessibility" navigate={navigate} current={route === '/accessibility'}>الوصول بالإشارة</AppLink><AppLink href="/saved" navigate={navigate} current={route === '/saved'}>المحفوظات</AppLink><AppLink href="/profile" navigate={navigate} current={route === '/profile'}>ملفي</AppLink><AppLink href="/data" navigate={navigate} current={route === '/data'}>بياناتي</AppLink><AppLink href="/sources" navigate={navigate} current={route === '/sources'}>المصادر</AppLink></div></details></header><nav className="mobile-nav" aria-label="التنقل السريع"><AppLink href="/" navigate={navigate} current={route === '/'}><span>⌂</span>الرئيسية</AppLink><AppLink href="/quran" navigate={navigate} current={isQuran}><span>▤</span>القرآن</AppLink><AppLink href="/surah/al-ikhlas" navigate={navigate} current={isPractice}><span>⌁</span>التسميع</AppLink><AppLink href="/progress" navigate={navigate} current={route === '/progress'}><span>◒</span>تقدمي</AppLink><AppLink href="/profile" navigate={navigate} current={isMore}><span>•••</span>المزيد</AppLink></nav></>;
}

function Breadcrumb({ navigate, label }: { navigate: (path: Route) => void; label: string }) {
  return <div className="breadcrumb"><AppLink href="/" navigate={navigate}>الرئيسية</AppLink><span aria-hidden="true">/</span><AppLink href="/quran" navigate={navigate}>التعلّم</AppLink><span aria-hidden="true">/</span><span>{label}</span></div>;
}

function Footer() {
  return <footer className="page-footer"><span>أُنملة · المرحلة الأولى</span><span>تعلّم على مهل، وراجع بطريقتك</span></footer>;
}

function Home({ navigate, reviewed }: { navigate: (path: Route) => void; reviewed: boolean }) {
  return <><HomeExperience navigate={navigate} reviewed={reviewed} /><Footer /></>;
}

function QuranPage({ navigate, onOpenRecognitionTarget }: { navigate: (path: Route) => void; onOpenRecognitionTarget: (target: KfgqpcRecognitionTarget, label: string) => void }) {
  return <><QuranBrowser onOpenAlIkhlas={() => navigate('/surah/al-ikhlas')} onOpenRecognitionTarget={onOpenRecognitionTarget} /><Footer /></>;
}

function SurahPage({ navigate, reviewed, textHidden, setTextHidden }: {
  navigate: (path: Route) => void;
  reviewed: boolean;
  textHidden: boolean;
  setTextHidden: (value: boolean) => void;
}) {
  return (
    <>
      <main className="surah-page">
        <Breadcrumb navigate={navigate} label="سورة الإخلاص" />
        <div className="surah-titlebar">
          <div><div className="eyebrow">السورة ١١٢</div><h1>{quranSource.surahName}</h1><div className="surah-subtitle">قراءة ثم مساحة مراجعة</div></div>
          <div className="surah-number" aria-label="رقم السورة">١١٢</div>
        </div>
        <section className="surah-card" aria-label="نص سورة الإخلاص">
          {textHidden ? (
            <div className="hidden-reading" role="status">
              <div><Icon name="eye" size={38} /><div>أُخفي النص — استحضر الآيات في ذهنك، ثم انتقل للمراجعة.</div></div>
            </div>
          ) : (
            <div className="verse-list">
              {quranSource.verses.map((verse) => <p className="verse" key={verse.number} lang="ar" dir="rtl">{verse.text}</p>)}
            </div>
          )}
          <div className="text-control-row">
            <button type="button" className="button button-secondary" onClick={() => setTextHidden(!textHidden)} aria-pressed={textHidden}>
              <Icon name="eye" />{textHidden ? 'إظهار النص' : 'إخفاء النص'}
            </button>
          </div>
          <p className="reading-hint">{textHidden ? 'يمكنك إظهار النص متى أردت.' : 'خذ وقتك في القراءة قبل إخفاء النص.'}</p>
        </section>
        <div className="reading-actions">
          <p>{textHidden ? 'النص مخفي الآن. يمكنك بدء مراجعتك البصرية.' : 'أخفِ النص أولًا لتفعيل مساحة المراجعة.'}</p>
          {textHidden
            ? <AppLink href="/practice/al-ikhlas" navigate={navigate} className="disabled-link is-ready">ابدأ المراجعة <Icon name="arrow" /></AppLink>
            : <button type="button" className="disabled-link" disabled aria-disabled="true">ابدأ المراجعة <Icon name="arrow" /></button>}
        </div>
        {reviewed && <p className="reading-hint">سجّلت مراجعة هذه السورة على هذا الجهاز.</p>}
        <div className="source-note">
          النص العربي من بيانات حفص بالرسم العثماني، إصدار 0.18 (2021-10-25)، عبر
          {' '}<a href={quranSource.sourceUrl} target="_blank" rel="noreferrer">{quranSource.sourceName} — منصة المطوّرين</a>.
          {' '}المرآة العامة: <a href={quranSource.mirrorUrl} target="_blank" rel="noreferrer">quran-data-kfgqpc</a>. لم تتم إعادة تحرير النص.
        </div>
        <section className="tafsir-preview" aria-label="التفسير الميسر">
          <div><strong>التفسير الميسر</strong><span>سيظهر هذا القسم عند دمج مصدر موثّق وحقوق استخدام واضحة. لا يُنشأ تفسير تلقائيًا.</span></div>
          <span className="coming-soon">قريبًا</span>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PracticePage({ navigate, reviewed, setReviewed, dynamicTarget, dynamicLabel }: {
  navigate: (path: Route) => void;
  reviewed: boolean;
  setReviewed: (value: boolean) => void;
  dynamicTarget?: KfgqpcRecognitionTarget | null;
  dynamicLabel?: string | null;
}) {
  const [recognizedSequence, setRecognizedSequence] = useState<AcceptedArabicSign[]>([]);
  const [acceptanceResetKey, setAcceptanceResetKey] = useState(0);
  const [attemptFinished, setAttemptFinished] = useState(false);
  const [targetId, setTargetId] = useState<RecitationTargetId>('ayah-1');
  const [comparisonResult, setComparisonResult] = useState<RecitationComparison | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<LocalAttempt[]>(readAttemptHistory);
  const [referenceVisible, setReferenceVisible] = useState(false);
  const [showPracticeIntro, setShowPracticeIntro] = useState(() => {
    try { return window.localStorage.getItem('unmulah_practice_intro_seen') !== 'true'; } catch { return true; }
  });
  const selectedTarget = dynamicTarget ? { id: dynamicTarget.id, label: dynamicLabel ?? `الآية ${dynamicTarget.ayahNumber}`, normalized: dynamicTarget.normalizedText } : getRecitationTarget(targetId);
  const allowedRawLabels = useMemo(() => dynamicTarget ? [...new Set(dynamicTarget.expectedRawLabels)] : allowedRawLabelsForTarget(targetId), [dynamicTarget, targetId]);
  const onAcceptedLetter = useCallback((prediction: AcceptedArabicSign) => {
    setRecognizedSequence((sequence) => [...sequence, prediction]);
  }, []);
  const retry = () => {
    setRecognizedSequence([]);
    setAttemptFinished(false);
    setComparisonResult(null);
    setAcceptanceResetKey((key) => key + 1);
  };
  const undo = () => {
    setRecognizedSequence((sequence) => sequence.slice(0, -1));
    if (attemptFinished) {
      setAttemptFinished(false);
      setComparisonResult(null);
    }
  };
  const finishAttempt = () => {
    const result = dynamicTarget ? compareRecognizedSequence(recognizedSequence, selectedTarget) : compareAlIkhlasRecitation(recognizedSequence, targetId);
    setComparisonResult(result);
    setAttemptHistory(saveAttempt(result));
    recordLocalActivity('attempt');
    addQuranProgress('reviewAttempts', 1);
    setAttemptFinished(true);
  };
  const selectTarget = (nextTargetId: RecitationTargetId) => {
    setTargetId(nextTargetId);
    setComparisonResult(null);
    setAcceptanceResetKey((key) => key + 1);
  };
  const repeatAttempt = (attempt: LocalAttempt) => {
    if (RECITATION_TARGETS.some((target) => target.id === attempt.targetId)) {
      setTargetId(attempt.targetId as RecitationTargetId);
      retry();
    }
  };
  const deleteAttempt = (id: string) => setAttemptHistory((history) => removeAttempt(history, id));
  const deleteAllAttempts = () => {
    if (window.confirm('هل تريد مسح سجل المحاولات المحلي نهائيًا؟')) setAttemptHistory(clearAttemptHistory());
  };
  const dismissPracticeIntro = () => {
    setShowPracticeIntro(false);
    try { window.localStorage.setItem('unmulah_practice_intro_seen', 'true'); } catch { /* Session-only dismissal. */ }
  };

  return (
    <>
      <main className="practice-page">
        <Breadcrumb navigate={navigate} label="مساحة المراجعة" />
        <section className="page-heading">
          <div className="eyebrow">مراجعة بصرية · سورة الإخلاص</div>
          <h1>مساحتك للمراجعة</h1>
          <p>تُثبت الإشارة محليًا بعد اتفاق عدة إطارات متتالية.</p>
        </section>
        <section className="inline-recite-surface" aria-label="سطح المصحف أثناء التسميع">
          <header>
            <div><p className="eyebrow">المصحف حاضر أثناء التسميع</p><h2>{selectedTarget.label}</h2><span>التعرّف والمقارنة محليان في المتصفح. لا تُرسل الكاميرا أو الإشارات.</span></div>
            <button type="button" onClick={() => setReferenceVisible((value) => !value)} aria-pressed={referenceVisible}>{referenceVisible ? 'إخفاء النص' : 'إظهار النص المرجعي'}</button>
          </header>
          {referenceVisible ? (
            dynamicTarget
              ? <p className="inline-target-placeholder">يظل النص الرسمي في عارض القرآن؛ هذا التسميع مرتبط بالآية المختارة.</p>
              : <div className="inline-ayah-reference">{quranSource.verses.map((verse) => <p key={verse.number} lang="ar">{verse.text}</p>)}</div>
          ) : <div className="inline-reference-hidden">النص مخفي للمراجعة. يمكنك إظهاره متى شئت دون أن تتغير نتيجة المقارنة.</div>}
        </section>
        <section className="practice-panel" aria-label="مساحة مراجعة سورة الإخلاص">
          <div className="practice-banner">
            <div><h2>النص مخفي — خذ وقتك</h2><p>تعمل معاينة اليد محليًا داخل المتصفح بعد موافقتك.</p></div>
            <span className="inactive-tag">تتبّع اليد محليًا</span>
          </div>
          <section className="target-selector" aria-label="هدف التسميع">
            <div><strong>هدف التسميع: {selectedTarget.label}</strong><span>مرجع مطبّع من النص المعروض · {selectedTarget.normalized.length} حرفًا</span></div>
            {!dynamicTarget && <select
              value={targetId}
              onChange={(event) => selectTarget(event.target.value as RecitationTargetId)}
              disabled={recognizedSequence.length > 0 || attemptFinished}
              aria-label="اختر هدف التسميع"
            >
              {RECITATION_TARGETS.map((target) => <option value={target.id} key={target.id}>{target.label}</option>)}
            </select>}
          </section>
          <div className="practice-grid">
            <section className="practice-card camera-card">
              <h3>مساحة الكاميرا</h3>
              <p>لن يُطلب إذن الكاميرا إلا عند اختيار تشغيل الكاميرا. لا يتم حفظ أو إرسال أي صور أو فيديو.</p>
              {showPracticeIntro ? <section className="practice-intro" aria-label="قبل البدء"><div><strong>قبل البدء</strong><ol><li>ثبّت الكاميرا أمامك.</li><li>ضع يدك بوضوح داخل الإطار.</li><li>انتظر حتى يتأكد النظام من الإشارة.</li><li>ارفع يدك قليلًا بعد كل حرف لتثبيته.</li></ol></div><button type="button" onClick={dismissPracticeIntro}>فهمت، ابدأ</button></section> : <button type="button" className="show-instructions" onClick={() => setShowPracticeIntro(true)}>عرض التعليمات</button>}
              <HandTrackingCamera
                onAcceptedLetter={onAcceptedLetter}
                acceptanceResetKey={acceptanceResetKey}
                acceptanceEnabled={!attemptFinished}
                allowedRawLabels={allowedRawLabels}
              />
            </section>
            <section className="practice-card transcript-card">
              <h3>سجل الإشارة المباشر</h3>
              <p>تظهر الفئة الخام والثقة الفعلية في تشخيص الكاميرا، بينما تُقبل الإشارة بعد اتفاق نافذة من الإطارات.</p>
              <div className="transcript-placeholder">
                <strong>{attemptFinished ? 'تم إنهاء التسميع لهذه الجلسة' : 'جارٍ التحقق من الإشارة…'}</strong>
                <span>{attemptFinished ? 'تظل النتيجة المعروضة محلية وغير محفوظة.' : 'لن تُقبل نتيجة من إطار واحد، وتُضاف الإشارة الثابتة تلقائيًا.'}</span>
              </div>
            </section>
            <section className="practice-card sequence-card">
              <h3>التسلسل المتعرّف عليه</h3>
              <p>تُضاف الإشارات الثابتة تلقائيًا بعد رفع اليد، ثم تُقارن بمرجع {selectedTarget.label} عند إنهاء التسميع.</p>
              <div className="sequence-slots" aria-label="التسلسل المتعرّف عليه">
                {recognizedSequence.length === 0 ? (
                  <span className="sequence-slot" aria-label="لا توجد إشارات مقبولة">—</span>
                ) : recognizedSequence.map((item) => (
                  <span className="sequence-slot" key={`${item.timestamp}-${item.rawLabel}`} title={`${item.rawLabel} · ${(item.confidence * 100).toFixed(1)}%`}>
                    {item.arabicLabel ?? item.rawLabel}
                  </span>
                ))}
              </div>
            </section>
          </div>
          {comparisonResult && (
            <section className="practice-card comparison-card recitation-result-sheet" aria-live="polite">
              <h3>نتيجة التسميع · {comparisonResult.targetLabel}</h3>
              <div className="comparison-summary">
                <div><span>صحيح</span><strong>{comparisonResult.correct}</strong></div>
                <div><span>ناقص</span><strong>{comparisonResult.missing}</strong></div>
                <div><span>زائد</span><strong>{comparisonResult.extra}</strong></div>
                <div><span>مستبدل</span><strong>{comparisonResult.substitutions}</strong></div>
                <div><span>إجمالي الحروف المتعرّف عليها</span><strong>{comparisonResult.totalRecognizedLetters}</strong></div>
                <div><span>نسبة تطابق المحاولة مع المرجع</span><strong>{(comparisonResult.accuracy * 100).toFixed(1)}%</strong></div>
              </div>
              <p className="comparison-explanation">قد يخطئ نظام التعرّف. النتيجة أداة مساعدة للمراجعة وليست حكمًا شرعيًا أو تقييمًا نهائيًا للحفظ.</p>
              <details className="recognition-details comparison-details">
                <summary>تفاصيل المقارنة</summary>
                <div className="comparison-debug">
                  <div><span>التسلسل المتعرّف عليه</span><b dir="rtl">{comparisonResult.recognizedDebugSequence || '—'}</b></div>
                  <div><span>التسلسل المرجعي المطبّع</span><b dir="rtl">{comparisonResult.expectedNormalized}</b></div>
                  {comparisonResult.unresolved.length > 0 && (
                    <div><span>فئات غير محسومة</span><b dir="ltr">{comparisonResult.unresolved.map((item) => item.rawLabel).join(', ')}</b></div>
                  )}
                </div>
              </details>
              <div className="comparison-actions"><button type="button" onClick={retry}>إعادة تسميع الهدف</button><button type="button" onClick={() => navigate('/quran')}>العودة إلى القرآن</button></div>
            </section>
          )}
          {attemptHistory.length > 0 && <section className="attempt-history" aria-label="محاولاتي الأخيرة">
            <div className="attempt-history-heading"><div><h3>محاولاتي</h3><p>تُحفظ هذه الأرقام على جهازك فقط. لا تُحفظ صور أو فيديو أو بيانات كاميرا.</p></div><button type="button" onClick={deleteAllAttempts}>مسح سجل المحاولات</button></div>
            <div className="attempt-history-list">{attemptHistory.slice(0, 4).map((attempt) => <div className="attempt-history-item" key={attempt.id}><span>{attempt.targetLabel}</span><b>{(attempt.accuracy * 100).toFixed(1)}%</b><small>{new Intl.DateTimeFormat('ar-SA', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(attempt.completedAt))}</small><em>صحيح {attempt.correct} · ناقص {attempt.missing} · زائد {attempt.extra} · مستبدل {attempt.substitutions}</em><div><button type="button" onClick={() => repeatAttempt(attempt)}>إعادة نفس المحاولة</button><button type="button" onClick={() => deleteAttempt(attempt.id)}>حذف المحاولة</button></div></div>)}</div>
          </section>}
          <div className="future-controls" aria-label="عناصر تحكم الإشارة الثابتة">
            <button type="button" onClick={retry} disabled={recognizedSequence.length === 0 && !attemptFinished}>إعادة المحاولة</button>
            <button type="button" onClick={undo} disabled={recognizedSequence.length === 0}>تراجع</button>
            <button type="button" onClick={finishAttempt} disabled={recognizedSequence.length === 0 || attemptFinished}>إنهاء التسميع</button>
          </div>
          <div className="phase-note">تعمل المعالجة والاستدلال والمقارنة محليًا في المتصفح. تُضاف الإشارة الثابتة تلقائيًا إلى التسلسل، ولا يُعاد قبول الإشارة نفسها حتى تُرفع اليد أو تُثبت إشارة مختلفة. لا يوجد حفظ للتسميع في هذه المرحلة.</div>
          <div className="review-toggle">
            <div><strong>هل انتهيت من مراجعتك؟</strong><span>تسجيل يدوي بسيط يُحفظ على هذا الجهاز فقط.</span></div>
            <button type="button" onClick={() => setReviewed(!reviewed)} aria-pressed={reviewed}>{reviewed ? 'إلغاء تسجيل المراجعة' : 'سجّلت مراجعتي'}</button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function App() {
  const [route, setRoute] = useState<Route>(() => {
    const path = window.location.pathname;
    if (path === '/practice/al-ikhlas') {
      window.history.replaceState({}, '', '/surah/al-ikhlas');
      return '/surah/al-ikhlas';
    }
    return path === '/quran' || path === '/surah/al-ikhlas' || path === '/practice/ayah' || path === '/accessibility' || path === '/sources' || path === '/profile' || path === '/progress' || path === '/saved' || path === '/data' || path === '/library' ? path : '/';
  });
  const [reviewed, setReviewed] = useState(readReviewed);
  const [textHidden, setTextHidden] = useState(false);
  const restoredDynamicTarget = readDynamicTarget();
  const [dynamicTarget, setDynamicTarget] = useState<KfgqpcRecognitionTarget | null>(restoredDynamicTarget?.target ?? null);
  const [dynamicTargetLabel, setDynamicTargetLabel] = useState<string | null>(restoredDynamicTarget?.label ?? null);
  const accessibilitySettings = readAccessibilitySettings();
  const updateReviewed = (value: boolean) => {
    setReviewed(value);
    if (value) recordLocalActivity('review');
    try {
      window.localStorage.setItem(REVIEW_KEY, String(value));
    } catch {
      // Progress remains available for this session when storage is unavailable.
    }
  };

  const navigate = (path: Route) => {
    if (path === '/practice/al-ikhlas' && !textHidden) return;
    if (path !== route) {
      window.history.pushState({}, '', path);
      setRoute(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const openRecognitionTarget = (target: KfgqpcRecognitionTarget, label: string) => {
    persistDynamicTarget(target, label); setDynamicTarget(target); setDynamicTargetLabel(label); navigate('/practice/ayah');
  };

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setRoute(path === '/quran' || path === '/surah/al-ikhlas' || path === '/practice/al-ikhlas' || path === '/practice/ayah' || path === '/accessibility' || path === '/sources' || path === '/profile' || path === '/progress' || path === '/saved' || path === '/data' || path === '/library' ? path : '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <ErrorBoundary><div className={`app-shell accessibility-text-${accessibilitySettings.textSize}${accessibilitySettings.highContrast ? ' accessibility-high-contrast' : ''}${accessibilitySettings.reducedMotion ? ' accessibility-reduced-motion' : ''}`}>
      <Header navigate={navigate} route={route} />
      {route === '/' && <Home navigate={navigate} reviewed={reviewed} />}
      {route === '/quran' && <QuranPage navigate={navigate} onOpenRecognitionTarget={openRecognitionTarget} />}
      {route === '/surah/al-ikhlas' && <SurahPage navigate={navigate} reviewed={reviewed} textHidden={textHidden} setTextHidden={setTextHidden} />}
      {route === '/practice/al-ikhlas' && <PracticePage navigate={navigate} reviewed={reviewed} setReviewed={updateReviewed} />}
      {route === '/practice/ayah' && dynamicTarget && <PracticePage navigate={navigate} reviewed={reviewed} setReviewed={updateReviewed} dynamicTarget={dynamicTarget} dynamicLabel={dynamicTargetLabel} />}
      {route === '/practice/ayah' && !dynamicTarget && <><QuranPage navigate={navigate} onOpenRecognitionTarget={openRecognitionTarget} /><Footer /></>}
      {route === '/accessibility' && <><SignAccessPage onOpenAlIkhlas={() => navigate('/surah/al-ikhlas')} /><Footer /></>}
      {route === '/profile' && <><ProfilePage /><Footer /></>}
      {route === '/progress' && <><ProgressPage attempts={readAttemptHistory()} reviewed={reviewed} /><Footer /></>}
      {route === '/saved' && <><SavedContentPage onOpenQuran={() => navigate('/quran')} /><Footer /></>}
      {route === '/data' && <><DataManagementPage /><Footer /></>}
      {route === '/library' && <><LibraryPage /><Footer /></>}
      {route === '/sources' && <><SourcesPrivacyPage /><Footer /></>}
    </div></ErrorBoundary>
  );
}

export default App;
