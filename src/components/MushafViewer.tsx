import { useState } from 'react';

const OFFICIAL_MUSHAF_URL = 'https://qurancomplex.gov.sa/isdarat-hafs/#flipbook-df_11311/1/';

export function MushafViewer({ onBack }: { onBack: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return <section className="mushaf-viewer" aria-label="مصحف المدينة عرض الصفحات"><header><div><p className="eyebrow">مصحف المدينة</p><h2>عرض الصفحات</h2><p>عرض رسمي خارجي من مجمع الملك فهد لطباعة المصحف الشريف.</p></div><div><button type="button" className="button button-secondary" onClick={onBack}>العودة إلى النص الذكي</button><a className="button button-primary" href={OFFICIAL_MUSHAF_URL} target="_blank" rel="noreferrer">فتح بملء الشاشة</a></div></header><div className="mushaf-frame-wrap">{!loaded && <div className="quran-data-state">جارٍ تحميل عارض المصحف الرسمي…</div>}<iframe title="عارض مصحف المدينة الرسمي" src={OFFICIAL_MUSHAF_URL} onLoad={() => setLoaded(true)} className="mushaf-frame" /></div><p className="smart-source-note">إذا منع المتصفح العرض المضمن بسبب سياسة الموقع الرسمي، استخدم «فتح بملء الشاشة» لفتح العارض من مصدره مباشرة.</p></section>;
}
