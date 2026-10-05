import { readLocalProfile } from '../lib/localExperience';
import { readQuranProgress } from '../lib/quranProgress';

type HomeRoute = '/' | '/quran' | '/surah/al-ikhlas' | '/progress';
type Props = { navigate: (path: HomeRoute) => void; reviewed: boolean };

function formatMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes} د` : '—';
}

export function HomeExperience({ navigate, reviewed }: Props) {
  const profile = readLocalProfile();
  const quranProgress = readQuranProgress();
  const hasActivity = quranProgress.readingSeconds + quranProgress.listeningSeconds + quranProgress.reviewAttempts > 0 || reviewed;
  const isSignFirst = profile.accessibility === 'sign-first' || profile.hearing === 'deaf-sign';
  const welcome = isSignFirst ? 'القرآن حاضر أولًا، مع أدوات وصول وتسميع بالإشارة للآيات المدعومة.' : 'اقرأ، استمع، وراجع من مساحة قرآنية واحدة على جهازك.';

  return <main className="home-flagship" dir="rtl">
    <section className="home-path-hero" aria-labelledby="home-title">
      <div className="home-path-lines" aria-hidden="true"><i /><i /><i /></div>
      <div className="home-path-copy">
        <p className="home-kicker">أُنملة</p>
        <h1 id="home-title">رحلتك مع القرآن،<br /><em>بطريقتك.</em></h1>
        <p className="home-intro">{welcome}</p>
        <div className="home-primary-actions">
          <button type="button" className="home-open-quran" onClick={() => navigate('/quran')}><span>افتح القرآن</span><small>قراءة واستماع وتسميع بالإشارة</small></button>
          {hasActivity && <button type="button" className="home-quiet-action" onClick={() => navigate('/quran')}>تابع من حيث توقفت <span aria-hidden="true">←</span></button>}
        </div>
      </div>
      <aside className="home-today-card" aria-label="ملخص النشاط المحلي">
        <div className="today-heading"><span>نشاطك المحلي</span><b>هذا الجهاز</b></div>
        <div className="today-metric"><strong>{formatMinutes(quranProgress.readingSeconds)}</strong><span>قراءة نشطة</span></div>
        <div className="today-state"><span className={reviewed ? 'today-dot is-complete' : 'today-dot'} />{reviewed ? 'سُجلت مراجعة' : 'ابدأ بخطوة هادئة'}</div>
      </aside>
    </section>
    <section className="home-progress-ribbon" aria-label="تقدمك المحلي">
      <div><span>التلاوة</span><strong>{formatMinutes(quranProgress.readingSeconds)}</strong><small>قراءة نشطة</small></div>
      <div><span>الاستماع</span><strong>{formatMinutes(quranProgress.listeningSeconds)}</strong><small>وقت استماع</small></div>
      <div><span>المراجعة / التسميع</span><strong>{quranProgress.reviewAttempts}</strong><small>محاولة مسجلة</small></div>
      <button type="button" onClick={() => navigate('/progress')}>عرض تقدمي</button>
    </section>
    <section className="home-quiet-note"><span aria-hidden="true">•</span><p>تظهر أدوات الاستماع والتسميع داخل مساحة القرآن بعد اختيار الآية المناسبة.</p></section>
  </main>;
}
