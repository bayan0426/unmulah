const sections = [
  ['القرآن الكريم', 'القراءة والتلاوة متاحتان من المصادر الموثقة داخل أُنملة.'],
  ['الحديث', 'ينتظر ربط مصدر حديث موثوق بشروط استخدام صريحة.'],
  ['الأذكار والدعاء', 'ينتظر مصدرًا موثقًا يحفظ النص والإسناد أو التخريج عند توفره.'],
  ['العقيدة', 'ينتظر محتوى مؤسسيًا موثقًا.'],
  ['السيرة', 'ينتظر محتوى مؤسسيًا موثقًا.'],
  ['العبادات', 'ينتظر محتوى مؤسسيًا موثقًا.'],
  ['الأخلاق والآداب', 'ينتظر محتوى مؤسسيًا موثقًا.'],
  ['تعرّف على الإسلام', 'ينتظر محتوى مؤسسيًا موثقًا.'],
] as const;

export function LibraryPage() {
  return <main className="info-page library-page" dir="rtl"><section className="page-heading"><p className="eyebrow">مصادر موثقة أولًا</p><h1>مكتبة أُنملة</h1><p>تجمع هذه المكتبة المحتوى الديني عند وجود مصدره، نسبته، وشروط استعماله. لا تُنشئ أُنملة نصوصًا دينية بالذكاء الاصطناعي.</p></section><section className="library-grid">{sections.map(([title, description]) => <article key={title}><h2>{title}</h2><p>{description}</p>{title === 'القرآن الكريم' ? <span className="available-badge">متاح</span> : <span className="coming-soon">قريبًا</span>}</article>)}</section></main>;
}
