import { useEffect, useRef, useState } from 'react';
import { getMp3QuranSurahUrl, loadAyahTimings, loadTimingReciters, MP3_QURAN_TIMING_READ, readSavedReciter, repeatShouldContinue, saveSelectedReciter, timingForAyah, timingRange, type AyahTiming, type Mp3QuranReciter } from '../lib/mp3Quran';

type QuranAudioPlayerProps = {
  surahNumber: number;
  ayahCount: number;
  selectedAyah: number | null;
  onSelectAyah: (ayahNumber: number) => void;
  onActiveAyah: (ayahNumber: number | null) => void;
  onListeningProgress?: (seconds: number) => void;
};

export function QuranAudioPlayer({ surahNumber, ayahCount, selectedAyah, onSelectAyah, onActiveAyah, onListeningProgress }: QuranAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const repeatCompletions = useRef(0);
  const countedSecond = useRef(0);
  const [timings, setTimings] = useState<AyahTiming[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [volume, setVolume] = useState(.8);
  const [repeatCount, setRepeatCount] = useState<1 | 3 | 5 | 10 | 'continuous'>(1);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [reciters, setReciters] = useState<Mp3QuranReciter[]>([MP3_QURAN_TIMING_READ]);
  const [reciter, setReciter] = useState<Mp3QuranReciter>(MP3_QURAN_TIMING_READ);
  const [reciterQuery, setReciterQuery] = useState('');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(ayahCount);
  const [rangeRepeatActive, setRangeRepeatActive] = useState(false);
  useEffect(() => { loadTimingReciters().then((items) => { if (items.length) { setReciters(items); setReciter(readSavedReciter(items)); } }).catch(() => {}); }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setStatus('idle'); countedSecond.current = 0; setTimings([]); setElapsed(0); setDuration(0); setRangeStart(1); setRangeEnd(ayahCount); setRangeRepeatActive(false); repeatCompletions.current = 0; onActiveAyah(null);
  }, [surahNumber, reciter, onActiveAyah]);

  const ensureTimings = async () => {
    if (timings.length) return timings;
    const loaded = await loadAyahTimings(surahNumber, reciter);
    setTimings(loaded);
    return loaded;
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setStatus('loading');
    try {
      if (reciter.supportsAyahTiming) await ensureTimings();
      await audio.play();
      setStatus('playing');
    } catch {
      setStatus('error');
    }
  };

  const seekToAyah = async (ayahNumber: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (!reciter.supportsAyahTiming) return;
      setRangeRepeatActive(false);
      const loaded = await ensureTimings();
      const timing = timingForAyah(loaded, ayahNumber);
      onSelectAyah(ayahNumber);
      if (timing) audio.currentTime = timing.start_time / 1000;
      await play();
    } catch { setStatus('error'); }
  };

  const repeatRange = async () => {
    const audio = audioRef.current;
    if (!audio || !reciter.supportsAyahTiming) return;
    setStatus('loading');
    try {
      const loaded = await ensureTimings();
      const range = timingRange(loaded, rangeStart, rangeEnd);
      if (!range) throw new Error('The requested ayah range has no verified timing.');
      repeatCompletions.current = 0;
      setRangeRepeatActive(true);
      onSelectAyah(rangeStart);
      audio.currentTime = range.start.start_time / 1000;
      await audio.play();
      setStatus('playing');
    } catch { setStatus('error'); }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setElapsed(audio.currentTime);
    const wholeSecond = Math.floor(audio.currentTime); if (wholeSecond > countedSecond.current) { onListeningProgress?.(wholeSecond - countedSecond.current); countedSecond.current = wholeSecond; }
    const active = timings.find((timing) => timing.ayah > 0 && audio.currentTime * 1000 >= timing.start_time && audio.currentTime * 1000 < timing.end_time) ?? null;
    onActiveAyah(active?.ayah ?? null);
    const range = rangeRepeatActive ? timingRange(timings, rangeStart, rangeEnd) : null;
    const repeated = range ? null : selectedAyah ? timingForAyah(timings, selectedAyah) : null;
    const end = range?.end ?? repeated;
    const restart = range?.start ?? repeated;
    if (end && restart && audio.currentTime * 1000 >= end.end_time) {
      if (repeatShouldContinue(repeatCompletions.current, repeatCount)) {
        repeatCompletions.current += 1;
        audio.currentTime = restart.start_time / 1000;
      } else {
        audio.pause(); setStatus('paused'); repeatCompletions.current = 0;
      }
    }
  };

  const stop = () => { const audio = audioRef.current; if (!audio) return; audio.pause(); audio.currentTime = 0; setRangeRepeatActive(false); repeatCompletions.current = 0; setStatus('idle'); onActiveAyah(null); };
  const previous = () => seekToAyah(Math.max(1, (selectedAyah ?? 1) - 1));
  const next = () => seekToAyah(Math.min(ayahCount, (selectedAyah ?? 0) + 1));

  const switchReciter = (id: number) => { const next = reciters.find((item) => item.id === id); if (!next) return; audioRef.current?.pause(); setRangeRepeatActive(false); setReciter(next); saveSelectedReciter(next); setStatus('loading'); };
  const visibleReciters = reciters.filter((item) => item.name.includes(reciterQuery.trim()));
  return <section className="quran-audio-player" aria-label="التلاوة الصوتية">
    <audio ref={audioRef} src={getMp3QuranSurahUrl(surahNumber, reciter)} preload="metadata" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onPause={() => setStatus((current) => current === 'error' ? current : 'paused')} onEnded={() => { setStatus('idle'); onActiveAyah(null); }} />
    <div><p className="eyebrow">التلاوة الصوتية</p>{reciters.length > 8 && <label className="reciter-search">ابحث عن قارئ<input value={reciterQuery} onChange={(event) => setReciterQuery(event.target.value)} placeholder="اسم القارئ" /></label>}<label>اختر القارئ<select value={reciter.id} onChange={(event) => switchReciter(Number(event.target.value))}>{visibleReciters.some((item) => item.id === reciter.id) || <option value={reciter.id}>{reciter.name}</option>}{visibleReciters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><strong>{reciter.name}</strong><span>{reciter.rewaya} · مصدر MP3Quran الرسمي</span></div>
    <div className="audio-controls">
      <button type="button" onClick={previous} disabled={!reciter.supportsAyahTiming} aria-label="الآية السابقة">السابق</button>
      {status === 'playing' ? <button type="button" onClick={() => audioRef.current?.pause()}>إيقاف مؤقت</button> : <button type="button" onClick={play}>استمع للسورة</button>}
      <button type="button" onClick={stop}>إيقاف</button><button type="button" onClick={next} disabled={!reciter.supportsAyahTiming} aria-label="الآية التالية">التالي</button>
    </div>
    {!reciter.supportsAyahTiming && <small>توقيت الآيات غير متاح لهذا القارئ حاليًا؛ تتوفر تلاوة السورة كاملة فقط.</small>}
    <div className="audio-options"><label>تكرار الآية<select value={repeatCount} onChange={(event) => { repeatCompletions.current = 0; setRepeatCount(event.target.value === 'continuous' ? 'continuous' : Number(event.target.value) as 1 | 3 | 5 | 10); }}><option value="1">مرة واحدة</option><option value="3">٣ مرات</option><option value="5">٥ مرات</option><option value="10">١٠ مرات</option><option value="continuous">حتى الإيقاف</option></select></label><label>الصوت<input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => { const nextVolume = Number(event.target.value); setVolume(nextVolume); if (audioRef.current) audioRef.current.volume = nextVolume; }} /></label><span>{Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')} / {Number.isFinite(duration) ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '—'}</span></div>
    {reciter.supportsAyahTiming && <div className="audio-range" aria-label="تكرار نطاق من الآيات"><label>من الآية<select value={rangeStart} onChange={(event) => { const value = Number(event.target.value); setRangeStart(value); if (value > rangeEnd) setRangeEnd(value); setRangeRepeatActive(false); }}>{Array.from({ length: ayahCount }, (_, index) => index + 1).map((ayah) => <option key={ayah} value={ayah}>{ayah}</option>)}</select></label><label>إلى الآية<select value={rangeEnd} onChange={(event) => { const value = Number(event.target.value); setRangeEnd(value); if (value < rangeStart) setRangeStart(value); setRangeRepeatActive(false); }}>{Array.from({ length: ayahCount }, (_, index) => index + 1).map((ayah) => <option key={ayah} value={ayah}>{ayah}</option>)}</select></label><button type="button" onClick={repeatRange}>كرر النطاق</button></div>}
    {status === 'loading' && <small>{reciter.supportsAyahTiming ? 'جارٍ تجهيز تلاوة القارئ والتوقيتات الرسمية…' : 'جارٍ تجهيز تلاوة القارئ...'}</small>}{status === 'error' && <small role="alert">تعذر تحميل تلاوة هذا القارئ أو توقيتاتها. تحقق من الاتصال ثم اختر قارئًا آخر أو أعد المحاولة.</small>}
  </section>;
}
