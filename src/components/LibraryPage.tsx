const sections = [
  ['الحديث', 'قريبًا — بانتظار مصدر موثوق.'],
  ['الأذكار والدعاء', 'قريبًا — بانتظار مصدر موثوق.'],
  ['السيرة', 'قريبًا — بانتظار مصدر موثوق.'],
  ['العقيدة', 'قريبًا — بانتظار مصدر موثوق.'],
  ['العبادات', 'قريبًا — بانتظار مصدر موثوق.'],
  ['الأخلاق والآداب', 'قريبًا — بانتظار مصدر موثوق.'],
  ['تعرّف على الإسلام', 'قريبًا — بانتظار مصدر موثوق.'],
] as const;

export function LibraryPage() {
  return <main className="info-page library-page" dir="rtl"><section className="library-hero"><p className="eyebrow">مصادر موثقة أولًا</p><h1>مكتبة أُنملة</h1><p>المحتوى الديني لا يضاف قبل تحقق مصدره ونسبته وشروط استخدامه.</p></section><section className="library-feature-grid"><a className="library-feature" href="/quran?view=editions"><div className="library-feature-mark" aria-hidden="true">۝</div><div><p className="eyebrow">إصدارات المصحف</p><h2>مصاحف مجمع الملك فهد</h2><p>تصفّح إصدارات المصحف المتاحة من المصادر الرسمية.</p></div><span className="available-badge">افتح الإصدارات</span></a><article className="library-feature library-dhikr"><div className="library-feature-mark" aria-hidden="true">•</div><div><p className="eyebrow">قريبًا</p><h2>عداد الذكر</h2><p>مساحة مستقبلية للتسبيح والاستغفار والأذكار.</p></div><span className="coming-soon">قريبًا</span></article></section><section className="library-waiting"><div><p className="eyebrow">قيد التحقق</p><h2>أبواب المعرفة</h2></div><div className="library-grid">{sections.map(([title, description]) => <article key={title}><span className="library-waiting-mark">+</span><h3>{title}</h3><p>{description}</p></article>)}</div></section></main>;
}
