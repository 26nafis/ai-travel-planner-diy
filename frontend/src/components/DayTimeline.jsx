import { ArrowUp, ArrowDown, Trash2, ExternalLink, Clock, RefreshCw, Plus } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { mapsLink } from '../lib/geo.js';
import { StopMarker } from './Kawung.jsx';

function reasonText(t, r) {
  if (r.startsWith('cat:')) return t.trip.reasonCat(t.cat[r.slice(4)]);
  return t.trip.reasons[r];
}

function Stop({ item, place, index, isFirst, isLast, color, active, dayIndex, totalDays, actions }) {
  const { t, lang } = useLang();
  const reasons = (item.reasons || []).map((r) => reasonText(t, r)).filter(Boolean);
  const iconBtn = 'grid h-9 w-9 place-items-center rounded-full text-abu hover:bg-primary-50 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <li className="stop-in grid grid-cols-[2.25rem_1fr] gap-x-3" style={{ animationDelay: `${index * 60}ms` }}>
      {/* kolom penanda + garis */}
      <div className="relative flex items-start justify-center">
        {!isLast && <span className="absolute bottom-0 top-10 w-0.5" style={{ background: color, opacity: 0.35 }} aria-hidden="true" />}
        <button type="button" onClick={() => actions.select(place.id)} className="relative mt-1 rounded-full" aria-label={place.name}>
          <StopMarker color={color} size={active ? 34 : 30}>{index + 1}</StopMarker>
        </button>
      </div>

      <article className={`mb-4 rounded-xl border bg-white p-4 shadow-card transition-colors sm:p-5 ${active ? 'border-primary ring-1 ring-primary' : 'border-transparent'}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-base font-bold leading-snug sm:text-lg">
              <button type="button" className="text-left hover:text-primary" onClick={() => actions.select(place.id)}>{place.name}</button>
            </h4>
            <p className="mt-0.5 text-sm text-abu">
              {place.regency}
              {item.km != null && <span>, {t.trip.km(item.km)}</span>}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${place.popularity === 'popular' ? 'bg-primary-50 text-primary-700' : 'bg-success-50 text-success-700'}`}>
            {place.popularity === 'popular' ? t.trip.popular : t.trip.hidden}
          </span>
        </div>

        <p className="mt-3 max-w-prose text-[15px] leading-relaxed">{place.desc[lang]}</p>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-abu">
          <Clock size={15} /> {place.hours ? `${t.trip.hours}: ${place.hours}` : t.trip.hoursUnknown}
        </p>

        {reasons.length > 0 && (
          <p className="mt-2 text-sm text-abu">
            <span className="font-semibold text-tinta">{t.trip.why}:</span> {reasons.join(', ')}.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-garis pt-3">
          <button className={iconBtn} disabled={isFirst} onClick={() => actions.move(index, -1)} aria-label={t.trip.moveUp} title={t.trip.moveUp}><ArrowUp size={17} /></button>
          <button className={iconBtn} disabled={isLast} onClick={() => actions.move(index, 1)} aria-label={t.trip.moveDown} title={t.trip.moveDown}><ArrowDown size={17} /></button>
          {totalDays > 1 && (
            <label className="ml-1 flex items-center gap-1.5 text-sm text-abu">
              <span className="sr-only sm:not-sr-only">{t.trip.moveToDay}</span>
              <select className="rounded-lg border border-garis bg-white px-3 py-1.5 text-sm text-tinta" value={dayIndex}
                onChange={(e) => actions.moveToDay(index, Number(e.target.value))} aria-label={t.trip.moveToDay}>
                {Array.from({ length: totalDays }, (_, i) => <option key={i} value={i}>{t.trip.dayLabel(i + 1)}</option>)}
              </select>
            </label>
          )}
          <button className={`${iconBtn} hover:!bg-red-50 hover:!text-red-700`} onClick={() => actions.remove(index)} aria-label={t.trip.remove} title={t.trip.remove}><Trash2 size={17} /></button>
          <a href={mapsLink(place)} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-50">
            {t.trip.openMaps} <ExternalLink size={15} />
          </a>
        </div>
      </article>
    </li>
  );
}

export default function DayTimeline({ day, dayIndex, totalDays, placesById, color, activeId, busy, actions }) {
  const { t } = useLang();
  return (
    <section aria-labelledby={`day-${dayIndex}`} className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 id={`day-${dayIndex}`} className="flex items-center gap-3 text-2xl font-extrabold">
          <span className="h-3 w-8 rounded-full" style={{ background: color }} aria-hidden="true" />
          {t.trip.dayLabel(day.dayNumber)}
        </h3>
        <div className="flex gap-2">
          <button className="btn-ghost py-2" onClick={() => actions.openAdd(dayIndex)}><Plus size={16} />{t.trip.addPlace}</button>
          <button className="btn-ghost py-2" onClick={() => actions.regenerateDay(dayIndex)} disabled={busy}>
            <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />{t.trip.regenerateDay}
          </button>
        </div>
      </div>

      {day.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-garis px-5 py-6 text-sm text-abu">{t.trip.emptyDay}</p>
      ) : (
        <ol>
          {day.items.map((item, i) => {
            const place = placesById[item.destinationId];
            if (!place) return null; // tempat di luar dataset tidak ditampilkan
            return (
              <Stop key={item.destinationId} item={item} place={place} index={i} color={color}
                isFirst={i === 0} isLast={i === day.items.length - 1} active={activeId === place.id}
                dayIndex={dayIndex} totalDays={totalDays}
                actions={{
                  select: actions.select,
                  move: (idx, dir) => actions.move(dayIndex, idx, dir),
                  remove: (idx) => actions.remove(dayIndex, idx),
                  moveToDay: (idx, target) => actions.moveToDay(dayIndex, idx, target),
                }} />
            );
          })}
        </ol>
      )}
    </section>
  );
}
