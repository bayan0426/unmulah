import { quranCatalog } from '../data/quranCatalog';
import { getRecitationTarget } from '../lib/recitationComparison';
import { FingerspellingViewer } from './FingerspellingViewer';
import { ComingSoonBadge } from './QuranBrowser';
import { SourceStatus } from './SourceStatus';
import { clearAttemptHistory, readAttemptHistory } from '../lib/attemptHistory';
import { useState } from 'react';

export function SignAccessPage({ onOpenAlIkhlas }: { onOpenAlIkhlas: () => void }) {
  return <main className="info-page" dir="rtl">
    <section className="page-heading"><p className="eyebrow">الوصول بالإشارة</p><h1>المصحف بالهجاء الإصبعي</h1><p>الهجاء الإصبعي لحروف القرآن وسيلة وصول ومراجعة، وليس ترجمةً للقرآن.</p></section>
    <section className="access-card"><h2>المحتوى المتاح</h2><div className="access-row"><div><strong>سورة الإخلاص</strong><span>قراءة موثّقة وتسميع بالحروف بالإشارة</span></div><button type="button" className="button button-primary" onClick={onOpenAlIkhlas}>ابدأ التسميع</button></div></section>
    <section className="access-card"><h2>تفسير معاني القرآن الكريم بلغة الإشارة</h2><p>سيُضاف فقط عند توفر مصدر موثّق وحقوق استخدام واضحة. لا توجد أصول فيديو أو صور إشارية معروضة الآن.</p><ComingSoonBadge /></section>
    <FingerspellingViewer text={getRecitationTarget('ayah-1').normalized} />
    <section className="access-card compact"><h2>السور الأخرى</h2><p>{quranCatalog.length - 1} سورة في خارطة الوصول بالإشارة <ComingSoonBadge /></p></section>
  </main>;
}

export function SourcesPrivacyPage() {
  const [historyCount, setHistoryCount] = useState(() => readAttemptHistory().length);
  const clearHistory = () => {
    if (window.confirm('هل تريد مسح سجل المحاولات المحلي نهائيًا؟')) setHistoryCount(clearAttemptHistory().length);
  };
  return <main className="info-page" dir="rtl">
    <section className="page-heading"><p className="eyebrow">الشفافية</p><h1>المصادر والخصوصية</h1><p>نوضح ما يعمل محليًا، وما يستند إلى مصدر موثّق، وما يزال قيد الإعداد.</p></section>
    <div className="sources-grid">
      <section className="source-card"><h2>الكاميرا والخصوصية</h2><ul><li>تبدأ الكاميرا بعد اختيارك الصريح.</li><li>تُعالج الإطارات ومعالم اليد داخل المتصفح.</li><li>لا يسجّل أُنملة فيديو الكاميرا ولا يرفعه في هذا الإصدار.</li><li>لا يستخدم التعرّف على الوجه.</li><li>نتائج الإشارات مساعدة وقد تخطئ.</li></ul></section>
      <section className="source-card"><h2>نص القرآن <SourceStatus status="verified" /></h2><p>النص المحلي للإخلاص مستخرج دون تحرير من بيانات حفص بالرسم العثماني، المنسوبة إلى منصة مطوري مجمع الملك فهد لطباعة المصحف الشريف.</p><a href="https://qurancomplex.gov.sa/en/techquran/dev/" target="_blank" rel="noreferrer">منصة المطورين الرسمية</a><p className="minor">تعذّر الوصول الآلي إلى الحزمة الرسمية الكاملة أثناء هذا الإصدار؛ لذلك لا يعرض التطبيق نصوص سور أخرى.</p></section>
      <section className="source-card"><h2>النموذج والإتاحة <SourceStatus status="license-verified" /></h2><p>التعرّف يستخدم MediaPipe Hand Landmarker ونموذج Arabic Sign Language Recognition المحلي. ترخيص النموذج MIT، وترتيب الفئات مطابق لـ encoder.pkl الموثّق.</p><p>الذكاء الاصطناعي لا يفسر القرآن ولا ينشئ نصًا قرآنيًا.</p></section>
      <section className="source-card"><h2>الوصول بالإشارة <SourceStatus status="unused" /></h2><p>لا توجد أصول صور أو فيديو إشارية مستخدمة حاليًا. تُراجع مصادر الأصول والترخيص قبل إدراج أي أصل.</p></section>
      <section className="source-card"><h2>التفسير الميسر <SourceStatus status="pending" /></h2><p>لم يتم دمج نص تفسير في هذا الإصدار. لن يُنشأ تفسير تلقائيًا، وسيعرض فقط عند تأكيد مصدر رسمي وحقوق استخدامه.</p><ComingSoonBadge /></section>
      <section className="source-card privacy-controls"><h2>بياناتي على هذا الجهاز</h2><p>لديك {historyCount} محاولة محفوظة محليًا. تحفظ التفضيلات وسجل النتائج فقط؛ لا تحفظ صور أو فيديو.</p><button type="button" onClick={clearHistory} disabled={historyCount === 0}>مسح سجل المحاولات</button></section>
    </div>
  </main>;
}
