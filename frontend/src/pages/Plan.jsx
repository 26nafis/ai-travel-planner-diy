import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext.jsx';
import { api } from '../services/api.js';
import DurationPicker from '../components/DurationPicker.jsx';
import StartLocationPicker from '../components/StartLocationPicker.jsx';
import PreferencePicker from '../components/PreferencePicker.jsx';
import { KawungMark } from '../components/Kawung.jsx';

function Step({ n, title, lead, children }) {
  return (
    <section className="grid gap-4 border-t border-garis py-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-base font-extrabold text-white">{n}</span>
        <h2 className="mt-3 text-xl font-extrabold leading-snug">{title}</h2>
        {lead && <p className="mt-2 text-sm text-abu">{lead}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function GeneratingOverlay() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => Math.min(x + 1, t.plan.generatingSteps.length - 1)), 700);
    return () => clearInterval(id);
  }, [t]);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-surface/95 px-6" role="status" aria-live="polite">
      <div className="max-w-sm text-center">
        <KawungMark size={56} color="#0194F3" className="mx-auto animate-[spin_3s_linear_infinite]" />
        <p className="mt-6 text-xl font-extrabold">{t.plan.generating}</p>
        <ol className="mt-4 space-y-1 text-sm">
          {t.plan.generatingSteps.map((s, idx) => (
            <li key={s} className={idx <= i ? 'text-tinta' : 'text-abu/50'}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
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
    <form onSubmit={submit} className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      {busy && <GeneratingOverlay />}
      <h1 className="text-4xl font-extrabold text-tinta sm:text-5xl">{t.plan.title}</h1>
      <p className="mb-8 mt-3 text-lg text-abu">{t.plan.lead}</p>

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

      <div className="sticky bottom-0 -mx-4 mt-8 border-t border-garis bg-surface/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:bg-white sm:px-6 sm:shadow-float"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${error ? 'text-red-700' : 'text-abu'}`} role={error ? 'alert' : undefined}>
            {error || (start ? `${t.plan.selected}: ${start.label}` : t.plan.errStart)}
          </p>
          <button type="submit" className="btn-cta px-8 py-3.5 text-base" disabled={busy}>{t.plan.submit}</button>
        </div>
      </div>
    </form>
  );
}
