import { useLang } from '../i18n/LanguageContext.jsx';

export default function DurationPicker({ value, flexible, onChange }) {
  const { t } = useLang();
  const opts = [1, 2, 3, 4, 5, 6, 7];
  const base = 'grid h-14 place-items-center rounded-xl border text-lg font-bold transition-colors';
  return (
    <div>
      <div role="radiogroup" aria-label={t.plan.durationTitle} className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {opts.map((n) => {
          const on = !flexible && value === n;
          return (
            <button key={n} type="button" role="radio" aria-checked={on} onClick={() => onChange({ value: n, flexible: false })}
              className={`${base} ${on ? 'border-primary bg-primary text-white' : 'border-garis bg-white text-tinta hover:border-primary'}`}>
              <span>{n}<span className="sr-only"> {n === 1 ? t.plan.day : t.plan.days}</span></span>
            </button>
          );
        })}
        <button type="button" role="radio" aria-checked={flexible} onClick={() => onChange({ value: Math.max(value, 8), flexible: true })}
          className={`${base} text-base ${flexible ? 'border-primary bg-primary text-white' : 'border-garis bg-white text-tinta hover:border-primary'}`}>
          8+
        </button>
      </div>

      {flexible && (
        <div className="mt-4 flex max-w-xs items-center gap-3">
          <label htmlFor="days-flex" className="text-sm font-semibold">{t.plan.flexibleLabel}</label>
          <input id="days-flex" type="number" min={8} max={21} value={value} className="field w-24"
            onChange={(e) => onChange({ value: Math.min(21, Math.max(8, Number(e.target.value) || 8)), flexible: true })} />
        </div>
      )}

      <p className="mt-3 text-sm text-abu">{value <= 2 ? t.plan.durationHintShort : t.plan.durationHintLong}</p>
    </div>
  );
}
