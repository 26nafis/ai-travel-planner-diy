import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage({ mode }) {
  const { t, lang } = useLang();
  const { login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (isRegister && !form.name.trim()) errs.name = t.auth.errName;
    if (!EMAIL_RE.test(form.email)) errs.email = t.auth.errEmail;
    if (form.password.length < 8) errs.password = t.auth.errPassword;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setServerError(null);
    try {
      if (isRegister) await register({ ...form, language: lang });
      else await login({ email: form.email, password: form.password });
      nav(loc.state?.from || '/rencanakan', { replace: true });
    } catch (err) {
      setServerError(err.message || t.errors.generic);
    } finally { setBusy(false); }
  };

  const field = (k, type, autoComplete, hint) => (
    <div>
      <label htmlFor={k} className="label">{t.auth[k]}</label>
      <input id={k} type={type} className={`field ${errors[k] ? 'border-red-400' : ''}`} value={form[k]} onChange={set(k)}
        autoComplete={autoComplete} aria-invalid={!!errors[k]} aria-describedby={`${k}-msg`} />
      <p id={`${k}-msg`} className={`mt-1.5 text-sm ${errors[k] ? 'text-red-700' : 'text-abu'}`}>{errors[k] || hint}</p>
    </div>
  );

  return (
    <div className="mx-auto my-10 max-w-md rounded-xl bg-white px-6 py-10 shadow-card sm:my-16 sm:px-8">
      <h1 className="text-3xl font-extrabold text-tinta">{isRegister ? t.auth.registerTitle : t.auth.loginTitle}</h1>
      {isRegister && <p className="mt-2 text-abu">{t.auth.registerLead}</p>}

      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        {isRegister && field('name', 'text', 'name')}
        {field('email', 'email', 'email')}
        {field('password', 'password', isRegister ? 'new-password' : 'current-password', isRegister ? t.auth.passwordHint : '')}
        {serverError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
        <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={busy}>
          {busy ? (isRegister ? t.auth.registering : t.auth.loggingIn) : (isRegister ? t.auth.register : t.auth.login)}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-abu">
        {isRegister ? t.auth.hasAccount : t.auth.noAccount}{' '}
        <Link to={isRegister ? '/masuk' : '/daftar'} state={loc.state} className="font-semibold text-primary underline-offset-4 hover:underline">
          {isRegister ? t.auth.login : t.auth.register}
        </Link>
      </p>
    </div>
  );
}
