import { Trees, Landmark, UtensilsCrossed, Bike, Check } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';

const CATS = [
  { id: 'nature', icon: Trees },
  { id: 'culture', icon: Landmark },
  { id: 'culinary', icon: UtensilsCrossed },
  { id: 'activity', icon: Bike },
];

export default function PreferencePicker({ value, onChange }) {
  const { t } = useLang();
  const toggleCat = (id) => {
    const has = value.categories.includes(id);
    onChange({ ...value, categories: has ? value.categories.filter((c) => c !== id) : [...value.categories, id] });
  };
  const box = (on) => `flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors ${on ? 'border-primary bg-primary-50 text-primary' : 'border-garis bg-white text-tinta hover:border-primary'}`;

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {CATS.map(({ id, icon: Icon }) => {
          const on = value.categories.includes(id);
          return (
            <button key={id} type="button" aria-pressed={on} onClick={() => toggleCat(id)} className={box(on)}>
              <Icon size={20} className={on ? 'text-primary' : 'text-accent'} />
              <span className="flex-1">{t.cat[id]}</span>
              {on && <Check size={18} />}
            </button>
          );
        })}
      </div>

    </div>
  );
}
