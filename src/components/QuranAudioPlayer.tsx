import { useEffect, useRef, useState } from 'react';
import { getMp3QuranSurahUrl, loadAyahTimings, MP3_QURAN_TIMING_READ, repeatShouldContinue, timingForAyah, type AyahTiming } from '../lib/mp3Quran';

type QuranAudioPlayerProps = {
  surahNumber: number;
  ayahCount: number;
  selectedAyah: number | null;
  onSelectAyah: (ayahNumber: number) => void;
  onActiveAyah: (ayahNumber: number | null) => void;
};

export function QuranAudioPlayer({ surahNumber, ayahCount, selectedAyah, onSelectAyah, onActiveAyah }: QuranAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const repeatCompletions = useRef(0);
  const [timings, setTimings] = useState<AyahTiming[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [volume, setVolume] = useState(.8);
  const [repeatCount, setRepeatCount] = useState<1 | 3 | 5 | 10 | 'continuous'>(1);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setStatus('idle'); setTimings([]); setElapsed(0); setDuration(0); repeatCompletions.current = 0; onActiveAyah(null);
  }, [surahNumber, onActiveAyah]);

  const ensureTimings = async () => {
    if (timings.length) return timings;
    const loaded = await loadAyahTimings(surahNumber);
    setTimings(loaded);
    return loaded;
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setStatus('loading');
    try {
      await ensureTimings();
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
      const loaded = await ensureTimings();
      const timing = timingForAyah(loaded, ayahNumber);
      onSelectAyah(ayahNumber);
      if (timing) audio.currentTime = timing.start_time / 1000;
      await play();
    } catch { setStatus('error'); }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setElapsed(audio.currentTime);
    const active = timings.find((timing) => timing.ayah > 0 && audio.currentTime * 1000 >= timing.start_time && audio.currentTime * 1000 < timing.end_time) ?? null;
    onActiveAyah(active?.ayah ?? null);
    const repeated = selectedAyah ? timingForAyah(timings, selectedAyah) : null;
    if (repeated && audio.currentTime * 1000 >= repeated.end_time) {
      if (repeatShouldContinue(repeatCompletions.current, repeatCount)) {
        repeatCompletions.current += 1;
        audio.currentTime = repeated.start_time / 1000;
      } else {
        audio.pause(); setStatus('paused'); repeatCompletions.current = 0;
      }
    }
  };

  const stop = () => { const audio = audioRef.current; if (!audio) return; audio.pause(); audio.currentTime = 0; setStatus('idle'); onActiveAyah(null); };
  const previous = () => seekToAyah(Math.max(1, (selectedAyah ?? 1) - 1));
  const next = () => seekToAyah(Math.min(ayahCount, (selectedAyah ?? 0) + 1));

  return <section className="quran-audio-player" aria-label="التلاوة الصوتية">
    <audio ref={audioRef} src={getMp3QuranSurahUrl(surahNumber)} preload="metadata" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onPause={() => setStatus((current) => current === 'error' ? current : 'paused')} onEnded={() => { setStatus('idle'); onActiveAyah(null); }} />
    <div><p className="eyebrow">التلاوة الصوتية</p><strong>{MP3_QURAN_TIMING_READ.name}</strong><span>{MP3_QURAN_TIMING_READ.rewaya} · مصدر MP3Quran الرسمي</span></div>
    <div className="audio-controls">
      <button type="button" onClick={previous} aria-label="الآية السابقة">السابق</button>
      {status === 'playing' ? <button type="button" onClick={() => audioRef.current?.pause()}>إيقاف مؤقت</button> : <button type="button" onClick={play}>استمع للسورة</button>}
      <button type="button" onClick={stop}>إيقاف</button><button type="button" onClick={next} aria-label="الآية التالية">التالي</button>
    </div>
    <div className="audio-options"><label>تكرار الآية<select value={repeatCount} onChange={(event) => { repeatCompletions.current = 0; setRepeatCount(event.target.value === 'continuous' ? 'continuous' : Number(event.target.value) as 1 | 3 | 5 | 10); }}><option value="1">مرة واحدة</option><option value="3">٣ مرات</option><option value="5">٥ مرات</option><option value="10">١٠ مرات</option><option value="continuous">حتى الإيقاف</option></select></label><label>الصوت<input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => { const nextVolume = Number(event.target.value); setVolume(nextVolume); if (audioRef.current) audioRef.current.volume = nextVolume; }} /></label><span>{Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')} / {Number.isFinite(duration) ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '—'}</span></div>
    {status === 'loading' && <small>جارٍ تجهيز التوقيتات الرسمية…</small>}{status === 'error' && <small role="alert">تعذر تحميل التلاوة أو توقيتاتها. تحقق من الاتصال ثم أعد المحاولة.</small>}
  </section>;
}
