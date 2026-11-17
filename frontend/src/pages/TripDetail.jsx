import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, RefreshCw, Trash2, MapPin, Info, Route, Clock3 } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { api, IS_DEMO } from '../services/api.js';
import { dayColor } from '../lib/geo.js';
import { useToast } from '../components/Toast.jsx';
import TripMap from '../components/TripMap.jsx';
import DayTimeline from '../components/DayTimeline.jsx';
import AddPlacePanel from '../components/AddPlacePanel.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { getDrivingRoute } from '../services/routing.js';

function originForDay(trip, placesById, dayIndex) {
  if (dayIndex === 0) return trip.start;
  const previousStops = trip.days[dayIndex - 1]?.items || [];
  for (let index = previousStops.length - 1; index >= 0; index -= 1) {
    const place = placesById[previousStops[index].destinationId];
    if (Number.isFinite(place?.lat) && Number.isFinite(place?.lng)) return { ...place, label: place.name };
  }
  return trip.start;
}

function TripDetailLoadingState({ label }) {
  return (
    <div className="mx-auto max-w-[92rem] px-4 pb-16 pt-7 sm:px-6 lg:px-8" aria-busy="true">
      <p role="status" className="sr-only">{label}</p>
      <div aria-hidden="true" className="animate-pulse border-b border-garis pb-6">
        <div className="h-6 w-24 rounded-full bg-garis" />
        <div className="mt-4 h-10 w-full max-w-2xl rounded bg-garis/80" />
        <div className="mt-4 h-4 w-56 max-w-full rounded bg-garis/80" />
      </div>
      <div aria-hidden="true" className="mt-6 flex gap-2 overflow-hidden">
        {[0, 1, 2, 3].map((item) => <span key={item} className="h-10 w-24 shrink-0 animate-pulse rounded-lg bg-garis/80" />)}
      </div>
      <div aria-hidden="true" className="mt-6 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(350px,0.82fr)] xl:gap-10">
        <div className="order-2 space-y-5 lg:order-1">
          {[0, 1, 2].map((item) => (
            <div key={item} className="surface-panel animate-pulse p-5">
              <div className="h-6 w-28 rounded bg-garis" />
              <div className="mt-5 h-36 rounded-xl bg-garis/60" />
              <div className="mt-3 h-4 w-4/5 rounded bg-garis/80" />
            </div>
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <div className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-garis p-4">
              <div className="h-8 w-36 rounded bg-garis/80" />
              <div className="h-10 w-24 rounded-xl bg-garis/80" />
            </div>
            <div className="h-[19rem] animate-pulse bg-primary-50 sm:h-[24rem] lg:h-[min(58vh,38rem)]" />
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
              <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
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
  const [routeDayIndex, setRouteDayIndex] = useState(0);
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

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

  const routeDay = activeDay === 'all' ? routeDayIndex : activeDay;
  const routePlan = useMemo(() => {
    if (!trip?.days?.[routeDay]) return { start: trip?.start ?? null, points: [] };
    const origin = originForDay(trip, placesById, routeDay);
    const destinationsForDay = trip.days[routeDay].items
      .map((item) => placesById[item.destinationId])
      .filter((place) => Number.isFinite(place?.lat) && Number.isFinite(place?.lng));
    return { start: origin, points: [origin, ...destinationsForDay].filter((place) => Number.isFinite(place?.lat) && Number.isFinite(place?.lng)) };
  }, [trip, placesById, routeDay]);

  useEffect(() => {
    let current = true;
    setRouteResult(null);
    setRouteError(null);
    if (routePlan.points.length < 2) {
      setRouteLoading(false);
      setRouteError(t.trip.routeTooShort);
      return () => { current = false; };
    }
    setRouteLoading(true);
    getDrivingRoute(routePlan.points)
      .then((result) => { if (current) setRouteResult(result); })
      .catch(() => { if (current) setRouteError(t.trip.routeUnavailable); })
      .finally(() => { if (current) setRouteLoading(false); });
    return () => { current = false; };
  }, [routePlan, t]);

  if (loadError) return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-lg">{loadError}</p>
      <Link to="/perjalanan" className="btn-ghost mt-6">{t.trip.back}</Link>
    </div>
  );
  if (!trip) return <TripDetailLoadingState label={t.trip.loading} />;

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
    <div className="mx-auto max-w-[92rem] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
      {/* Kepala halaman */}
      <div className="flex flex-col gap-5 border-b border-garis pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${trip.saved ? 'bg-success-50 text-success-700' : 'bg-accent-50 text-accent-700'}`}>
            {trip.saved ? t.trip.saved : t.trip.unsaved}
          </span>
          <label htmlFor="trip-title" className="sr-only">{t.trip.titlePlaceholder}</label>
          <input id="trip-title" value={trip.title ?? ''} placeholder={t.trip.defaultTitle(trip.durationDays)}
            onChange={(e) => setTrip({ ...trip, title: e.target.value })}
            onBlur={() => api.updateTrip(trip.id, { title: trip.title }).catch(() => {})}
            className="mt-2 w-full max-w-4xl border-0 border-b-2 border-transparent bg-transparent p-0 text-3xl font-extrabold text-tinta placeholder:text-tinta focus:border-primary focus:outline-none focus:ring-0 sm:text-4xl" />
          <p className="mt-3 flex min-w-0 flex-wrap items-start gap-x-2 text-sm text-abu">
            <MapPin size={15} className="mt-0.5 shrink-0 text-accent" /> <span className="shrink-0">{t.trip.from}</span> <span className="min-w-0 break-words font-semibold text-tinta">{trip.start.label}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={regenerateAll} disabled={busy !== null}>
            <RefreshCw size={16} className={busy === 'all' ? 'animate-spin' : ''} />{busy === 'all' ? t.trip.regenerating : t.trip.regenerateAll}
          </button>
          {trip.saved && <button className="btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={16} />{t.trip.delete}</button>}
          <button className="btn-cta" onClick={save} disabled={busy !== null}>
            {busy === 'save' ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Save size={16} />}
            {busy === 'save' ? t.trip.saving : t.trip.save}
          </button>
        </div>
      </div>

      {!IS_DEMO && trip.source === 'rules' && (
        <p className="mt-6 flex items-start gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700"><Info size={18} className="mt-0.5 shrink-0" />{t.trip.fallback}</p>
      )}

      {/* Tab hari */}
      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist">
        <button type="button" role="tab" aria-selected={activeDay === 'all'} className={tabCls(activeDay === 'all')} onClick={() => setActiveDay('all')}>{t.trip.allDays}</button>
        {trip.days.map((d, i) => (
          <button key={i} type="button" role="tab" aria-selected={activeDay === i} className={tabCls(activeDay === i)} onClick={() => { setActiveDay(i); setRouteDayIndex(i); }}>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: dayColor(i) }} aria-hidden="true" />
            {t.trip.dayLabel(d.dayNumber)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(350px,0.82fr)] xl:gap-10">
        <div className="order-2 lg:order-1">
          {visibleDays.map(({ d, i }) => (
            <DayTimeline key={i} day={d} dayIndex={i} totalDays={trip.days.length} placesById={placesById} start={originForDay(trip, placesById, i)}
              color={dayColor(i)} activeId={activeId} busy={busy === i} actions={actions} />
          ))}
        </div>
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <section className="surface-panel overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis px-4 py-4 sm:px-5">
                <div>
                  <p className="eyebrow">{t.trip.mapTitle}</p>
                  <h2 className="mt-1 flex items-center gap-2 text-lg font-bold"><Route size={17} className="text-accent" />{t.trip.routeTitle}</h2>
                </div>
                <label className="sr-only" htmlFor="route-day">{t.trip.routeDay}</label>
                <select id="route-day" className="min-h-10 max-w-full rounded-xl border border-garis bg-white px-3 py-2 text-sm font-semibold text-tinta" value={routeDay}
                  onChange={(event) => { const nextDay = Number(event.target.value); setRouteDayIndex(nextDay); if (activeDay !== 'all') setActiveDay(nextDay); }}>
                  {trip.days.map((day, index) => <option key={index} value={index}>{t.trip.dayLabel(day.dayNumber)}</option>)}
                </select>
              </div>
              <TripMap className="h-[19rem] rounded-none border-0 sm:h-[24rem] lg:h-[min(58vh,38rem)]" points={points} start={activeDay === 'all' ? trip.start : routePlan.start}
                activeId={activeId} onSelect={setActiveId} routeGeometry={routeResult?.geometry} />
              <div className="grid min-h-[5.5rem] gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5">
                {routeLoading ? <p className="col-span-full flex items-center gap-2 text-sm font-medium text-abu" role="status"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />{t.trip.routeLoading}</p> : routeResult ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5"><Route size={17} className="shrink-0 text-primary" /><div><p className="text-[11px] font-semibold uppercase tracking-wide text-abu">{t.trip.routeDistance}</p><p className="mt-0.5 text-sm font-bold text-tinta">{new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-GB', { maximumFractionDigits: 1 }).format(routeResult.distanceKm)} km</p></div></div>
                    <div className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5"><Clock3 size={17} className="shrink-0 text-primary" /><div><p className="text-[11px] font-semibold uppercase tracking-wide text-abu">{t.trip.routeDuration}</p><p className="mt-0.5 text-sm font-bold text-tinta">{routeResult.durationMinutes < 60 ? `${routeResult.durationMinutes} min` : `${Math.floor(routeResult.durationMinutes / 60)} h ${routeResult.durationMinutes % 60} min`}</p></div></div>
                  </>
                ) : <p className="col-span-full self-center text-sm leading-6 text-abu" role={routeError ? 'status' : undefined}>{routeError}</p>}
              </div>
              <p className="border-t border-garis px-4 py-3 text-xs leading-5 text-abu sm:px-5">{t.trip.straightLine}</p>
            </section>
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
