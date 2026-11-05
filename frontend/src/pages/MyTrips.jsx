import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { api } from '../services/api.js';
import { dayColor } from '../lib/geo.js';
import { useToast } from '../components/Toast.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';

export default function MyTrips() {
  const { t, lang } = useLang();
  const toast = useToast();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => { api.listTrips().then(setTrips).catch((e) => setError(e.message)); }, []);

  const remove = async () => {
    const id = toDelete; setToDelete(null);
    try { await api.deleteTrip(id); setTrips((ts) => ts.filter((x) => x.id !== id)); toast(t.trip.deletedToast); }
    catch (e) { toast(e.message || t.errors.generic, 'error'); }
  };
  const fmt = (iso) => new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-tinta">{t.trips.title}</h1>
        <Link to="/rencanakan" className="btn-cta">{t.landing.cta}</Link>
      </div>

      {error && <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}
      {!trips && !error && <div className="grid min-h-[30vh] place-items-center"><Spinner /></div>}

      {trips && trips.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-garis px-6 py-12 text-center">
          <p className="text-lg font-bold">{t.trips.empty}</p>
          <p className="mx-auto mt-2 max-w-md text-abu">{t.trips.emptyLead}</p>
          <Link to="/rencanakan" className="btn-primary mt-6">{t.landing.cta}</Link>
        </div>
      )}

      {trips && trips.length > 0 && (
        <ul className="mt-8 divide-y divide-garis overflow-hidden rounded-xl bg-white px-5 shadow-card">
          {trips.map((tr) => {
            const count = tr.days.reduce((n, d) => n + d.items.length, 0);
            return (
              <li key={tr.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
                <div className="flex gap-1" aria-hidden="true">
                  {tr.days.slice(0, 7).map((_, i) => <span key={i} className="h-8 w-2 rounded-full" style={{ background: dayColor(i) }} />)}
                </div>
                <Link to={`/perjalanan/${tr.id}`} className="min-w-0 flex-1 sm:ml-3">
                  <p className="truncate text-lg font-bold hover:text-primary">{tr.title || t.trip.defaultTitle(tr.durationDays)}</p>
                  <p className="text-sm text-abu">{t.trip.from} {tr.start.label}. {t.trips.places(count)}. {t.trips.updated} {fmt(tr.updatedAt)}.</p>
                </Link>
                <div className="flex gap-2">
                  <Link to={`/perjalanan/${tr.id}`} className="btn-ghost py-2">{t.trips.open}</Link>
                  <button className="btn-danger py-2" onClick={() => setToDelete(tr.id)} aria-label={`${t.trip.delete}: ${tr.title || t.trip.defaultTitle(tr.durationDays)}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog open={!!toDelete} message={t.trip.deleteConfirm} confirmLabel={t.trip.deleteTrip} cancelLabel={t.trip.cancel}
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
