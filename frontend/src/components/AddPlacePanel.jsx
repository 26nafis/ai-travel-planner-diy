import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';

export default function AddPlacePanel({ open, dayNumber, destinations, usedIds, onAdd, onClose }) {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); setQ(''); }
    if (!open && d.open) d.close();
  }, [open]);

  const list = useMemo(() => destinations.filter((d) => !usedIds.has(d.id))
    .filter((d) => cat === 'all' || d.categories.includes(cat))
    .filter((d) => !q.trim() || `${d.name} ${d.regency}`.toLowerCase().includes(q.trim().toLowerCase())), [destinations, usedIds, q, cat]);

  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }} aria-labelledby="add-title"
      className="m-0 ml-auto h-full max-h-none w-full max-w-md bg-surface p-0 text-tinta backdrop:bg-tinta/40 sm:rounded-l-2xl">
      <div className="flex h-full flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-between border-b border-garis px-5 py-4">
          <h2 id="add-title" className="text-lg font-extrabold">{t.trip.addTo(dayNumber)}</h2>
          <button className="rounded-full p-2 hover:bg-white" onClick={onClose} aria-label={t.trip.cancel}><X /></button>
        </div>
        <div className="space-y-3 border-b border-garis px-5 py-4">
          <input className="field" placeholder={t.trip.searchPlaces} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.trip.searchPlaces} />
          <div className="flex flex-wrap gap-1.5">
            {['all', 'nature', 'culture', 'culinary', 'activity'].map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c}
                className={`chip px-3 py-1.5 text-xs ${cat === c ? 'border-primary bg-primary text-white' : 'border-garis bg-white text-abu'}`}>
                {c === 'all' ? t.trip.allCats : t.cat[c]}
              </button>
            ))}
          </div>
        </div>
        <ul className="flex-1 divide-y divide-garis overflow-y-auto">
          {list.map((d) => (
            <li key={d.id} className="flex items-start gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{d.name}</p>
                <p className="text-sm text-abu">{d.regency}</p>
                <p className="mt-1 text-sm">{d.desc[lang]}</p>
              </div>
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white hover:bg-primary-600"
                onClick={() => onAdd(d.id)} aria-label={`${t.trip.addPlace}: ${d.name}`}><Plus size={18} /></button>
            </li>
          ))}
          {!list.length && <li className="px-5 py-6 text-sm text-abu">{t.plan.searchEmpty}</li>}
        </ul>
      </div>
    </dialog>
  );
}
