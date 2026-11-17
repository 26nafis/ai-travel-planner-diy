import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { api } from '../services/api.js';
import DurationPicker from '../components/DurationPicker.jsx';
import StartLocationPicker from '../components/StartLocationPicker.jsx';
import PreferencePicker from '../components/PreferencePicker.jsx';

function Step({ n, title, lead, children }) {
  return (
    <section className="surface-panel grid min-w-0 gap-5 p-5 sm:p-7 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-9">
      <div className="min-w-0">
        <span className="eyebrow">{n.toString().padStart(2, '0')}</span>
        <h2 className="mt-2 text-xl font-extrabold leading-snug">{title}</h2>
        {lead && <p className="mt-2 text-sm leading-6 text-abu">{lead}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function Plan() {
  const { t, lang } = useLang();
  const nav = useNavigate();
  const prefill = useLocation().state?.prefill;
  const initialDays = Math.min(21, Math.max(1, Number(prefill?.durationDays) || 2));
  const [duration, setDuration] = useState({ value: initialDays, flexible: initialDays >= 8 });
  const [start, setStart] = useState(null);
  const [prefs, setPrefs] = useState({
    categories: Array.isArray(prefill?.categories) ? prefill.categories : [],
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Isi form dari tombol "Susun itinerary ini" di widget chat.
  useEffect(() => {
    if (!prefill) return;
    const days = Math.min(21, Math.max(1, Number(prefill.durationDays) || 2));
    setDuration({ value: days, flexible: days >= 8 });
    setPrefs({
      categories: Array.isArray(prefill.categories) ? prefill.categories : [],
    });
  }, [prefill]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!start) { setError(t.plan.errStart); document.getElementById('step-start')?.scrollIntoView({ behavior: 'smooth' }); return; }
    setError(null); setBusy(true);
    try {
      const trip = await api.generateTrip({
        durationDays: duration.value,
        start: { type: start.type, label: start.label, lat: start.lat, lng: start.lng },
        preferences: prefs,
        language: lang,
      });
      nav(`/perjalanan/${trip.id}`);
    } catch (err) {
      setBusy(false);
      setError(err.message || t.errors.generic);
    }
  };

  return (
    <form onSubmit={submit} aria-busy={busy} className="mx-auto max-w-6xl px-4 pb-16 pt-9 sm:px-6 sm:pt-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow flex items-center gap-2"><Compass size={15} /> {lang === 'id' ? 'Rencana perjalanan' : 'Trip planning'}</p>
        <h1 className="mt-3 text-4xl font-extrabold text-tinta sm:text-5xl">{t.plan.title}</h1>
        <p className="mt-3 max-w-prose text-base leading-7 text-abu sm:text-lg">{t.plan.lead}</p>
      </div>

      <div className="grid gap-4">
        <Step n={1} title={t.plan.durationTitle}>
          <DurationPicker value={duration.value} flexible={duration.flexible} onChange={setDuration} />
        </Step>
        <div id="step-start">
          <Step n={2} title={t.plan.startTitle} lead={t.plan.startLead}>
          <StartLocationPicker value={start} onChange={(v) => { setStart(v); setError(null); }} />
          </Step>
        </div>
        <Step n={3} title={t.plan.prefsTitle} lead={t.plan.prefsLead}>
          <PreferencePicker value={prefs} onChange={setPrefs} />
        </Step>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-garis bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-6 sm:shadow-float"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {busy ? (
              <p className="flex items-start gap-2 text-sm text-abu" role="status" aria-live="polite">
                <span aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                <span><span className="block font-semibold text-tinta">{t.plan.generating}</span><span className="block leading-5">{t.plan.generatingHint}</span></span>
              </p>
            ) : error ? (
              <p className="text-sm text-red-700" role="alert">{error}</p>
            ) : (
              <p className="break-words text-sm text-abu">{start ? <><span>{t.plan.selected}: </span><span className="font-medium text-tinta">{start.label}</span></> : t.plan.errStart}</p>
            )}
          </div>
          <button type="submit" className="btn-cta w-full px-8 py-3.5 text-base sm:w-auto" disabled={busy}>
            {busy && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {busy ? t.plan.generating : t.plan.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
