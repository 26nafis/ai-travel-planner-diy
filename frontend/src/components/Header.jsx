import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { KawungMark } from './Kawung.jsx';

function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t.lang.label} className="flex rounded-xl border border-garis bg-paper p-1 text-xs font-bold">
      {['id', 'en'].map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`min-h-11 min-w-11 rounded-lg px-3 ${lang === l ? 'bg-primary text-white' : 'text-abu hover:text-tinta'}`}>
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
  const linkCls = ({ isActive }) => `flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-primary-50 text-primary-800' : 'text-abu hover:bg-surface hover:text-tinta'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-garis/80 bg-paper/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 font-extrabold text-tinta">
          <KawungMark size={30} color="var(--color-primary)" />
          <span className="truncate text-base sm:text-lg">{t.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl bg-surface p-1 md:flex">
          <NavLink to="/rencanakan" className={linkCls}>{t.nav.plan}</NavLink>
          <NavLink to="/perjalanan" className={linkCls}>{t.nav.trips}</NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LangSwitch />
        </div>

        <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-garis bg-white text-tinta md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t.nav.menu}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-garis bg-paper px-4 pb-5 pt-3 shadow-card md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1" onClick={() => setOpen(false)}>
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
