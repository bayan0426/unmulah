import { useEffect, useMemo, useState } from 'react';
import type { LocalAttempt } from '../lib/attemptHistory';
import type { LocalActivity } from '../lib/localExperience';
import type { QuranProgress } from '../lib/quranProgress';
import { createProgressJourney, type MilestoneState } from '../lib/progressJourney';

type Props = { activities: LocalActivity[]; attempts: LocalAttempt[]; quranProgress: QuranProgress };

const number = new Intl.NumberFormat('ar-SA');

function metricText(kind: string, value: number) {
  if (kind === 'reading' || kind === 'listening') return value ? `${number.format(value)} د` : 'لم يبدأ بعد';
  if (kind === 'sign' || kind === 'review') return value ? number.format(value) : '0';
  return value ? number.format(value) : '0';
}

function statusText(status: MilestoneState['status']) {
  return ({ completed: 'مكتملة', current: 'المحطة الحالية', upcoming: 'قريبًا', locked: 'مغلقة' }[status]);
}

export function ProgressJourneyPage({ activities, attempts, quranProgress }: Props) {
  const journey = useMemo(() => createProgressJourney(activities, attempts, quranProgress), [activities, attempts, quranProgress]);
  const [showDetails, setShowDetails] = useState(false);
  const [selected, setSelected] = useState<MilestoneState | null>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const { metrics, stage, nodes, nextMilestone } = journey;
  const stageNumber = journey.stages.findIndex((item) => item.id === stage.id) + 1;
  const tracks = [
    { id: 'memorization', title: 'الحفظ', icon: '⌁', value: 'لم تتوفر جلسات حفظ موثقة بعد', progress: 0, note: 'سيظهر التقدم هنا عند توفر سجل حفظ موثوق.' },
    { id: 'reading', title: 'القراءة', icon: '▤', value: metricText('reading', metrics.readingMinutes), progress: Math.min(100, metrics.readingMinutes * 10), note: metrics.readingMinutes ? 'وقت قراءة نشط مسجل محليًا' : 'ابدأ جلسة قراءة نشطة.' },
    { id: 'listening', title: 'الاستماع', icon: '◖', value: metricText('listening', metrics.listeningMinutes), progress: Math.min(100, Math.round(metrics.listeningMinutes / 15 * 100)), note: metrics.listeningMinutes ? 'وقت استماع فعلي مسجل محليًا' : 'لم تبدأ بيانات الاستماع بعد.' },
    { id: 'sign', title: 'التسميع بالإشارة', icon: '✋', value: `${number.format(metrics.signAttempts)} محاولة`, progress: Math.min(100, metrics.signAttempts * 20), note: metrics.signAttempts ? 'محاولات مكتملة محفوظة على جهازك' : 'جرّب أول تسميع بالإشارة.' },
  ];
  const achievements = [
    { id: 'reading', title: 'بداية القراءة', icon: '▤', unlocked: metrics.readingMinutes > 0, progress: metrics.readingMinutes, target: 1, description: 'أنجزت قراءة نشطة.' },
    { id: 'sign', title: 'بداية الإشارة', icon: '✋', unlocked: metrics.signAttempts >= 1, progress: metrics.signAttempts, target: 1, description: 'أكمل أول محاولة تسميع بالإشارة.' },
    { id: 'review', title: 'جلسة مراجعة', icon: '✦', unlocked: metrics.reviews >= 1, progress: metrics.reviews, target: 1, description: 'سجّل مراجعة واحدة.' },
    { id: 'streak', title: 'بداية الاستمرار', icon: '◌', unlocked: metrics.activityDays >= 3, progress: metrics.activityDays, target: 3, description: 'أنجز نشاطًا في 3 أيام.' },
    { id: 'listen', title: 'رفيق الاستماع', icon: '◖', unlocked: metrics.listeningMinutes >= 15, progress: metrics.listeningMinutes, target: 15, description: 'اجمع 15 دقيقة استماع فعلية.' },
  ];

  return <main className="progress-journey-page" dir="rtl">
    <section className="progress-journey-hero" aria-labelledby="journey-title">
      <div className="progress-hero-copy"><p className="eyebrow">رحلتي مع القرآن</p><h1 id="journey-title">المرحلة {number.format(stageNumber)} — {stage.titleAr}</h1><p>رحلتك تنمو مع كل قراءة ومراجعة، وفق نشاطك المسجل على هذا الجهاز.</p><div className="progress-stage-meta"><span>{journey.stageCompleted} من {stage.milestones.length} محطات مكتملة</span><span>🔥 {metrics.currentStreak ? `${number.format(metrics.currentStreak)} أيام متتالية` : 'ابدأ سلسلة جديدة اليوم'}</span></div></div>
      <div className="progress-ring" style={{ '--progress': `${journey.stagePercent * 3.6}deg` } as React.CSSProperties} aria-label={`تقدم المرحلة ${journey.stagePercent}%`}><strong>{number.format(journey.stagePercent)}%</strong><span>من المرحلة</span></div>
    </section>

    <section className="progress-journey-layout">
      <section className={`journey-map journey-growth-${Math.min(4, Math.ceil(journey.stagePercent / 25))}`} aria-label="خريطة رحلة القرآن">
        <div className="journey-map-scenery" aria-hidden="true"><span className="journey-sun" /><span className="journey-hill hill-one" /><span className="journey-hill hill-two" /><span className="journey-water" /><span className="journey-lantern">✦</span><span className="journey-tree tree-one">♧</span><span className="journey-tree tree-two">♧</span><span className="journey-pavilion">⌂</span></div>
        <svg className="journey-winding-path" viewBox="0 0 700 700" preserveAspectRatio="none" aria-hidden="true"><path d="M455 690C585 620 524 570 390 532S170 443 300 380s246-89 116-147S151 154 242 74" /><path className="journey-winding-path-fill" d="M455 690C585 620 524 570 390 532S170 443 300 380s246-89 116-147S151 154 242 74" /></svg>
        <div className="journey-map-heading"><p className="eyebrow">خريطة الرحلة</p><h2>خطوات هادئة في رحلتك</h2><p>المحطات تحفّزك ولا تقيد الوصول إلى القرآن.</p></div>
        <ol className="journey-node-list">{nodes.map((node, index) => <li className={`journey-node is-${node.status}`} key={node.id}>
          <span className="journey-path-segment" aria-hidden="true" />
          <button type="button" onClick={() => setSelected(node)} aria-label={`${node.titleAr}: ${statusText(node.status)}`}><span className="journey-node-icon" aria-hidden="true">{node.icon}</span><span><b>{node.titleAr}</b><small>{statusText(node.status)}</small></span>{node.completed && <em aria-label="مكتملة">✓</em>}</button>
          {index < nodes.length - 1 && <span className="journey-path-dot" aria-hidden="true" />}
        </li>)}</ol>
        <div className="journey-stage-switcher" aria-label="مراحل الرحلة">{journey.stages.map((item) => <span className={item.id === stage.id ? 'is-current' : item.unlocked ? 'is-ready' : 'is-locked'} key={item.id}>{item.unlocked ? '●' : '○'} {item.titleAr}</span>)}</div>
      </section>

      <aside className="journey-side">
        <section className="next-milestone-card"><p className="eyebrow">المحطة التالية</p>{nextMilestone ? <><h2>{nextMilestone.titleAr}</h2><p>{nextMilestone.descriptionAr}</p><div className="milestone-meter"><span style={{ width: `${Math.min(100, nextMilestone.value / nextMilestone.threshold * 100)}%` }} /></div><b>{number.format(nextMilestone.value)} / {number.format(nextMilestone.threshold)}</b><a href="/quran">تابع الرحلة <span>←</span></a></> : <><h2>اكتملت هذه المرحلة</h2><p>أحسنت الاستمرار. المرحلة التالية أصبحت جاهزة في خريطتك.</p></>}</section>
        <section className="streak-card"><div><p className="eyebrow">سلسلة الاستمرار</p><h2>{metrics.currentStreak ? `${number.format(metrics.currentStreak)} أيام متتالية` : 'خطوة جديدة اليوم'}</h2><p>{metrics.currentStreak ? 'يوم النشاط يُحتسب من القراءة أو الاستماع أو المراجعة أو التسميع.' : 'فتح التطبيق وحده لا يحسب نشاطًا.'}</p></div><span aria-hidden="true">♨</span><dl><div><dt>السلسلة الحالية</dt><dd>{number.format(metrics.currentStreak)}</dd></div><div><dt>أطول سلسلة</dt><dd>{number.format(metrics.longestStreak)}</dd></div><div><dt>هذا الشهر</dt><dd>{number.format(metrics.monthActiveDays)} يومًا</dd></div></dl></section>
      </aside>
    </section>

    <section className="progress-tracks-section" aria-labelledby="tracks-title"><header><p className="eyebrow">مسارات التعلم</p><h2 id="tracks-title">مستوياتي في مسارات التعلم</h2></header><div className="progress-track-grid">{tracks.map((track) => <article className={`progress-track progress-track-${track.id}`} key={track.id}><span className="progress-track-icon" aria-hidden="true">{track.icon}</span><h3>{track.title}</h3><strong>{track.value}</strong><p>{track.note}</p><div className="track-meter"><span style={{ width: `${track.progress}%` }} /></div></article>)}</div></section>

    <section className="achievement-section" aria-labelledby="achievements-title"><header><div><p className="eyebrow">إنجازات النشاط</p><h2 id="achievements-title">إنجازاتك</h2></div><span>تُبنى من نشاطك الفعلي، وليست مقياسًا دينيًا.</span></header><div className="achievement-grid">{achievements.map((achievement) => <button type="button" className={achievement.unlocked ? 'achievement-card is-unlocked' : 'achievement-card is-locked'} onClick={() => setSelected({ id: achievement.id, titleAr: achievement.title, descriptionAr: achievement.description, metric: 'consistency', threshold: achievement.target, icon: achievement.icon, value: achievement.progress, completed: achievement.unlocked, status: achievement.unlocked ? 'completed' : 'locked' })} key={achievement.id}><span aria-hidden="true">{achievement.unlocked ? achievement.icon : '⌁'}</span><b>{achievement.title}</b><small>{achievement.unlocked ? 'مكتمل' : `${number.format(achievement.progress)} / ${number.format(achievement.target)}`}</small></button>)}</div></section>

    <section className="progress-details"><button type="button" aria-expanded={showDetails} onClick={() => setShowDetails((value) => !value)}><span><b>تفاصيل تقدّمي</b><small>اعرض ملخص نشاطك المحلي</small></span><span aria-hidden="true">{showDetails ? '⌃' : '⌄'}</span></button>{showDetails && <div className="progress-details-content"><span>أيام النشاط: <b>{number.format(metrics.activityDays)}</b></span><span>محاولات الإشارة: <b>{number.format(metrics.signAttempts)}</b></span><span>جلسات المراجعة: <b>{number.format(metrics.reviews)}</b></span><span>أفضل تطابق: <b>{metrics.bestAccuracy === null ? '—' : `${(metrics.bestAccuracy * 100).toFixed(1)}%`}</b></span></div>}</section>

    {selected && <div className="progress-dialog-backdrop" onClick={() => setSelected(null)} role="presentation"><section className="progress-dialog" role="dialog" aria-modal="true" aria-label={selected.titleAr} onClick={(event) => event.stopPropagation()}><button type="button" className="dialog-close" onClick={() => setSelected(null)} aria-label="إغلاق">×</button><span className="dialog-icon" aria-hidden="true">{selected.icon}</span><h2>{selected.titleAr}</h2><p>{selected.descriptionAr}</p><p>{selected.completed ? 'اكتملت هذه المحطة من نشاطك المسجل.' : `التقدم: ${number.format(selected.value)} من ${number.format(selected.threshold)}`}</p></section></div>}
  </main>;
}
