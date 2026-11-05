import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, RefreshCw, Trash2, MapPin, Info } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { api, IS_DEMO } from '../services/api.js';
import { dayColor } from '../lib/geo.js';
import { useToast } from '../components/Toast.jsx';
import TripMap from '../components/TripMap.jsx';
import DayTimeline from '../components/DayTimeline.jsx';
import AddPlacePanel from '../components/AddPlacePanel.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';

export default function TripDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const toast = useToast();
  const nav = useNavigate();

  const [trip, setTrip] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [activeDay, setActiveDay] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(null); // 'save' | 'all' | dayIndex
  const [addFor, setAddFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    Promise.all([api.getTrip(id), api.listDestinations()])
      .then(([tr, ds]) => { setTrip(tr); setDestinations(ds); })
      .catch((e) => setLoadError(e.code === 'NOT_FOUND' ? t.trip.notFound : e.message));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const placesById = useMemo(() => Object.fromEntries(destinations.map((d) => [d.id, d])), [destinations]);
  const usedIds = useMemo(() => new Set(trip?.days.flatMap((d) => d.items.map((i) => i.destinationId)) || []), [trip]);

  const points = useMemo(() => {
    if (!trip) return [];
    return trip.days.flatMap((d, di) => (activeDay === 'all' || activeDay === di ? d.items : [])
      .map((it, i) => placesById[it.destinationId] && ({ ...placesById[it.destinationId], title: placesById[it.destinationId].name, number: i + 1, day: di, color: dayColor(di) }))
      .filter(Boolean));
  }, [trip, placesById, activeDay]);

  if (loadError) return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-lg">{loadError}</p>
      <Link to="/perjalanan" className="btn-ghost mt-6">{t.trip.back}</Link>
    </div>
  );
  if (!trip) return <div className="grid min-h-[60vh] place-items-center"><Spinner /></div>;

  // Setiap perubahan langsung disimpan ke backend (atau localStorage di mode demo).
  const persistDays = (days) => {
    const next = { ...trip, days };
    setTrip(next);
    api.updateTrip(trip.id, { days }).catch((e) => toast(e.message || t.errors.generic, 'error'));
  };
  const editDay = (di, fn) => persistDays(trip.days.map((d, i) => (i === di ? { ...d, items: fn([...d.items]) } : d)));

  const actions = {
    select: (pid) => setActiveId(pid),
    move: (di, idx, dir) => editDay(di, (items) => { const j = idx + dir; [items[idx], items[j]] = [items[j], items[idx]]; return items; }),
    remove: (di, idx) => editDay(di, (items) => items.filter((_, i) => i !== idx)),
    moveToDay: (di, idx, target) => {
      if (target === di) return;
      const item = trip.days[di].items[idx];
      persistDays(trip.days.map((d, i) => {
        if (i === di) return { ...d, items: d.items.filter((_, k) => k !== idx) };
        if (i === target) return { ...d, items: [...d.items, item] };
        return d;
      }));
    },
    openAdd: (di) => setAddFor(di),
    regenerateDay: async (di) => {
      setBusy(di);
      try { setTrip(await api.regenerate(trip.id, { dayIndex: di })); toast(t.trip.regeneratedToast); }
      catch (e) { toast(e.message || t.errors.generic, 'error'); }
      finally { setBusy(null); }
    },
  };

  const regenerateAll = async () => {
    setBusy('all');
    try { setTrip(await api.regenerate(trip.id)); toast(t.trip.regeneratedToast); }
    catch (e) { toast(e.message || t.errors.generic, 'error'); }
    finally { setBusy(null); }
  };
  const save = async () => {
    setBusy('save');
    try { setTrip(await api.saveTrip(trip.id, { title: trip.title, days: trip.days })); toast(t.trip.savedToast); }
    catch (e) { toast(e.message || t.errors.generic, 'error'); }
    finally { setBusy(null); }
  };
  const remove = async () => {
    setConfirmDelete(false);
    try { await api.deleteTrip(trip.id); toast(t.trip.deletedToast); nav('/perjalanan'); }
    catch (e) { toast(e.message || t.errors.generic, 'error'); }
  };

  const visibleDays = trip.days.map((d, i) => ({ d, i })).filter(({ i }) => activeDay === 'all' || activeDay === i);
  const tabCls = (on) => `shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${on ? 'bg-primary text-white' : 'bg-white text-abu border border-garis hover:text-tinta'}`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      {/* Kepala halaman */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${trip.saved ? 'bg-success-50 text-success-700' : 'bg-accent-50 text-accent-700'}`}>
            {trip.saved ? t.trip.saved : t.trip.unsaved}
          </span>
          <label htmlFor="trip-title" className="sr-only">{t.trip.titlePlaceholder}</label>
          <input id="trip-title" value={trip.title ?? ''} placeholder={t.trip.defaultTitle(trip.durationDays)}
            onChange={(e) => setTrip({ ...trip, title: e.target.value })}
            onBlur={() => api.updateTrip(trip.id, { title: trip.title }).catch(() => {})}
            className="mt-2 w-full border-0 border-b-2 border-transparent bg-transparent p-0 text-3xl font-extrabold text-tinta placeholder:text-tinta focus:border-primary focus:outline-none focus:ring-0 sm:text-4xl" />
          <p className="mt-2 flex items-center gap-1.5 text-sm text-abu">
            <MapPin size={15} className="text-accent" /> {t.trip.from} <span className="font-semibold text-tinta">{trip.start.label}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={regenerateAll} disabled={busy !== null}>
            <RefreshCw size={16} className={busy === 'all' ? 'animate-spin' : ''} />{busy === 'all' ? t.trip.regenerating : t.trip.regenerateAll}
          </button>
          {trip.saved && <button className="btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={16} />{t.trip.delete}</button>}
          <button className="btn-cta" onClick={save} disabled={busy !== null}>
            <Save size={16} />{busy === 'save' ? t.trip.saving : t.trip.save}
          </button>
        </div>
      </div>

      {!IS_DEMO && trip.source === 'rules' && (
        <p className="mt-6 flex items-start gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700"><Info size={18} className="mt-0.5 shrink-0" />{t.trip.fallback}</p>
      )}

      {/* Tab hari */}
      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist">
        <button role="tab" aria-selected={activeDay === 'all'} className={tabCls(activeDay === 'all')} onClick={() => setActiveDay('all')}>{t.trip.allDays}</button>
        {trip.days.map((d, i) => (
          <button key={i} role="tab" aria-selected={activeDay === i} className={tabCls(activeDay === i)} onClick={() => setActiveDay(i)}>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: dayColor(i) }} aria-hidden="true" />
            {t.trip.dayLabel(d.dayNumber)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)]">
        <div className="order-2 lg:order-1">
          {visibleDays.map(({ d, i }) => (
            <DayTimeline key={i} day={d} dayIndex={i} totalDays={trip.days.length} placesById={placesById}
              color={dayColor(i)} activeId={activeId} busy={busy === i} actions={actions} />
          ))}
        </div>
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <h2 className="sr-only">{t.trip.mapTitle}</h2>
            <TripMap className="h-72 sm:h-96 lg:h-[calc(100vh-9rem)]" points={points} start={trip.start} activeId={activeId} onSelect={setActiveId} />
            <p className="mt-2 text-xs text-abu">{t.trip.straightLine}</p>
          </div>
        </aside>
      </div>

      <AddPlacePanel open={addFor !== null} dayNumber={(addFor ?? 0) + 1} destinations={destinations} usedIds={usedIds}
        onClose={() => setAddFor(null)}
        onAdd={(pid) => { editDay(addFor, (items) => [...items, { destinationId: pid, reasons: [], km: null }]); setAddFor(null); }} />
      <ConfirmDialog open={confirmDelete} message={t.trip.deleteConfirm} confirmLabel={t.trip.deleteTrip} cancelLabel={t.trip.cancel}
        onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
    </div>
  );
}
