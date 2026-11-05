import { useLang } from '../i18n/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-garis" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-abu sm:flex-row sm:justify-between sm:px-6">
        <span className="font-semibold text-tinta">{t.appName}</span>
        <span>{t.footer}</span>
      </div>
    </footer>
  );
}
