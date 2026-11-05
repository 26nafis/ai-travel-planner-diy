import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-primary">{t.notFound.title}</h1>
      <p className="mt-3 text-abu">{t.notFound.lead}</p>
      <Link to="/" className="btn-primary mt-8">{t.notFound.home}</Link>
    </div>
  );
}
