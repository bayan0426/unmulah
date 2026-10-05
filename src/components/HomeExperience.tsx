import { readLocalProfile, readLocalActivities } from '../lib/localExperience';
import { readQuranProgress } from '../lib/quranProgress';

type HomeRoute = '/' | '/quran' | '/surah/al-ikhlas' | '/progress';

type Props = {
  navigate: (path: HomeRoute) => void;
  reviewed: boolean;
};

function formatMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes} د` : 'ابدأ اليوم';
}

export function HomeExperience({ navigate, reviewed }: Props) {
  const profile = readLocalProfile();
  const quranProgress = readQuranProgress();
  const activities = readLocalActivities();
  const recentActivity = activities[0];
  const isSignFirst = profile.accessibility === 'sign-first' || profile.hearing === 'deaf-sign';

  const welcome = isSignFirst
    ? 'مساحة قرآنية تبدأ بالقراءة المرئية، وتفتح التسميع بالإشارة حين تكون الآية مدعومة.'
    : profile.goal === 'memorize'
      ? 'اقرأ واستمع وراجع في مسار واحد هادئ يحفظ ما تختاره محليًا على جهازك.'
      : 'ابدأ من القرآن، واختر الطريقة التي تناسب قراءتك أو استماعك أو مراجعتك.';

  return (
    <main className="home-flagship" dir="rtl">
      <section className="home-path-hero" aria-labelledby="home-title">
        <div className="home-path-lines" aria-hidden="true"><i /><i /><i /></div>
        <div className="home-path-copy">
          <p className="home-kicker">مسار أُنملة</p>
          <h1 id="home-title">رحلتك مع القرآن،<br /><em>بطريقتك.</em></h1>
          <p className="home-intro">{welcome}</p>
          <div className="home-primary-actions">
            <button type="button" className="home-open-quran" onClick={() => navigate('/quran')}>
              <span>افتح القرآن</span><small>قراءة، استماع، أو مراجعة</small>
            </button>
            <button type="button" className="home-quiet-action" onClick={() => navigate('/surah/al-ikhlas')}>
              <span aria-hidden="true">⌁</span> سمّع بالإشارة
            </button>
          </div>
        </div>

        <aside className="home-today-card" aria-label="ملخص اليوم">
          <div className="today-heading"><span>خطوة اليوم</span><b>على مهل</b></div>
          <div className="today-metric"><strong>{formatMinutes(quranProgress.readingSeconds)}</strong><span>قراءة نشطة مسجلة محليًا</span></div>
          <div className="today-state">
            <span className={reviewed ? 'today-dot is-complete' : 'today-dot'} />
            {reviewed ? 'سُجّلت مراجعة للإخلاص' : 'لم تُسجّل مراجعة بعد'}
          </div>
          {recentActivity && <small className="today-history">آخر نشاط محفوظ على هذا الجهاز</small>}
        </aside>
      </section>

      <section className="home-next-journey" aria-labelledby="next-journey-title">
        <div>
          <p className="home-kicker">الخطوة التالية</p>
          <h2 id="next-journey-title">اجعل المصحف هو نقطة البداية</h2>
          <p>تظل القراءة أمامك، ثم تضيف إليها الاستماع أو التسميع عندما تختار ذلك.</p>
        </div>
        <button type="button" className="home-text-link" onClick={() => navigate('/quran')}>انتقل إلى المصحف <span aria-hidden="true">←</span></button>
      </section>

      <section className="home-route-map" aria-label="طرق التعلم المتاحة">
        <article className="route-card route-card-reading">
          <span className="route-number">١</span>
          <div><p>قراءة</p><h2>نص قرآني واسع ومهيأ للقراءة</h2><small>سجّل وقت القراءة النشط بدل احتساب فتح الصفحة فقط.</small></div>
          <button type="button" onClick={() => navigate('/quran')}>ابدأ القراءة</button>
        </article>
        <article className="route-card route-card-listen">
          <span className="route-number">٢</span>
          <div><p>استمع</p><h2>تلاوة مع قارئ تختاره</h2><small>يبقى المصحف حاضرًا أثناء الاستماع عندما تتوفر التوقيتات.</small></div>
          <button type="button" onClick={() => navigate('/quran')}>اختر قارئًا</button>
        </article>
        <article className="route-card route-card-sign">
          <span className="route-number">٣</span>
          <div><p>سمّع بالإشارة</p><h2>ابدأ من سورة الإخلاص</h2><small>التعرّف المحلي متاح حاليًا للمسار المدعوم فقط.</small></div>
          <button type="button" onClick={() => navigate('/surah/al-ikhlas')}>افتح التسميع</button>
        </article>
      </section>

      <section className="home-progress-ribbon" aria-label="تقدمك المحلي">
        <div><span>ختمة التلاوة</span><strong>{formatMinutes(quranProgress.readingSeconds)}</strong><small>وقت قراءة نشط</small></div>
        <div><span>ختمة الاستماع</span><strong>{formatMinutes(quranProgress.listeningSeconds)}</strong><small>وقت استماع</small></div>
        <div><span>المراجعة والتسميع</span><strong>{quranProgress.reviewAttempts}</strong><small>محاولة مسجلة</small></div>
        <button type="button" onClick={() => navigate('/progress')}>عرض تقدمي</button>
      </section>
    </main>
  );
}
