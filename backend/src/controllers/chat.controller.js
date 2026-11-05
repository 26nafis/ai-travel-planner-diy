import { readFileSync } from 'node:fs';
import { selectItinerary } from '../services/llm.service.js';

// Local connection-test data. Production dataset reads can move to Supabase later.
const DESTINATIONS = JSON.parse(readFileSync(new URL('../../../frontend/src/data/destinations.generated.json', import.meta.url), 'utf8'));
const CATEGORY_TERMS = {
  nature: ['alam', 'nature', 'pantai', 'gunung', 'air terjun', 'hutan', 'nature'],
  culture: ['budaya', 'sejarah', 'culture', 'history', 'museum', 'candi', 'keraton'],
  culinary: ['kuliner', 'makan', 'food', 'gudeg', 'kopi', 'coffee', 'restaurant'],
  activity: ['aktivitas', 'activity', 'wahana', 'adventure', 'seru'],
};
const NUMBER_WORDS = {
  satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
};

function parseContext(messages, preferredLanguage) {
  const text = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' ').toLowerCase();
  const digit = text.match(/(\d+)\s*(hari|days?)\b/);
  let durationDays = digit ? Number(digit[1]) : null;
  if (!durationDays) {
    if (/lebih dari seminggu|lebih seminggu|more than a week|over a week|one week|seminggu/.test(text)) durationDays = 8;
    else {
      const word = Object.keys(NUMBER_WORDS).find((w) => new RegExp(`\\b${w}\\s+(hari|days?)\\b`).test(text));
      if (word) durationDays = NUMBER_WORDS[word];
    }
  }
  if (durationDays != null) durationDays = Math.max(1, Math.min(21, durationDays));
  const categories = Object.entries(CATEGORY_TERMS)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([category]) => category);
  const language = preferredLanguage === 'en' || preferredLanguage === 'id'
    ? preferredLanguage
    : (/\b(english|in english|bahasa inggris)\b/i.test(text) ? 'en' : 'id');
  return { durationDays, categories, language };
}

function rankPlaces({ durationDays, categories }) {
  const perDay = durationDays <= 2 ? 4 : 3;
  let pool = DESTINATIONS;
  if (categories.length) {
    const matches = pool.filter((place) => place.categories.some((category) => categories.includes(category)));
    if (matches.length >= durationDays * perDay) pool = matches;
  }
  return pool.map((place) => ({
    ...place,
    _score: (place.recommendationScore || 0) * 10
      + place.categories.filter((c) => categories.includes(c)).length * 2
      + (durationDays <= 2 && place.popularity === 'popular' ? 3 : 0),
  })).sort((a, b) => b._score - a._score).map(({ _score, ...place }) => place);
}

function completeDays(selection, candidates, durationDays) {
  const expectedPerDay = durationDays <= 2 ? 4 : 3;
  const byId = new Map(candidates.map((place) => [String(place.id), place]));
  const seen = new Set();
  if (selection?.destinationIdsByDay?.length !== durationDays) return null;
  const ids = selection.destinationIdsByDay.map((day) => {
    if (!Array.isArray(day) || day.length !== expectedPerDay) return null;
    const validated = day.map((id) => String(id));
    if (validated.some((id) => !byId.has(id) || seen.has(id))) return null;
    validated.forEach((id) => seen.add(id));
    return validated;
  });
  if (ids.some((day) => day === null)) return null;
  return ids.map((day, i) => ({ dayNumber: i + 1, places: day.map((id) => byId.get(id)) }));
}

function fallbackDays(candidates, durationDays) {
  const perDay = durationDays <= 2 ? 4 : 3;
  const picks = candidates.slice(0, durationDays * perDay);
  return Array.from({ length: durationDays }, (_, i) => ({
    dayNumber: i + 1,
    places: picks.slice(i * perDay, (i + 1) * perDay),
  }));
}

function formatReply(days, durationDays, language, intro = '') {
  const title = language === 'en'
    ? `Here is a ${durationDays}-day draft itinerary from the Jogja dataset:`
    : `Berikut draf itinerary ${durationDays} hari dari dataset wisata Jogja:`;
  const body = days.map((day) => {
    const label = language === 'en' ? `Day ${day.dayNumber}` : `Hari ${day.dayNumber}`;
    return `${label}\n${day.places.map((place, i) => `${i + 1}. ${place.name}`).join('\n')}`;
  }).join('\n\n');
  const next = language === 'en'
    ? 'Set your starting location in Plan to refine nearby recommendations.'
    : 'Atur lokasi awal di halaman Rencanakan untuk menyesuaikan rekomendasi terdekat.';
  return [intro.trim(), title, body, next].filter(Boolean).join('\n\n');
}

function safeMessages(body) {
  if (!Array.isArray(body) || body.length === 0) return null;
  const messages = body.slice(-10);
  if (messages.some((message) => !['user', 'assistant'].includes(message?.role)
    || typeof message.content !== 'string' || message.content.trim().length === 0 || message.content.length > 1000)) return null;
  if (messages.at(-1)?.role !== 'user') return null;
  return messages.map(({ role, content }) => ({ role, content: content.trim() }));
}

export async function send(req, res) {
  const messages = safeMessages(req.body?.messages);
  if (!messages) return res.status(400).json({ code: 'INVALID_MESSAGES', message: 'Isi chat tidak valid. Pesan terakhir harus dari pengguna dan maksimal 1.000 karakter.' });
  const context = parseContext(messages, req.body?.language);
  if (!context.durationDays) {
    return res.json({
      reply: context.language === 'en' ? 'How many days will you be in Yogyakarta? I can then prepare a day-by-day draft from the destination dataset.' : 'Berapa hari kamu akan berada di Yogyakarta? Setelah durasinya diketahui, saya bisa membuat draf itinerary harian dari dataset destinasi.',
      meta: null, source: 'rules',
    });
  }

  const candidates = rankPlaces(context).slice(0, Math.min(180, context.durationDays * (context.durationDays <= 2 ? 8 : 6)));
  let source = 'llm';
  let notice = null;
  let days;
  let intro = '';
  try {
    const selection = await selectItinerary(candidates, context.durationDays, context.language);
    days = completeDays(selection, candidates, context.durationDays);
    if (!days) throw Object.assign(new Error('Pilihan destinasi dari LLM tidak lolos validasi.'), { code: 'LLM_INVALID_SELECTION' });
    intro = selection.intro;
  } catch (error) {
    source = 'rules';
    days = fallbackDays(candidates, context.durationDays);
    notice = error.code || 'LLM_UNAVAILABLE';
    console.warn('Chat itinerary fallback:', error.code || error.message);
  }

  return res.json({
    reply: formatReply(days, context.durationDays, context.language, intro),
    meta: { durationDays: context.durationDays, categories: context.categories },
    source,
    ...(notice ? { notice } : {}),
  });
}
