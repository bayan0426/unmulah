import { useMemo, useState } from 'react';
import { quranCatalog, type QuranSurah } from '../data/quranCatalog';
import { hasLocalQuranSurah } from '../data/quran';
import { filterQuranCatalog, type QuranCatalogFilter } from '../data/quranCatalogUtils';
import { SmartQuranReader } from './SmartQuranReader';
import { MushafViewer } from './MushafViewer';
import { SignMushafView } from './SignMushafView';
import type { KfgqpcRecognitionTarget } from '../lib/quranCoverageAudit';

export function ComingSoonBadge() {
  return <span className="coming-soon">قريبًا</span>;
}

export function QuranBrowser({ onOpenAlIkhlas, onOpenRecognitionTarget }: { onOpenAlIkhlas: () => void; onOpenRecognitionTarget: (target: KfgqpcRecognitionTarget, label: string) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<QuranCatalogFilter>('all');
  const [selected, setSelected] = useState<QuranSurah | null>(() => quranCatalog[0]);
  const [view, setView] = useState<'smart' | 'mushaf' | 'sign'>(() => {
    const value = new URLSearchParams(window.location.search).get('view');
    if (value === 'mushaf' || value === 'sign' || value === 'smart') return value;
    try { const saved = window.localStorage.getItem('unmulah.quran.view'); return saved === 'mushaf' || saved === 'sign' ? saved : 'smart'; } catch { return 'smart'; }
  });
  const changeView = (next: 'smart' | 'mushaf' | 'sign') => {
    setView(next);
    const url = new URL(window.location.href); url.searchParams.set('view', next); window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    try { window.localStorage.setItem('unmulah.quran.view', next); } catch { /* View selection remains session-only. */ }
  };
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
      <div className="quran-view-tabs" role="tablist" aria-label="طرق عرض القرآن">
        <button type="button" role="tab" aria-selected={view === 'smart'} className={view === 'smart' ? 'is-active' : ''} onClick={() => changeView('smart')}>النص الذكي</button>
        <button type="button" role="tab" aria-selected={view === 'mushaf'} className={view === 'mushaf' ? 'is-active' : ''} onClick={() => changeView('mushaf')}>صفحات المصحف</button>
        <button type="button" role="tab" aria-selected={view === 'sign'} className={view === 'sign' ? 'is-active' : ''} onClick={() => changeView('sign')}>المصحف الإشاري</button>
      </div>
      {view === 'mushaf' && <MushafViewer onBack={() => changeView('smart')} />}
      {view === 'sign' && <SignMushafView />}
      {view === 'smart' && <>
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
        <aside className="quran-reader-panel" aria-live="polite"><p className="eyebrow">السورة {selected?.number}</p><h2>{selected?.name}</h2><p>{selected?.ayahCount} آيات · النص العثماني الذكي متاح من المصدر الرسمي المحلي.</p>{selected?.number === 112 && <button type="button" className="button button-primary" onClick={onOpenAlIkhlas}>افتح التسميع الذكي</button>}<span className="reader-unavailable">اختر السورة لقراءتها في العارض أدناه.</span></aside>
      </div>
      <SmartQuranReader key={selected?.number ?? 1} initialSurah={selected?.number ?? 1} onOpenAlIkhlas={onOpenAlIkhlas} onOpenRecognitionTarget={onOpenRecognitionTarget} />
      </>}
    </main>
  );
}
