import { useEffect, useMemo, useState } from 'react';
import { quranCatalog, type QuranSurah } from '../data/quranCatalog';
import { filterQuranCatalog } from '../data/quranCatalogUtils';
import { SmartQuranReader } from './SmartQuranReader';
import { PageQuranReader } from './PageQuranReader';
import { loadKfgqpcSmartRecords } from '../data/quran/kfgqpcSmartProvider';
import { createRecognitionTargetFromKfgqpc } from '../lib/quranCoverageAudit';
import type { KfgqpcRecognitionTarget } from '../lib/quranCoverageAudit';

type Filter = 'all' | 'full' | 'partial' | 'unavailable';
type Props = { onOpenAlIkhlas: () => void; onOpenRecognitionTarget: (target: KfgqpcRecognitionTarget, label: string) => void };

export function ComingSoonBadge() { return <span className="coming-soon">قريبًا</span>; }

export function QuranBrowser({ onOpenAlIkhlas, onOpenRecognitionTarget }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<QuranSurah>(() => quranCatalog[0]);
  const [view, setView] = useState<'page' | 'smart'>(() => new URLSearchParams(window.location.search).get('view') === 'smart' ? 'smart' : 'page');
  const [support, setSupport] = useState<Map<number, { supported: number; total: number }>>(new Map());
  useEffect(() => { loadKfgqpcSmartRecords().then((records) => { const next = new Map<number, { supported: number; total: number }>(); for (const record of records) { const item = next.get(record.sura_no) ?? { supported: 0, total: 0 }; item.total += 1; if (createRecognitionTargetFromKfgqpc(record)) item.supported += 1; next.set(record.sura_no, item); } setSupport(next); }).catch(() => undefined); }, []);
  const status = (surah: QuranSurah) => { const value = support.get(surah.number); if (!value) return 'loading' as const; if (value.supported === value.total) return 'full' as const; if (value.supported > 0) return 'partial' as const; return 'unavailable' as const; };
  const results = useMemo(() => filterQuranCatalog(quranCatalog, query, 'all', () => true).filter((surah) => filter === 'all' || status(surah) === filter), [query, filter, support]);
  const changeView = (next: 'page' | 'smart') => { setView(next); const url = new URL(window.location.href); url.searchParams.set('view', next); window.history.replaceState({}, '', `${url.pathname}${url.search}`); };

  return <main className="quran-browser-page quran-workspace" dir="rtl">
    <header className="quran-workspace-header"><div><p className="eyebrow">القرآن الكريم</p><h1>المصحف</h1><p>اقرأ من عرض الصفحات، أو انتقل إلى النص الذكي للأدوات والتفاعل.</p></div><div className="quran-view-tabs" role="tablist" aria-label="عرض القرآن"><button type="button" role="tab" aria-selected={view === 'page'} className={view === 'page' ? 'is-active' : ''} onClick={() => changeView('page')}>عرض الصفحات</button><button type="button" role="tab" aria-selected={view === 'smart'} className={view === 'smart' ? 'is-active' : ''} onClick={() => changeView('smart')}>النص الذكي</button></div></header>
    {view === 'page' && <PageQuranReader onOpenRecognitionTarget={onOpenRecognitionTarget} />}
    {view === 'smart' && <><section className="quran-tools-header"><label className="quran-search"><span>ابحث عن سورة</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="الاسم أو الرقم" /></label><div className="catalog-filters" aria-label="تصفية إتاحة التسميع">{([{ id: 'all', label: 'الكل' }, { id: 'full', label: 'متاح بالكامل' }, { id: 'partial', label: 'متاح جزئيًا' }, { id: 'unavailable', label: 'غير متاح' }] as const).map((option) => <button key={option.id} type="button" className={filter === option.id ? 'is-active' : ''} onClick={() => setFilter(option.id)}>{option.label}</button>)}</div></section><div className="quran-browser-layout"><section className="surah-catalog" aria-label="قائمة سور القرآن">{results.map((surah) => { const value = support.get(surah.number); const state = status(surah); const label = state === 'full' ? 'متاح بالكامل' : state === 'partial' ? `متاح جزئيًا · ${value?.supported ?? 0} من ${value?.total ?? surah.ayahCount} آيات` : state === 'unavailable' ? 'غير متاح حاليًا' : 'جارٍ التحقق'; return <button className={`surah-row${selected.number === surah.number ? ' is-selected' : ''}`} type="button" key={surah.number} onClick={() => setSelected(surah)}><span className="surah-catalog-number">{surah.number}</span><span className="surah-catalog-name">{surah.name}</span><span className="surah-catalog-meta">{surah.ayahCount} آيات</span><span className={state === 'unavailable' ? 'coming-soon' : 'available-badge'}>{label}</span></button>; })}{results.length === 0 && <p className="catalog-empty">لا توجد سور مطابقة لهذه التصفية.</p>}</section><aside className="quran-reader-panel"><p className="eyebrow">السورة {selected.number}</p><h2>{selected.name}</h2><p>اختر آية داخل النص الذكي للاستماع أو بدء التسميع عندما تكون الآية مدعومة.</p>{selected.number === 112 && <button type="button" className="button button-secondary" onClick={onOpenAlIkhlas}>فتح مراجعة الإخلاص</button>}</aside></div><SmartQuranReader key={selected.number} initialSurah={selected.number} onOpenAlIkhlas={onOpenAlIkhlas} onOpenRecognitionTarget={onOpenRecognitionTarget} /></>}
  </main>;
}
