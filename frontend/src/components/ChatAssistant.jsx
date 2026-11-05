import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Sparkles, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { api } from '../services/api.js';

let seq = 0;
const nextId = () => `m${++seq}`;

function Bubble({ message, onPlan }) {
  const { t } = useLang();
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-primary text-white'
            : `rounded-bl-md bg-white shadow-card ${message.error ? 'text-red-700' : 'text-tinta'}`
        }`}>
        <p className="whitespace-pre-line">{message.content}</p>
        {message.source && !message.error && <p className="mt-2 border-t border-garis pt-1.5 text-[10px] font-semibold text-abu">{message.source === 'llm' ? t.chat.sourceLlm : t.chat.sourceRules}</p>}
        {message.notice && <p className="mt-1 text-[10px] text-accent-700">{t.chat.notices[message.notice] || t.chat.notices.default}</p>}
        {message.meta && (
          <button
            type="button"
            onClick={() => onPlan(message.meta)}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100">
            {t.chat.planCta} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChatAssistant() {
  const { t, lang } = useLang();
  const nav = useNavigate();
  const onPlan = useLocation().pathname === '/rencanakan';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  const send = async (raw) => {
    const content = (typeof raw === 'string' ? raw : input).trim();
    if (!content || busy) return;
    const outgoing = [...messages, { id: nextId(), role: 'user', content }];
    setMessages(outgoing);
    setInput('');
    setBusy(true);
    try {
      const res = await api.chat({
        messages: outgoing.map(({ role, content: c }) => ({ role, content: c })),
        language: lang,
      });
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: res.reply, meta: res.meta, source: res.source, notice: res.notice }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: err.message || t.errors.generic, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => { e.preventDefault(); send(); };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const goPlan = (meta) => {
    setOpen(false);
    nav('/rencanakan', { state: { prefill: meta } });
  };

  // Di halaman Rencanakan ada bilah tombol "Susun itinerary" yang menempel di bawah,
  // jadi widget dinaikkan agar tidak menutupinya.
  const panelPos = onPlan
    ? 'bottom-56 max-h-[calc(100dvh-16rem)] sm:bottom-44 sm:max-h-[calc(100dvh-13rem)]'
    : 'bottom-20 max-h-[calc(100dvh-8rem)] sm:bottom-24';
  const fabPos = onPlan ? 'bottom-40 sm:bottom-28' : 'bottom-4 sm:bottom-6';

  return (
    <>
      {open && (
        <div
          id="chat-assistant-panel"
          role="dialog"
          aria-label={t.chat.title}
          className={`fixed right-4 z-40 flex h-[min(70vh,30rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-garis bg-white shadow-float sm:right-6 ${panelPos}`}>
          <div className="flex items-start justify-between gap-3 bg-primary px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><Sparkles size={18} /></span>
              <div>
                <p className="text-sm font-bold">{t.chat.title}</p>
                <p className="text-[11px] text-primary-50">{t.chat.subtitle}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.chat.close}
              className="rounded-full p-1.5 transition-colors hover:bg-white/15">
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-surface px-3.5 py-4">
            {messages.length === 0 && (
              <>
                <Bubble message={{ role: 'assistant', content: t.chat.greeting }} onPlan={goPlan} />
                <div className="flex flex-wrap gap-2 pt-1">
                  {t.chat.suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)}
                      className="rounded-full border border-garis bg-white px-3 py-1.5 text-xs font-semibold text-abu transition-colors hover:border-primary hover:text-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m) => <Bubble key={m.id} message={m} onPlan={goPlan} />)}

            {busy && (
              <div className="flex justify-start">
                <div role="status" aria-label={t.chat.sending}
                  className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-card">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-abu/60"
                      style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-garis bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={1000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t.chat.placeholder}
                aria-label={t.chat.placeholder}
                className="field max-h-24 min-h-[2.75rem] flex-1 resize-none py-2.5 text-sm"
              />
              <button type="submit" disabled={!input.trim() || busy}
                className="btn-primary shrink-0 px-4 py-2.5" aria-label={t.chat.send}>
                <Send size={17} />
                <span>{t.chat.send}</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-abu">{t.chat.disclaimer}</p>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chat-assistant-panel"
        aria-label={open ? t.chat.close : t.chat.open}
        className={`fixed right-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold text-white shadow-float transition-colors sm:right-6 ${fabPos} ${
          open ? 'bg-tinta hover:bg-tinta/90' : 'bg-primary hover:bg-primary-700'
        }`}>
        {open ? <X size={20} /> : <Sparkles size={20} />}
        <span>{open ? t.chat.close : t.chat.open}</span>
      </button>
    </>
  );
}
