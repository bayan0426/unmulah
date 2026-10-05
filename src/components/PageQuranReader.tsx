import { useEffect, useMemo, useState } from 'react';
import { createRecognitionTargetFromKfgqpc, type KfgqpcRecognitionTarget } from '../lib/quranCoverageAudit';
import { loadKfgqpcSmartRecords, type KfgqpcSmartRecord } from '../data/quran/kfgqpcSmartProvider';

type Props = { onOpenRecognitionTarget: (target: KfgqpcRecognitionTarget, label: string) => void };

export function PageQuranReader({ onOpenRecognitionTarget }: Props) {
  const [records, setRecords] = useState<KfgqpcSmartRecord[] | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<KfgqpcSmartRecord | null>(null);
  useEffect(() => { loadKfgqpcSmartRecords().then(setRecords).catch(() => setRecords([])); }, []);
  const pageRecords = useMemo(() => records?.filter((record) => record.page === page) ?? [], [records, page]);
  const starts = new Set(pageRecords.filter((record, index) => index === 0 || pageRecords[index - 1].sura_no !== record.sura_no).map((record) => record.id));
  if (!records) return <section className="quran-data-state" aria-live="polite">جارٍ تجهيز النص العثماني…</section>;
  if (records.length === 0) return <section className="quran-data-state is-error" role="alert">تعذر تجهيز النص العثماني المحلي.</section>;
  const target = selected ? createRecognitionTargetFromKfgqpc(selected) : null;
  return <section className="page-quran-reader" dir="rtl" aria-label="عرض الصفحات">
    <header className="page-reader-toolbar"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>السابقة</button><div><span>عرض الصفحات</span><strong>الصفحة {page}</strong></div><button type="button" onClick={() => setPage((value) => Math.min(604, value + 1))} disabled={page === 604}>التالية</button></header>
    <div className="page-quran-paper">
      {pageRecords.map((record) => <div className="page-ayah-flow" key={record.id}>
        {starts.has(record.id) && <div className="page-surah-heading">{record.sura_name_ar}</div>}
        <button type="button" onClick={() => setSelected(record)} className="page-ayah-text" aria-label={`خيارات الآية ${record.aya_no}`}><span lang="ar">{record.aya_text}</span><b aria-hidden="true">۝{record.aya_no}</b></button>
      </div>)}
      <footer>صفحة {page} · الجزء {pageRecords[0]?.jozz}</footer>
    </div>
    {selected && <div className="ayah-sheet-backdrop" onClick={() => setSelected(null)} role="presentation"><section className="ayah-action-sheet" role="dialog" aria-modal="true" aria-label={`خيارات الآية ${selected.aya_no}`} onClick={(event) => event.stopPropagation()}><header><div><p className="eyebrow">خيارات الآية</p><h3>{selected.sura_name_ar} · الآية {selected.aya_no}</h3></div><button type="button" onClick={() => setSelected(null)} aria-label="إغلاق خيارات الآية">×</button></header><p>يمكنك الانتقال إلى التسميع بالإشارة عندما تكون حروف هذه الآية مدعومة بالتحقق المحلي.</p>{target ? <button type="button" className="button button-primary" onClick={() => onOpenRecognitionTarget(target, `${selected.sura_name_ar} · الآية ${selected.aya_no}`)}>سمّع بالإشارة</button> : <span className="reader-unavailable">التسميع بالإشارة غير متاح لهذه الآية حاليًا بسبب حروف غير مدعومة.</span>}</section></div>}
  </section>;
}
