import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { IS_DEMO } from '../services/api.js';
import { KawungMark } from './Kawung.jsx';

function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t.lang.label} className="flex rounded-full border border-garis bg-white p-0.5 text-xs font-semibold">
      {['id', 'en'].map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`rounded-full px-3 py-1.5 ${lang === l ? 'bg-primary text-white' : 'text-abu hover:text-tinta'}`}>
          {l === 'id' ? 'ID' : 'EN'}
          <span className="sr-only"> {t.lang[l]}</span>
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const linkCls = ({ isActive }) => `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'text-primary' : 'text-abu hover:text-tinta'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-garis bg-white/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {IS_DEMO && <p className="bg-primary-50 px-4 py-1.5 text-center text-xs text-primary-800">{t.demo}</p>}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-tinta">
          <KawungMark size={26} color="#0194F3" />
          <span className="text-lg">{t.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/rencanakan" className={linkCls}>{t.nav.plan}</NavLink>
          <NavLink to="/perjalanan" className={linkCls}>{t.nav.trips}</NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LangSwitch />
        </div>

        <button className="rounded-full p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t.nav.menu}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-garis bg-surface px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1" onClick={() => setOpen(false)}>
            <NavLink to="/rencanakan" className={linkCls}>{t.nav.plan}</NavLink>
            <NavLink to="/perjalanan" className={linkCls}>{t.nav.trips}</NavLink>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <LangSwitch />
          </div>
        </div>
      )}
    </header>
  );
}
