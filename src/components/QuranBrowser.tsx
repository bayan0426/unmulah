import { useMemo, useState } from 'react';
import { quranCatalog, type QuranSurah } from '../data/quranCatalog';
import { hasLocalQuranSurah } from '../data/quran';
import { filterQuranCatalog, type QuranCatalogFilter } from '../data/quranCatalogUtils';

export function ComingSoonBadge() {
  return <span className="coming-soon">قريبًا</span>;
}

export function QuranBrowser({ onOpenAlIkhlas }: { onOpenAlIkhlas: () => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<QuranCatalogFilter>('all');
  const [selected, setSelected] = useState<QuranSurah | null>(null);
  const results = useMemo(() => filterQuranCatalog(quranCatalog, query, filter, (surah) => surah.number === 112), [query, filter]);

  return (
    <main className="quran-browser-page" dir="rtl">
      <section className="quran-browser-hero">
        <div>
          <p className="eyebrow">مصحف أُنملة</p>
          <h1>اقرأ القرآن بوضوح وطمأنينة</h1>
          <p>فهرس السور متاح للقراءة. نص الإخلاص المحلي موثّق، والتسميع بالإشارة متاح لها في هذا الإصدار.</p>
        </div>
        <div className="source-chip">النص المحلي الموثّق: الإخلاص</div>
      </section>
      <label className="quran-search"><span>ابحث عن سورة</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="الاسم أو الرقم" /></label>
      <div className="catalog-filters" aria-label="تصفية السور">
        {([{ id: 'all', label: 'الكل' }, { id: 'available', label: 'التسميع الذكي متاح' }, { id: 'coming-soon', label: 'قريبًا' }] as const).map((option) => <button key={option.id} className={filter === option.id ? 'is-active' : ''} type="button" onClick={() => setFilter(option.id)} aria-pressed={filter === option.id}>{option.label}</button>)}
      </div>
      {(query.trim() || filter !== 'all') && <p className="catalog-result-count" aria-live="polite">نتائج البحث: {results.length}</p>}
      <div className="quran-browser-layout">
        <section className="surah-catalog" aria-label="قائمة سور القرآن">
          {results.map((surah) => {
            const supported = surah.number === 112;
            const locallyReadable = hasLocalQuranSurah(surah.number);
            return <button className={`surah-row${selected?.number === surah.number ? ' is-selected' : ''}`} type="button" key={surah.number} onClick={() => setSelected(surah)}>
              <span className="surah-catalog-number">{surah.number}</span>
              <span className="surah-catalog-name">{surah.name}</span>
              <span className="surah-catalog-meta">{surah.ayahCount} آيات{surah.page ? ` · صفحة ${surah.page}` : ''}</span>
              {supported ? <span className="available-badge">التسميع الذكي متاح</span> : locallyReadable ? <span className="available-badge">القراءة متاحة</span> : <span className="coming-soon">التسميع الذكي قريبًا</span>}
            </button>;
          })}
          {results.length === 0 && <p className="catalog-empty">لم نجد سورة بهذا الاسم أو الرقم.</p>}
        </section>
        <aside className="quran-reader-panel" aria-live="polite">
          {selected?.number === 112 ? <>
            <p className="eyebrow">السورة ١١٢</p><h2>الإخلاص</h2><p>النص العثماني محفوظ محليًا من المصدر الموثّق.</p><button type="button" className="button button-primary" onClick={onOpenAlIkhlas}>افتح القراءة والتسميع</button>
          </> : selected ? <>
            <p className="eyebrow">السورة {selected.number}</p><h2>{selected.name}</h2><p>فهرس السورة متاح. تعذّر دمج حزمة النص الرسمية الكاملة محليًا حتى الآن، لذلك لا يعرض أُنملة نصًا غير موثّق.</p><span className="reader-unavailable">القراءة بالنص الرسمي قريبًا بعد توثيق مصدر الحزمة</span>
          </> : <><h2>اختر سورة</h2><p>يعرض الفهرس ١١٤ سورة. افتح الإخلاص لتجربة القراءة الموثّقة والتسميع بالإشارة.</p></>}
        </aside>
      </div>
      <section className="mushaf-note"><strong>تصفّح صفحات المصحف</strong><span>يتطلب هذا العرض حقول الصفحة والسطر من حزمة رسمية محلية. لم تُدمج الحزمة بعد، لذلك لا تظهر صفحات أو نصوص تقديرية.</span></section>
    </main>
  );
}
