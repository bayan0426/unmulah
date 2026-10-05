import { useState } from 'react';

const OFFICIAL_MUSHAF_URL = 'https://qurancomplex.gov.sa/isdarat-hafs/#flipbook-df_11311/1/';

export function MushafViewer({ onBack }: { onBack: () => void }) {
  const [loaded, setLoaded] = useState(false);

  return <section className="mushaf-viewer" aria-label="صفحات مصحف المدينة المرجعية">
    <header>
      <div>
        <p className="eyebrow">مرجع رسمي خارجي</p>
        <h2>صفحات مصحف المدينة</h2>
        <p>تجربة القراءة التفاعلية الأساسية داخل أُنملة هي «النص الذكي». هذا العارض مرجع رسمي مؤقت إلى أن تتوفر ملفات النسخة الرقمية المرخّصة للاستخدام داخل التطبيق.</p>
      </div>
      <div>
        <button type="button" className="button button-secondary" onClick={onBack}>العودة إلى النص الذكي</button>
        <a className="button button-primary" href={OFFICIAL_MUSHAF_URL} target="_blank" rel="noopener noreferrer">فتح المصدر الرسمي</a>
      </div>
    </header>
    <div className="mushaf-frame-wrap">
      {!loaded && <div className="quran-data-state">جارٍ تحميل العارض الرسمي…</div>}
      <iframe title="عارض مصحف المدينة الرسمي المرجعي" src={OFFICIAL_MUSHAF_URL} onLoad={() => setLoaded(true)} className="mushaf-frame" />
    </div>
    <p className="smart-source-note">إذا منع المتصفح العرض المضمّن بسياسة الموقع الرسمي، استخدم «فتح المصدر الرسمي». لا يتم تجاوز حماية الموقع أو نسخ محتواه.</p>
  </section>;
}
