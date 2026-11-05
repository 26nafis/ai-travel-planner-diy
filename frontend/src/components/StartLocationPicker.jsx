import { useMemo, useState } from 'react';
import { LocateFixed, Search, MapPinned, MapPin } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { START_SUGGESTIONS, DIY_BOUNDS } from '../data/destinations.js';
import { isInsideDIY } from '../lib/geo.js';
import TripMap from './TripMap.jsx';
import Spinner from './Spinner.jsx';

/**
 * value: { type: 'current'|'search'|'pin', label, lat, lng } | null
 * Pencarian alamat di mode demo memakai START_SUGGESTIONS.
 * TODO (tim): ganti dengan Google Places Autocomplete atau endpoint backend /api/geocode.
 */
export default function StartLocationPicker({ value, onChange }) {
  const { t } = useLang();
  const [mode, setMode] = useState(value?.type || 'search');
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return START_SUGGESTIONS.slice(0, 5);
    return START_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(q));
  }, [query]);

  // Izin lokasi hanya diminta setelah pengguna menekan tombol.
  const locate = () => {
    if (!navigator.geolocation) { setMessage(t.plan.locationUnavailable); return; }
    setLocating(true); setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!isInsideDIY(p, DIY_BOUNDS)) setMessage(t.plan.outsideDIY);
        onChange({ type: 'current', label: t.plan.startCurrent, ...p });
      },
      (err) => {
        setLocating(false);
        setMessage(err.code === err.PERMISSION_DENIED ? t.plan.locationDenied : t.plan.locationUnavailable);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const pick = (p) => {
    if (!isInsideDIY(p, DIY_BOUNDS)) { setMessage(t.plan.pinOutside); return; }
    setMessage(null);
    onChange({ type: 'pin', label: `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`, lat: p.lat, lng: p.lng });
  };

  const tabs = [
    { id: 'search', icon: Search, label: t.plan.startSearch },
    { id: 'current', icon: LocateFixed, label: t.plan.startCurrent },
    { id: 'pin', icon: MapPinned, label: t.plan.startPin },
  ];

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setMessage(null); }}
            className={`chip ${mode === id ? 'border-primary bg-primary-50 text-primary' : 'border-garis bg-white text-abu hover:text-tinta'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {mode === 'search' && (
          <div>
            <label htmlFor="start-search" className="sr-only">{t.plan.startSearch}</label>
            <input id="start-search" className="field" placeholder={t.plan.searchPlaceholder} value={query}
              onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
            <ul className="mt-2 divide-y divide-garis overflow-hidden rounded-xl border border-garis bg-white">
              {results.length ? results.map((r) => (
                <li key={r.label}>
                  <button type="button" onClick={() => { onChange({ type: 'search', ...r }); setQuery(r.label); }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-primary-50 ${value?.label === r.label ? 'bg-primary-50 font-semibold text-primary' : ''}`}>
                    <MapPin size={16} className="shrink-0 text-accent" /> {r.label}
                  </button>
                </li>
              )) : <li className="px-4 py-3 text-sm text-abu">{t.plan.searchEmpty}</li>}
            </ul>
          </div>
        )}

        {mode === 'current' && (
          <button type="button" className="btn-ghost" onClick={locate} disabled={locating}>
            {locating ? <Spinner className="h-4 w-4 border-2" /> : <LocateFixed size={16} />}
            {locating ? t.plan.locating : t.plan.useMyLocation}
          </button>
        )}

        {mode === 'pin' && (
          <div>
            <p className="mb-2 text-sm text-abu">{t.plan.pinHint}</p>
            <TripMap className="h-72 sm:h-80" start={value?.type === 'pin' ? value : null} onPick={pick} />
          </div>
        )}
      </div>

      {message && <p role="alert" className="mt-3 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">{message}</p>}

      {value && (
        <p className="mt-4 flex items-center gap-2 text-sm">
          <span className="grid h-4 w-4 place-items-center rounded-full border-[3px] border-white bg-tinta ring-1 ring-tinta" />
          <span className="text-abu">{t.plan.selected}:</span>
          <span className="font-semibold">{value.label}</span>
        </p>
      )}
      <p className="mt-2 text-xs text-abu">{t.plan.privacy}</p>
    </div>
  );
}
