import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Trash2 } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { api } from '../services/api.js';
import { dayColor } from '../lib/geo.js';
import { useToast } from '../components/Toast.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function TripsLoadingState({ label }) {
  return (
    <div className="mt-8" aria-busy="true">
      <p role="status" className="sr-only">{label}</p>
      <ul aria-hidden="true" className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <li key={item} className="surface-panel min-w-0 animate-pulse p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="h-2 w-24 rounded-full bg-garis" />
              <span className="h-4 w-16 rounded bg-garis" />
            </div>
            <div className="mt-7 h-6 w-3/4 rounded bg-garis" />
            <div className="mt-4 h-4 w-full rounded bg-garis/80" />
            <div className="mt-2 h-4 w-2/3 rounded bg-garis/80" />
            <div className="mt-7 h-11 rounded-xl bg-garis/80" />
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-9 sm:px-6 sm:pt-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-garis pb-7">
        <div>
          <h1 className="text-4xl font-extrabold text-tinta">{t.trips.title}</h1>
        </div>
        <Link to="/rencanakan" className="btn-cta">{t.landing.cta}</Link>
      </div>

      {error && <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}
      {!trips && !error && <TripsLoadingState label={t.trips.loading} />}

      {trips && trips.length === 0 && (
        <div className="surface-panel mt-8 px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary"><MapPin size={22} /></span>
          <p className="mt-4 text-xl font-bold">{t.trips.empty}</p>
          <p className="mx-auto mt-2 max-w-md text-abu">{t.trips.emptyLead}</p>
          <Link to="/rencanakan" className="btn-primary mt-6">{t.landing.cta}</Link>
        </div>
      )}

      {trips && trips.length > 0 && (
        <ul className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((tr) => {
            const count = tr.days.reduce((n, d) => n + d.items.length, 0);
            return (
              <li key={tr.id} className="surface-panel flex min-w-0 flex-col p-5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex gap-1.5" aria-hidden="true">
                    {tr.days.slice(0, 7).map((_, i) => <span key={i} className="h-2 w-7 rounded-full" style={{ background: dayColor(i) }} />)}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-abu"><CalendarDays size={14} /> {tr.durationDays} {t.plan.days}</span>
                </div>
                <Link to={`/perjalanan/${tr.id}`} className="min-w-0 flex-1 rounded-md">
                  <p className="line-clamp-2 text-xl font-bold leading-snug text-tinta hover:text-primary">{tr.title || t.trip.defaultTitle(tr.durationDays)}</p>
                  <p className="mt-3 flex items-start gap-2 text-sm leading-5 text-abu"><MapPin size={15} className="mt-0.5 shrink-0 text-primary" /><span className="line-clamp-2">{tr.start.label}</span></p>
                  <p className="mt-3 text-xs font-medium text-abu">{t.trips.places(count)} <span aria-hidden="true">·</span> {t.trips.updated} {fmt(tr.updatedAt)}</p>
                </Link>
                <div className="mt-5 flex gap-2 border-t border-garis pt-4">
                  <Link to={`/perjalanan/${tr.id}`} className="btn-primary flex-1">{t.trips.open}</Link>
                  <button type="button" className="btn-danger" onClick={() => setToDelete(tr.id)} aria-label={`${t.trip.delete}: ${tr.title || t.trip.defaultTitle(tr.durationDays)}`}>
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
