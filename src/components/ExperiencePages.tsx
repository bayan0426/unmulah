import { useState } from 'react';
import type { LocalAttempt } from '../lib/attemptHistory';
import { clearLocalActivities, deriveExperienceProgress, readLocalActivities, readLocalProfile, saveLocalProfile, type LocalProfile } from '../lib/localExperience';
import { clearAccessibilitySettings, readAccessibilitySettings, saveAccessibilitySettings, type AccessibilitySettings } from '../lib/accessibilitySettings';
import { clearSavedContent, readSavedContent, removeSavedContent, type SavedQuranAyah } from '../lib/savedContent';
import { clearLocalProfile } from '../lib/localExperience';
import { clearAttemptHistory } from '../lib/attemptHistory';
import { readQuranProgress } from '../lib/quranProgress';

const labels = { 'first-attempt': 'أول محاولة', 'five-attempts': 'خمس محاولات', 'first-surah': 'أول سورة', 'three-day-streak': 'ثلاثة أيام نشاط' } as const;

export function ProfilePage() {
  const [profile, setProfile] = useState<LocalProfile>(readLocalProfile);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(readAccessibilitySettings);
  const update = <K extends keyof LocalProfile>(key: K, value: LocalProfile[K]) => setProfile((current) => saveLocalProfile({ ...current, [key]: value }));
  const updateAccessibility = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => setAccessibility((current) => saveAccessibilitySettings({ ...current, [key]: value }));

  return <main className="info-page profile-page" dir="rtl">
    <section className="profile-hero">
      <p className="eyebrow">على جهازك فقط</p><h1>مساحتك في أُنملة</h1>
      <p>لا تحتاج إلى حساب أو اسم. هذه الاختيارات تضبط طريقة العرض على هذا الجهاز، ولا تغيّر النص القرآني أو نتيجة التعرّف.</p>
      <div className="profile-privacy-note"><span aria-hidden="true">⌁</span><span>لا نحفظ صور الكاميرا أو الفيديو أو الصوت.</span></div>
    </section>
    <section className="profile-editorial-grid" aria-label="تفضيلات التجربة">
      <div className="profile-section-title"><p className="eyebrow">كيف تتعلم</p><h2>اختر المسار الأقرب إليك</h2><p>يمكن تغيير أي اختيار لاحقًا.</p></div>
      <div className="profile-choice-grid">
        <label><span>أسلوب الوصول</span><select value={profile.accessibility} onChange={(e) => update('accessibility', e.target.value as LocalProfile['accessibility'])}><option value="sign-first">الإشارة أولًا</option><option value="text-first">النص أولًا</option><option value="audio-text">الصوت والنص</option><option value="mixed">مزيج</option></select></label>
        <label><span>تفضيل السمع</span><select value={profile.hearing} onChange={(e) => update('hearing', e.target.value as LocalProfile['hearing'])}><option value="deaf-sign">أصم / مستخدم لغة إشارة</option><option value="hard-of-hearing">ضعيف سمع</option><option value="hearing">سامع</option><option value="prefer-not-to-say">أفضل عدم التحديد</option></select></label>
        <label><span>التجربة</span><select value={profile.age} onChange={(e) => update('age', e.target.value as LocalProfile['age'])}><option value="child">طفل</option><option value="teen">مراهق</option><option value="adult">بالغ</option></select></label>
        <label><span>هدفي الآن</span><select value={profile.goal} onChange={(e) => update('goal', e.target.value as LocalProfile['goal'])}><option value="memorize">الحفظ</option><option value="review">المراجعة</option><option value="learn-quran">تعلم القرآن</option><option value="explore-islam">تعلم الإسلام</option></select></label>
      </div>
    </section>
    <section className="profile-accessibility-panel">
      <div><p className="eyebrow">وضوح وراحة</p><h2>إعدادات الوصول</h2><p>تطبّق مباشرة على هذا الجهاز.</p></div>
      <div className="profile-a11y-controls">
        <label><span>حجم النص</span><select value={accessibility.textSize} onChange={(e) => updateAccessibility('textSize', e.target.value as AccessibilitySettings['textSize'])}><option value="standard">قياسي</option><option value="large">كبير</option><option value="x-large">كبير جدًا</option></select></label>
        <label className="profile-toggle"><input type="checkbox" checked={accessibility.highContrast} onChange={(e) => updateAccessibility('highContrast', e.target.checked)} /><span>تباين مرتفع</span></label>
        <label className="profile-toggle"><input type="checkbox" checked={accessibility.reducedMotion} onChange={(e) => updateAccessibility('reducedMotion', e.target.checked)} /><span>تقليل الحركة</span></label>
      </div>
    </section>
  </main>;
}

export function ProgressPage({ attempts, reviewed }: { attempts: LocalAttempt[]; reviewed: boolean }) {
  const activities = [...readLocalActivities(), ...attempts.map((attempt) => ({ kind: 'attempt' as const, occurredAt: attempt.completedAt })), ...(reviewed ? [{ kind: 'review' as const, occurredAt: new Date().toISOString() }] : [])];
  const progress = deriveExperienceProgress(activities, attempts.map((attempt) => attempt.accuracy));
  const quranProgress = readQuranProgress();
  const recentDays = Array.from({ length: 28 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (27 - index)); const key = date.toISOString().slice(0, 10); return { key, active: activities.some((activity) => activity.occurredAt.slice(0, 10) === key) }; });
  return <main className="info-page" dir="rtl"><section className="page-heading"><p className="eyebrow">تقدم محلي</p><h1>تقدمي</h1><p>النقاط والحديقة تعكسان نشاطك المسجل، ولا تمثل ثوابًا أو حكمًا على الحفظ.</p></section><section className="garden-journey" aria-label="رحلة حديقة أُنملة"><div className={`garden-visual garden-${progress.garden}`} aria-hidden="true"><span>✦</span></div><div><p className="eyebrow">حديقة أُنملة</p><h2>رحلتك تنمو مع الممارسة</h2><p>تسجل النقاط نشاطك المحلي فقط.</p></div></section><section className="khatmah-tracks"><article><span>ختمة التلاوة</span><strong>{Math.floor(quranProgress.readingSeconds / 60)} د</strong><small>وقت قراءة نشط مسجل محليًا</small></article><article><span>ختمة الاستماع</span><strong>{Math.floor(quranProgress.listeningSeconds / 60)} د</strong><small>وقت استماع مسجل محليًا</small></article><article><span>المراجعة / التسميع</span><strong>{quranProgress.reviewAttempts + attempts.length}</strong><small>محاولات وعمليات مراجعة</small></article></section><section className="progress-dashboard"><article><span>نقاط التقدم</span><strong>{progress.points}</strong></article><article><span>سلسلة الاستمرار</span><strong>{progress.streak} أيام</strong></article><article><span>حديقة أُنملة</span><strong>{({ seed: 'بذرة', seedling: 'شتلة', plant: 'نبتة', tree: 'شجرة', garden: 'حديقة مزهرة' }[progress.garden])}</strong></article><article><span>أفضل محاولة</span><strong>{progress.bestAccuracy === null ? '—' : `${(progress.bestAccuracy * 100).toFixed(1)}%`}</strong></article></section><section className="activity-heatmap" aria-label="نشاط آخر 28 يومًا"><div><p className="eyebrow">استمرارية</p><h2>نشاط آخر 28 يومًا</h2></div><div className="heatmap-grid">{recentDays.map((day) => <span key={day.key} className={day.active ? 'is-active' : ''} title={day.key} />)}</div></section><section className="access-card"><h2>إنجازاتك</h2><p>{progress.achievements.length ? progress.achievements.map((item) => labels[item as keyof typeof labels]).join(' · ') : 'أكمل نشاطًا ذا معنى لبدء تقدمك.'}</p><h2>تحدي اليوم</h2><p>{({ attempt: 'أكمل محاولة تسميع', review: 'سجّل مراجعة آية', 'surah-read': 'اقرأ سورة', 'saved-item': 'احفظ موردًا للعودة إليه' }[progress.challenge])}</p></section></main>;
}

export function SavedContentPage({ onOpenQuran }: { onOpenQuran: () => void }) {
  const [items, setItems] = useState<SavedQuranAyah[]>(readSavedContent);
  return <main className="info-page" dir="rtl"><section className="page-heading"><p className="eyebrow">محفوظ محليًا</p><h1>المحفوظات</h1><p>نحفظ مرجع الآية وبياناتها فقط على جهازك. لا ننسخ النص القرآني إلى التخزين المحلي.</p></section>{items.length === 0 ? <section className="access-card"><p>لا توجد آيات محفوظة بعد.</p><button type="button" className="button button-primary" onClick={onOpenQuran}>افتح القرآن</button></section> : <section className="access-card"><div className="saved-content-heading"><h2>آيات محفوظة</h2><button type="button" onClick={() => setItems(clearSavedContent())}>مسح المحفوظات</button></div><div className="saved-content-list">{items.map((item) => <article key={item.id}><div><strong>{item.surahName} · الآية {item.ayahNumber}</strong><span>الجزء {item.juz} · الصفحة {item.page}</span></div><div><button type="button" onClick={onOpenQuran}>فتح القرآن</button><button type="button" onClick={() => setItems(removeSavedContent(item.id))}>إزالة</button></div></article>)}</div></section>}</main>;
}

export function DataManagementPage() {
  const [message, setMessage] = useState('');
  const clear = (kind: 'attempts' | 'saved' | 'profile' | 'accessibility' | 'progress' | 'all') => {
    const labels = { attempts: 'سجل المحاولات', saved: 'المحفوظات', profile: 'الملف المحلي', accessibility: 'إعدادات الوصول', progress: 'نشاط التقدم والحديقة', all: 'كل البيانات المحلية' };
    if (!window.confirm(`هل تريد مسح ${labels[kind]} من هذا الجهاز؟`)) return;
    if (kind === 'attempts' || kind === 'all') clearAttemptHistory();
    if (kind === 'saved' || kind === 'all') clearSavedContent();
    if (kind === 'profile' || kind === 'all') clearLocalProfile();
    if (kind === 'accessibility' || kind === 'all') clearAccessibilitySettings();
    if (kind === 'progress' || kind === 'all') clearLocalActivities();
    setMessage(`تم مسح ${labels[kind]} محليًا.`);
  };
  return <main className="info-page" dir="rtl"><section className="page-heading"><p className="eyebrow">على جهازك فقط</p><h1>إدارة بياناتي</h1><p>لا نخزن لقطات الكاميرا أو الفيديو أو الصوت. تتحكم هنا فقط في البيانات المحلية التي أنشأتها داخل أُنملة.</p></section><section className="access-card data-management"><button type="button" onClick={() => clear('attempts')}>مسح سجل المحاولات</button><button type="button" onClick={() => clear('saved')}>مسح المحفوظات</button><button type="button" onClick={() => clear('progress')}>مسح تقدم الحديقة</button><button type="button" onClick={() => clear('profile')}>مسح الملف المحلي</button><button type="button" onClick={() => clear('accessibility')}>إعادة إعدادات الوصول</button><button type="button" className="danger-action" onClick={() => clear('all')}>مسح كل البيانات المحلية</button>{message && <p role="status">{message}</p>}</section></main>;
}
