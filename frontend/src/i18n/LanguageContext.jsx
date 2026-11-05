import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import id from './id.js';
import en from './en.js';

const DICTS = { id, en };
const LanguageContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem('lampah:lang');
    if (saved === 'id' || saved === 'en') return saved;
  } catch { /* */ }
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lampah:lang', lang); } catch { /* */ }
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
