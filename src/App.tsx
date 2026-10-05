import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { HandTrackingCamera, type AcceptedArabicSign } from './components/HandTrackingCamera';
import { quranSource } from './data/surahAlIkhlas';
import {
  RECITATION_TARGETS,
  allowedRawLabelsForTarget,
  compareAlIkhlasRecitation,
  getRecitationTarget,
  type RecitationComparison,
  type RecitationTargetId,
} from './lib/recitationComparison';

type Route = '/' | '/quran' | '/surah/al-ikhlas' | '/practice/al-ikhlas';
const REVIEW_KEY = 'unmulah.reviewed.al-ikhlas';

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
  return (
    <header className="site-header">
      <AppLink href="/" navigate={navigate} className="brand" aria-label="أُنملة — الرئيسية">
        <img src="/brand/unmulah-logo.png" alt="" />
        <span className="brand-wordmark"><strong>UNMULAH</strong><span>وصول القرآن لكل إنسان</span></span>
      </AppLink>
      <nav className="header-nav" aria-label="التنقل الرئيسي">
        <AppLink href="/" navigate={navigate} current={route === '/'}>الرئيسية</AppLink>
        <AppLink href="/quran" navigate={navigate} current={route === '/quran' || route === '/surah/al-ikhlas' || route === '/practice/al-ikhlas'}>التعلّم</AppLink>
      </nav>
      <div className="header-quiet"><span className="status-dot" />تعلّم ومراجعة على مهل</div>
    </header>
  );
}

function Breadcrumb({ navigate, label }: { navigate: (path: Route) => void; label: string }) {
  return <div className="breadcrumb"><AppLink href="/" navigate={navigate}>الرئيسية</AppLink><span aria-hidden="true">/</span><AppLink href="/quran" navigate={navigate}>التعلّم</AppLink><span aria-hidden="true">/</span><span>{label}</span></div>;
}

function Footer() {
  return <footer className="page-footer"><span>أُنملة · المرحلة الأولى</span><span>تعلّم على مهل، وراجع بطريقتك</span></footer>;
}

function Home({ navigate, reviewed }: { navigate: (path: Route) => void; reviewed: boolean }) {
  return (
    <>
      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <div className="eyebrow">تعلّم القرآن على مهل</div>
            <h1 id="home-title" className="hero-title">تعلّم القرآن<br /><span>خطوةً بخطوة</span></h1>
            <p className="hero-description">ابدأ بسورة الإخلاص. اقرأ النص المعتمد، أخفِه، ثم انتقل إلى مساحة مراجعة تحضيرية.</p>
            <div className="hero-actions">
              <AppLink href="/quran" navigate={navigate} className="button button-primary">ابدأ التعلّم <Icon name="arrow" /></AppLink>
              <AppLink href="/surah/al-ikhlas" navigate={navigate} className="button button-secondary"><Icon name="book" />سورة الإخلاص</AppLink>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="arch-scene">
              <div className="arch-halo" />
              <span className="scene-mark one" />
              <span className="scene-mark two" />
              <div className="hero-emblem"><img src="/brand/unmulah-logo.png" alt="" /></div>
              <div className="orbit-label"><span>مسار اليوم</span><strong>الإخلاص · ٤ آيات</strong></div>
            </div>
          </div>
        </section>
        <section className="home-progress" aria-label="تقدمك">
          <div className="progress-copy">
            <div className="progress-icon"><Icon name={reviewed ? 'check' : 'leaf'} size={19} /></div>
            <div><strong>مراجعتك، كما سجّلتها</strong><span>حالة محلية على هذا الجهاز — دون تقييم آلي</span></div>
          </div>
          <div className={`progress-state${reviewed ? ' is-done' : ''}`}><span className="status-dot" />{reviewed ? 'تم تسجيل المراجعة' : 'لم تُسجّل مراجعة بعد'}</div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function QuranPage({ navigate }: { navigate: (path: Route) => void }) {
  return (
    <>
      <main className="learning-page">
        <Breadcrumb navigate={navigate} label="مسار التعلّم" />
        <section className="page-heading">
          <div className="eyebrow">مسار التعلّم</div>
          <h1>ابدأ بسورة الإخلاص</h1>
          <p>اقرأ النص المعتمد، ثم انتقل إلى مساحة المراجعة التحضيرية.</p>
        </section>
        <div className="learn-layout">
          <article className="surah-feature">
            <div><div className="feature-overline">السورة ١١٢ · ٤ آيات</div><h2>الإخلاص</h2><p>قراءة، إخفاء للنص، ثم مساحة مراجعة.</p></div>
            <AppLink href="/surah/al-ikhlas" navigate={navigate} className="button">افتح السورة <Icon name="arrow" /></AppLink>
          </article>
          <aside className="surah-meta" aria-label="تفاصيل السورة">
            <div className="meta-title">تفاصيل المسار</div>
            <div className="meta-row"><span>السورة</span><strong>الإخلاص</strong></div>
            <div className="meta-row"><span>عدد الآيات</span><strong>٤</strong></div>
            <div className="meta-row"><span>الرواية</span><strong>حفص عن عاصم</strong></div>
          </aside>
        </div>
        <aside className="focus-note">اقرأ كل آية بوقتك. عندما تكون مستعدًا، أخفِ النص وانتقل إلى مساحة المراجعة.</aside>
      </main>
      <Footer />
    </>
  );
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
      </main>
      <Footer />
    </>
  );
}

function PracticePage({ navigate, reviewed, setReviewed }: {
  navigate: (path: Route) => void;
  reviewed: boolean;
  setReviewed: (value: boolean) => void;
}) {
  const [recognizedSequence, setRecognizedSequence] = useState<AcceptedArabicSign[]>([]);
  const [acceptanceResetKey, setAcceptanceResetKey] = useState(0);
  const [attemptFinished, setAttemptFinished] = useState(false);
  const [targetId, setTargetId] = useState<RecitationTargetId>('ayah-1');
  const [comparisonResult, setComparisonResult] = useState<RecitationComparison | null>(null);
  const selectedTarget = getRecitationTarget(targetId);
  const allowedRawLabels = useMemo(() => allowedRawLabelsForTarget(targetId), [targetId]);
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
    setComparisonResult(compareAlIkhlasRecitation(recognizedSequence, targetId));
    setAttemptFinished(true);
  };
  const selectTarget = (nextTargetId: RecitationTargetId) => {
    setTargetId(nextTargetId);
    setComparisonResult(null);
    setAcceptanceResetKey((key) => key + 1);
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
        <section className="practice-panel" aria-label="مساحة مراجعة سورة الإخلاص">
          <div className="practice-banner">
            <div><h2>النص مخفي — خذ وقتك</h2><p>تعمل معاينة اليد محليًا داخل المتصفح بعد موافقتك.</p></div>
            <span className="inactive-tag">تتبّع اليد محليًا</span>
          </div>
          <section className="target-selector" aria-label="هدف التسميع">
            <div><strong>هدف التسميع: {selectedTarget.label}</strong><span>مرجع مطبّع من النص المعروض · {selectedTarget.normalized.length} حرفًا</span></div>
            <select
              value={targetId}
              onChange={(event) => selectTarget(event.target.value as RecitationTargetId)}
              disabled={recognizedSequence.length > 0 || attemptFinished}
              aria-label="اختر هدف التسميع"
            >
              {RECITATION_TARGETS.map((target) => <option value={target.id} key={target.id}>{target.label}</option>)}
            </select>
          </section>
          <div className="practice-grid">
            <section className="practice-card camera-card">
              <h3>مساحة الكاميرا</h3>
              <p>لن يُطلب إذن الكاميرا إلا عند اختيار تشغيل الكاميرا. لا يتم حفظ أو إرسال أي صور أو فيديو.</p>
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
            <section className="practice-card comparison-card" aria-live="polite">
              <h3>نتيجة التسميع · {comparisonResult.targetLabel}</h3>
              <div className="comparison-summary">
                <div><span>صحيح</span><strong>{comparisonResult.correct}</strong></div>
                <div><span>ناقص</span><strong>{comparisonResult.missing}</strong></div>
                <div><span>زائد</span><strong>{comparisonResult.extra}</strong></div>
                <div><span>مستبدل</span><strong>{comparisonResult.substitutions}</strong></div>
                <div><span>إجمالي الحروف المتعرّف عليها</span><strong>{comparisonResult.totalRecognizedLetters}</strong></div>
                <div><span>نسبة تطابق المحاولة مع المرجع</span><strong>{(comparisonResult.accuracy * 100).toFixed(1)}%</strong></div>
              </div>
              <div className="comparison-debug">
                <div><span>التسلسل المتعرّف عليه</span><b dir="rtl">{comparisonResult.recognizedDebugSequence || '—'}</b></div>
                <div><span>التسلسل المرجعي المطبّع</span><b dir="rtl">{comparisonResult.expectedNormalized}</b></div>
                {comparisonResult.unresolved.length > 0 && (
                  <div><span>فئات غير محسومة</span><b dir="ltr">{comparisonResult.unresolved.map((item) => item.rawLabel).join(', ')}</b></div>
                )}
              </div>
            </section>
          )}
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
    return path === '/quran' || path === '/surah/al-ikhlas' ? path : '/';
  });
  const [reviewed, setReviewed] = useState(readReviewed);
  const [textHidden, setTextHidden] = useState(false);
  const updateReviewed = (value: boolean) => {
    setReviewed(value);
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

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setRoute(path === '/quran' || path === '/surah/al-ikhlas' || path === '/practice/al-ikhlas' ? path : '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="app-shell">
      <Header navigate={navigate} route={route} />
      {route === '/' && <Home navigate={navigate} reviewed={reviewed} />}
      {route === '/quran' && <QuranPage navigate={navigate} />}
      {route === '/surah/al-ikhlas' && <SurahPage navigate={navigate} reviewed={reviewed} textHidden={textHidden} setTextHidden={setTextHidden} />}
      {route === '/practice/al-ikhlas' && <PracticePage navigate={navigate} reviewed={reviewed} setReviewed={updateReviewed} />}
    </div>
  );
}

export default App;
