import { useEffect, useMemo, useState } from 'react';
import { quranCatalog } from '../data/quranCatalog';
import {
  getSmartSurah,
  loadKfgqpcSmartRecords,
  searchSmartQuran,
  type KfgqpcSmartRecord,
} from '../data/quran/kfgqpcSmartProvider';
import { QuranAudioPlayer } from './QuranAudioPlayer';
import { readQuranReaderSettings, saveQuranReaderSettings, type QuranReaderSettings } from '../lib/quranReaderSettings';
import { createRecognitionTargetFromKfgqpc, type KfgqpcRecognitionTarget } from '../lib/quranCoverageAudit';
import { readSavedContent, removeSavedContent, saveQuranAyah, type SavedQuranAyah } from '../lib/savedContent';
import { recordLocalActivity } from '../lib/localExperience';

type SmartQuranReaderProps = {
  initialSurah?: number;
  onOpenAlIkhlas: () => void;
  onOpenRecognitionTarget: (target: KfgqpcRecognitionTarget, label: string) => void;
};

export function SmartQuranReader({ initialSurah = 1, onOpenAlIkhlas, onOpenRecognitionTarget }: SmartQuranReaderProps) {
  const [records, setRecords] = useState<KfgqpcSmartRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [surahNumber, setSurahNumber] = useState(initialSurah);
  const [query, setQuery] = useState('');
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [actionAyah, setActionAyah] = useState<KfgqpcSmartRecord | null>(null);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [readerSettings, setReaderSettings] = useState<QuranReaderSettings>(readQuranReaderSettings);
  const [savedContent, setSavedContent] = useState<SavedQuranAyah[]>(readSavedContent);

  const updateReaderSettings = (next: QuranReaderSettings) => {
    setReaderSettings(saveQuranReaderSettings(next));
  };

  useEffect(() => {
    loadKfgqpcSmartRecords().then(setRecords).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'تعذر تحميل النص الذكي.');
    });
  }, []);

  useEffect(() => {
    if (records) recordLocalActivity('surah-read');
  }, [records, surahNumber]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionAyah(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const surah = useMemo(() => records ? getSmartSurah(records, surahNumber) : null, [records, surahNumber]);
  const recordByAyah = useMemo(() => new Map(
    records?.filter((record) => record.sura_no === surahNumber).map((record) => [record.aya_no, record]) ?? [],
  ), [records, surahNumber]);
  const results = useMemo(() => records ? searchSmartQuran(records, query).slice(0, 30) : [], [records, query]);

  const openAlIkhlasPractice = () => {
    setActionAyah(null);
    onOpenAlIkhlas();
  };

  const openRecognitionTarget = (record: KfgqpcSmartRecord) => {
    const target = createRecognitionTargetFromKfgqpc(record);
    if (!target) return;
    setActionAyah(null);
    onOpenRecognitionTarget(target, `${record.sura_name_ar} · الآية ${record.aya_no}`);
  };
  const savedId = actionAyah ? `quran:${actionAyah.sura_no}:${actionAyah.aya_no}` : null;
  const isSaved = !!savedId && savedContent.some((item) => item.id === savedId);
  const toggleSavedAyah = (record: KfgqpcSmartRecord) => {
    const id = `quran:${record.sura_no}:${record.aya_no}`;
    setSavedContent((current) => current.some((item) => item.id === id)
      ? removeSavedContent(id)
      : (recordLocalActivity('saved-item'), saveQuranAyah({ surahNumber: record.sura_no, surahName: record.sura_name_ar, ayahNumber: record.aya_no, page: record.page, juz: record.jozz })));
  };

  if (error) {
    return <section className="quran-data-state is-error" role="alert"><strong>تعذر تحميل النص الذكي</strong><span>تحقق من اتصالك أو أعد تحميل الصفحة. لم نعرض نصًا بديلًا غير موثّق.</span><small>{error}</small></section>;
  }

  if (!records || !surah) {
    return <section className="quran-data-state" aria-live="polite"><strong>جارٍ تجهيز النص العثماني الذكي…</strong><span>يتم التحقق محليًا من ٦٬٢٣٦ آية من المصدر الرسمي.</span></section>;
  }

  return <section className="smart-quran-reader" aria-label="النص العثماني الذكي">
    <header className="smart-reader-header">
      <div><p className="eyebrow">النص العثماني الذكي</p><h2>{surah.name}</h2><p>السورة {surahNumber} · {surah.ayahs.length} آية · حفص عن عاصم</p></div>
      <div className="smart-reader-actions">
        <label>اختر سورة
          <select value={surahNumber} onChange={(event) => { setSurahNumber(Number(event.target.value)); setSelectedAyah(null); setActionAyah(null); }}>
            {quranCatalog.map((entry) => <option key={entry.number} value={entry.number}>{entry.number} · {entry.name}</option>)}
          </select>
        </label>
        {surahNumber === 112 && <button type="button" className="button button-primary" onClick={openAlIkhlasPractice}>ابدأ التسميع</button>}
      </div>
    </header>

    <details className="reader-settings">
      <summary>إعدادات القراءة</summary>
      <div>
        <label>حجم النص<select value={readerSettings.fontScale} onChange={(event) => updateReaderSettings({ ...readerSettings, fontScale: event.target.value as QuranReaderSettings['fontScale'] })}><option value="standard">قياسي</option><option value="large">كبير</option><option value="x-large">كبير جدًا</option></select></label>
        <label>تباعد السطور<select value={readerSettings.lineSpacing} onChange={(event) => updateReaderSettings({ ...readerSettings, lineSpacing: event.target.value as QuranReaderSettings['lineSpacing'] })}><option value="comfortable">مريح</option><option value="spacious">واسع</option></select></label>
        <label className="reader-focus-toggle"><input type="checkbox" checked={readerSettings.focusMode} onChange={(event) => updateReaderSettings({ ...readerSettings, focusMode: event.target.checked })} /> وضع التركيز</label>
      </div>
      <small>تُحفظ هذه التفضيلات على جهازك فقط، ولا تغيّر النص القرآني.</small>
    </details>

    {!readerSettings.focusMode && <label className="smart-search"><span>ابحث في القرآن</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بكلمات الآية" /></label>}
    <QuranAudioPlayer surahNumber={surahNumber} ayahCount={surah.ayahs.length} selectedAyah={selectedAyah} onSelectAyah={setSelectedAyah} onActiveAyah={setActiveAyah} />
    {query && <div className="smart-search-results" aria-live="polite">
      <strong>نتائج البحث: {results.length}{results.length === 30 ? '+' : ''}</strong>
      {results.map((result) => <button type="button" key={result.id} onClick={() => { setSurahNumber(result.sura_no); setSelectedAyah(result.aya_no); setQuery(''); }}>
        <span>{result.sura_name_ar} · الآية {result.aya_no} · الجزء {result.jozz} · صفحة {result.page}</span>
        <b className="smart-ayah" lang="ar">{result.aya_text}</b>
      </button>)}
      {results.length === 0 && <p>لا توجد نتائج مطابقة.</p>}
    </div>}

    <div className={`smart-ayah-list reader-font-${readerSettings.fontScale} reader-spacing-${readerSettings.lineSpacing}`} aria-label={`آيات سورة ${surah.name}`}>
      {surah.ayahs.map((ayah) => {
        const record = recordByAyah.get(ayah.ayahNumber);
        return <button type="button" key={ayah.ayahNumber} className={`smart-ayah-card${selectedAyah === ayah.ayahNumber ? ' is-selected' : ''}${activeAyah === ayah.ayahNumber ? ' is-playing' : ''}`} onClick={() => {
          setSelectedAyah(ayah.ayahNumber);
          if (record) setActionAyah(record);
        }}>
          <div className="smart-ayah-meta"><span>الآية {ayah.ayahNumber}</span><span>الجزء {ayah.juz} · صفحة {ayah.page}</span></div>
          <p className="smart-ayah" lang="ar">{ayah.text}</p><small>اضغط لخيارات الآية</small>
        </button>;
      })}
    </div>
    <p className="smart-source-note">المصدر: بيانات حفص الذكية v0.8 من مجمع الملك فهد. هذا العرض على مستوى الآية، وليس محاكاة مطابقة لصفحة مصحف مطبوع.</p>

    {actionAyah && <div className="ayah-sheet-backdrop" role="presentation" onClick={() => setActionAyah(null)}>
      <section className="ayah-action-sheet" role="dialog" aria-modal="true" aria-label={`خيارات الآية ${actionAyah.aya_no}`} onClick={(event) => event.stopPropagation()}>
        <header><div><p className="eyebrow">خيارات الآية</p><h3>{actionAyah.sura_name_ar} · الآية {actionAyah.aya_no}</h3></div><button type="button" aria-label="إغلاق خيارات الآية" onClick={() => setActionAyah(null)}>×</button></header>
        <p>نص القرآن الكريم يظهر في العارض أعلاه. لا يختلط بالتفسير أو بردود الذكاء الاصطناعي.</p>
        <div className="ayah-actions">
          <button type="button" onClick={() => toggleSavedAyah(actionAyah)}>{isSaved ? 'إزالة من المحفوظات' : 'حفظ الآية'}</button>
          {createRecognitionTargetFromKfgqpc(actionAyah)
            ? <button type="button" className="button button-primary" onClick={() => openRecognitionTarget(actionAyah)}>ابدأ التسميع</button>
            : actionAyah.sura_no === 112
            ? <button type="button" className="button button-primary" onClick={openAlIkhlasPractice}>ابدأ التسميع</button>
            : <span className="reader-unavailable">التسميع الذكي لهذه الآية قيد التحقق من تغطية الحروف</span>}
          <span className="reader-unavailable">اختر الآية ثم استخدم مشغّل التلاوة الصوتية أعلاه.</span>
          <span className="reader-unavailable">التفسير الميسر قريبًا</span>
          <span className="reader-unavailable">الهجاء الإصبعي قريبًا</span>
          <span className="reader-unavailable">تفسير المعاني بلغة الإشارة قريبًا</span>
        </div>
      </section>
    </div>}
  </section>;
}
