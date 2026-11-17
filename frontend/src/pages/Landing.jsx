import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Compass, MapPin, Sparkles } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { StopMarker } from '../components/Kawung.jsx';
import TripMap from '../components/TripMap.jsx';
import { DESTINATIONS } from '../data/destinations.js';
import { dayColor } from '../lib/geo.js';

const SAMPLE = ['346', '8', '315', '24'];

export default function Landing() {
  const { t, lang } = useLang();
  const sample = SAMPLE.map((id) => DESTINATIONS.find((d) => d.id === id)).filter(Boolean);
  const previewPoints = sample.map((place, index) => ({
    ...place, title: place.name, number: index + 1, day: 0, color: dayColor(0),
  }));

  return (
    <div className="pb-16">
      <section className="mx-auto grid max-w-7xl min-w-0 gap-9 px-4 pb-14 pt-10 sm:px-6 md:gap-12 md:pb-20 md:pt-16 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-8">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-2"><Compass size={15} /> {lang === 'id' ? 'Panduan perjalanan DIY' : 'Yogyakarta trip planner'}</p>
          <h1 className="mt-5 max-w-[12ch] text-[clamp(2.55rem,6vw,5rem)] font-extrabold leading-[1.02] text-tinta">{t.landing.title}</h1>
          <p className="mt-6 max-w-[56ch] text-base leading-7 text-abu sm:text-lg sm:leading-8">{t.landing.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/rencanakan" className="btn-cta px-6 py-3.5">{t.landing.cta}<ArrowRight size={17} /></Link>
            <Link to="/perjalanan" className="btn-ghost px-5 py-3.5">{t.landing.ctaSecondary}</Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-abu">
            <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-primary" /> {lang === 'id' ? 'Destinasi dari dataset DIY' : 'Places from the DIY dataset'}</span>
            <span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-primary" /> {lang === 'id' ? 'Rencana per hari' : 'Day-by-day plans'}</span>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-garis bg-paper shadow-float">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="eyebrow">{t.landing.sampleDay}</p>
              <p className="mt-1 truncate text-sm font-semibold text-tinta">{lang === 'id' ? 'Contoh susunan destinasi' : 'An example day plan'}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800"><Sparkles size={14} /> DIY</span>
          </div>
          <TripMap className="h-[18rem] rounded-none border-0 sm:h-[22rem]" points={previewPoints} />
          <ol className="grid gap-0 divide-y divide-garis px-4 sm:grid-cols-2 sm:divide-y-0 sm:px-6">
            {sample.map((place, index) => (
              <li key={place.id} className={`flex min-w-0 items-start gap-3 py-3 ${index > 1 ? 'sm:border-t sm:border-garis' : ''} ${index % 2 === 1 ? 'sm:pl-4' : 'sm:pr-4'}`}>
                <StopMarker size={27} color={dayColor(0)} className="mt-0.5 shrink-0">{index + 1}</StopMarker>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-tinta">{place.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-abu">{place.desc?.[lang] || place.desc?.id}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-garis bg-paper py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-8">
          <div>
            <p className="eyebrow">{t.landing.howTitle}</p>
            <h2 className="mt-3 max-w-[14ch] text-3xl font-extrabold leading-tight text-tinta sm:text-4xl">{lang === 'id' ? 'Dari titik awal ke rencana harian.' : 'From your starting point to a day plan.'}</h2>
          </div>
          <ol className="grid gap-0 divide-y divide-garis">
            {t.landing.steps.map((step, index) => (
              <li key={step.t} className="grid min-w-0 gap-2 py-5 sm:grid-cols-[3rem_1fr] sm:gap-5">
                <span className="text-sm font-bold tabular-nums text-primary">0{index + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-tinta">{step.t}</h3>
                  <p className="mt-1 max-w-prose text-sm leading-6 text-abu">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">{lang === 'id' ? 'Logika rekomendasi' : 'Recommendation logic'}</p>
          <h2 className="mt-3 text-3xl font-extrabold text-tinta sm:text-4xl">{t.landing.ruleTitle}</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="surface-panel flex min-w-0 gap-4 p-5 sm:p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent"><Sparkles size={20} /></span>
            <div className="min-w-0"><p className="eyebrow text-accent">{lang === 'id' ? 'Kunjungan singkat' : 'Short visit'}</p><p className="mt-2 leading-7 text-tinta">{t.landing.ruleShort}</p></div>
          </article>
          <article className="surface-panel flex min-w-0 gap-4 p-5 sm:p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary"><Compass size={20} /></span>
            <div className="min-w-0"><p className="eyebrow">{lang === 'id' ? 'Kunjungan lebih lama' : 'Longer visit'}</p><p className="mt-2 leading-7 text-tinta">{t.landing.ruleLong}</p></div>
          </article>
        </div>
        <p className="mt-6 max-w-prose text-sm leading-6 text-abu">{t.landing.regencies}</p>
      </section>
    </div>
  );
}
