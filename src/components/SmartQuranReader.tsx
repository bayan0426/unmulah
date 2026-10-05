import { useEffect, useMemo, useState } from 'react';
import { quranCatalog } from '../data/quranCatalog';
import { getSmartSurah, loadKfgqpcSmartRecords, searchSmartQuran, type KfgqpcSmartRecord } from '../data/quran/kfgqpcSmartProvider';

export function SmartQuranReader({ initialSurah = 1, onOpenAlIkhlas }: { initialSurah?: number; onOpenAlIkhlas: () => void }) {
  const [records, setRecords] = useState<KfgqpcSmartRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [surahNumber, setSurahNumber] = useState(initialSurah);
  const [query, setQuery] = useState('');
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  useEffect(() => { loadKfgqpcSmartRecords().then(setRecords).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'تعذر تحميل النص الذكي.')); }, []);
  const surah = useMemo(() => records ? getSmartSurah(records, surahNumber) : null, [records, surahNumber]);
  const results = useMemo(() => records ? searchSmartQuran(records, query).slice(0, 30) : [], [records, query]);

  if (error) return <section className="quran-data-state is-error" role="alert"><strong>تعذر تحميل النص الذكي</strong><span>تحقق من اتصالك أو أعد تحميل الصفحة. لم نعرض نصًا بديلًا غير موثّق.</span><small>{error}</small></section>;
  if (!records || !surah) return <section className="quran-data-state" aria-live="polite"><strong>جارٍ تجهيز النص العثماني الذكي…</strong><span>يتم التحقق محليًا من ٦٬٢٣٦ آية من المصدر الرسمي.</span></section>;

  return <section className="smart-quran-reader" aria-label="النص العثماني الذكي">
    <header className="smart-reader-header"><div><p className="eyebrow">النص العثماني الذكي</p><h2>{surah.name}</h2><p>السورة {surahNumber} · {surah.ayahs.length} آية · حفص عن عاصم</p></div><div className="smart-reader-actions"><label>اختر سورة<select value={surahNumber} onChange={(event) => { setSurahNumber(Number(event.target.value)); setSelectedAyah(null); }}>{quranCatalog.map((entry) => <option key={entry.number} value={entry.number}>{entry.number} · {entry.name}</option>)}</select></label>{surahNumber === 112 && <button type="button" className="button button-primary" onClick={onOpenAlIkhlas}>ابدأ التسميع</button>}</div></header>
    <label className="smart-search"><span>ابحث في القرآن</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بكلمات الآية" /></label>
    {query && <div className="smart-search-results" aria-live="polite"><strong>نتائج البحث: {results.length}{results.length === 30 ? '+' : ''}</strong>{results.map((result) => <button type="button" key={result.id} onClick={() => { setSurahNumber(result.sura_no); setSelectedAyah(result.aya_no); setQuery(''); }}><span>{result.sura_name_ar} · الآية {result.aya_no} · الجزء {result.jozz} · صفحة {result.page}</span><b className="smart-ayah" lang="ar">{result.aya_text}</b></button>)}{results.length === 0 && <p>لا توجد نتائج مطابقة.</p>}</div>}
    <div className="smart-ayah-list" aria-label={`آيات سورة ${surah.name}`}>{surah.ayahs.map((ayah) => <article key={ayah.ayahNumber} className={`smart-ayah-card${selectedAyah === ayah.ayahNumber ? ' is-selected' : ''}`}><div className="smart-ayah-meta"><span>الآية {ayah.ayahNumber}</span><span>الجزء {ayah.juz} · صفحة {ayah.page}</span></div><p className="smart-ayah" lang="ar">{ayah.text}</p></article>)}</div>
    <p className="smart-source-note">المصدر: بيانات حفص الذكية v0.8 من مجمع الملك فهد. هذا العرض على مستوى الآية، وليس محاكاة مطابقة لصفحة مصحف مطبوع.</p>
  </section>;
}
