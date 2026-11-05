import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, SlidersHorizontal, Sparkles, Compass } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { StopMarker } from '../components/Kawung.jsx';
import { DESTINATIONS } from '../data/destinations.js';

const SAMPLE = ['keraton', 'tamansari', 'gudeg-yudjum', 'malioboro'];
const STEP_ICONS = [SlidersHorizontal, CalendarDays, MapPin];

export default function Landing() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const sample = SAMPLE.map((id) => DESTINATIONS.find((d) => d.id === id));

  return (
    <>
      {/* Hero: pita biru penuh dengan kartu putih mengambang, pola khas situs travel */}
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 pt-12 sm:px-6 md:grid-cols-[1.05fr_1fr] md:items-center md:pt-16">
          <div>
            <h1 className="text-[2.4rem] font-extrabold leading-[1.08] sm:text-[3.4rem]">{t.landing.title}</h1>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-primary-50">{t.landing.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/rencanakan" className="btn-cta px-7 py-3.5 text-base">{t.landing.cta}</Link>
              {user && <Link to="/perjalanan" className="btn border border-white/60 px-6 py-3.5 text-base text-white hover:bg-white/10">{t.landing.ctaSecondary}</Link>}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 text-tinta shadow-float sm:p-7">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary-700">
              <Sparkles size={16} className="text-accent" /> {t.landing.sampleDay}
            </p>
            <ol className="mt-5">
              {sample.map((p, i) => (
                <li key={p.id} className="grid grid-cols-[2.25rem_1fr] gap-x-3">
                  <div className="relative flex items-start justify-center">
                    {i < sample.length - 1 && <span className="absolute bottom-0 top-9 w-0.5 bg-primary-100" aria-hidden="true" />}
                    <StopMarker size={28} className="mt-0.5">{i + 1}</StopMarker>
                  </div>
                  <div className="pb-5">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-sm leading-relaxed text-abu">{p.desc[lang]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Langkah-langkah, kartu putih menumpang ke atas pita biru */}
      <section className="mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold">{t.landing.howTitle}</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {t.landing.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <li key={s.t} className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary"><Icon size={22} /></span>
                  <div>
                    <h3 className="font-bold"><span className="text-primary">{i + 1}.</span> {s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-abu">{s.d}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t.landing.ruleTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex gap-4 rounded-xl bg-white p-6 shadow-card">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-50 text-accent"><Sparkles size={20} /></span>
            <p className="leading-relaxed">{t.landing.ruleShort}</p>
          </div>
          <div className="flex gap-4 rounded-xl bg-white p-6 shadow-card">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success-50 text-success"><Compass size={20} /></span>
            <p className="leading-relaxed">{t.landing.ruleLong}</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-abu">{t.landing.regencies}</p>
      </section>
    </>
  );
}
