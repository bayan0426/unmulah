const sections = [
  ['الحديث', 'ننتظر ربط مصدر حديث موثوق بشروط استخدام صريحة.'],
  ['الأذكار والدعاء', 'ننتظر مصدرًا موثقًا يحفظ النص والإسناد أو التخريج عند توفره.'],
  ['العقيدة', 'ننتظر محتوى مؤسسيًا موثقًا.'],
  ['السيرة', 'ننتظر محتوى مؤسسيًا موثقًا.'],
  ['العبادات', 'ننتظر محتوى مؤسسيًا موثقًا.'],
  ['الأخلاق والآداب', 'ننتظر محتوى مؤسسيًا موثقًا.'],
] as const;

export function LibraryPage() {
  return <main className="info-page library-page" dir="rtl">
    <section className="library-hero">
      <p className="eyebrow">مصادر موثقة أولًا</p><h1>مكتبة أُنملة</h1>
      <p>نضيف المعرفة الدينية عندما يتوفر مصدرها ونسبتها وشروط استخدامها. لا تنشئ أُنملة نصوصًا دينية بالذكاء الاصطناعي.</p>
      <div className="library-source-rule"><span>المتاح الآن</span><b>القرآن الكريم من المصادر الرسمية</b></div>
    </section>
    <section className="library-feature" aria-label="المصدر المتاح">
      <div className="library-feature-mark" aria-hidden="true">۝</div>
      <div><p className="eyebrow">القرآن الكريم</p><h2>قراءة واستماع من المصادر الموثقة</h2><p>يمكنك فتح النص الذكي، اختيار قارئ، والانتقال إلى العرض التقليدي للمصحف من قسم القرآن.</p></div>
      <span className="available-badge">متاح</span>
    </section>
    <section className="library-waiting" aria-labelledby="waiting-title">
      <div><p className="eyebrow">قيد التحقق</p><h2 id="waiting-title">محتوى نضيفه عندما تتضح مصادره</h2></div>
      <div className="library-grid">{sections.map(([title, description]) => <article key={title}><span className="library-waiting-mark" aria-hidden="true">+</span><h3>{title}</h3><p>{description}</p><small>قريبًا بعد التحقق من المصدر</small></article>)}</div>
    </section>
  </main>;
}
