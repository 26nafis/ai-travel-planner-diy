import DESTINATIONS from '../frontend/src/data/destinations.generated.json';

const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MAX_BODY_BYTES = 20_000;
const PER_DAY = (days) => (days <= 2 ? 4 : 3);
const CATEGORY_TERMS = {
  nature: ['alam', 'nature', 'pemandangan', 'gunung', 'pantai', 'hutan', 'sunrise', 'view'],
  culture: ['budaya', 'culture', 'sejarah', 'history', 'museum', 'candi', 'keraton'],
  culinary: ['kuliner', 'culinary', 'makan', 'food', 'gudeg', 'kafe', 'kopi', 'coffee'],
  activity: ['aktivitas', 'activity', 'adventure', 'wahana', 'sains', 'keramik'],
};
const NUMBER_WORDS = {
  satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
};

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

function error(code, message, status) {
  return json({ code, message }, status);
}

function safeMessages(value) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const messages = value.slice(-8);
  if (messages.some((message) => !['user', 'assistant'].includes(message?.role)
    || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 1000)) return null;
  if (messages.at(-1)?.role !== 'user') return null;
  return messages.map(({ role, content }) => ({ role, content: content.trim() }));
}

function parseContext(messages, language) {
  const text = messages.filter((message) => message.role === 'user').map((message) => message.content).join(' ').toLowerCase();
  const digit = text.match(/(\d+)\s*(hari|days?)\b/);
  let durationDays = digit ? Number(digit[1]) : null;
  if (!durationDays) {
    if (/lebih dari seminggu|lebih seminggu|more than a week|over a week|one week|seminggu/.test(text)) durationDays = 8;
    else {
      const word = Object.keys(NUMBER_WORDS).find((item) => new RegExp(`\\b${item}\\s+(hari|days?)\\b`).test(text));
      if (word) durationDays = NUMBER_WORDS[word];
    }
  }
  if (durationDays != null) durationDays = Math.max(1, Math.min(21, durationDays));
  const categories = Object.entries(CATEGORY_TERMS)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([category]) => category);
  const resolvedLanguage = language === 'en' || language === 'id'
    ? language
    : (/\b(english|in english|bahasa inggris)\b/.test(text) ? 'en' : 'id');
  return { durationDays, categories, language: resolvedLanguage };
}

function rankedCandidates({ durationDays, categories }) {
  let pool = DESTINATIONS;
  if (categories.length) {
    const matching = pool.filter((place) => place.categories?.some((category) => categories.includes(category)));
    if (matching.length >= durationDays * PER_DAY(durationDays)) pool = matching;
  }
  const shortVisit = durationDays < 3;
  return pool.map((place) => ({
    ...place,
    _score: (place.recommendationScore || 0) * 10
      + (place.categories || []).filter((category) => categories.includes(category)).length * 2
      + (shortVisit && place.popularity === 'popular' ? 3 : 0),
  })).sort((a, b) => b._score - a._score)
    .map(({ _score, ...place }) => place)
    .slice(0, Math.min(120, durationDays * (shortVisit ? 8 : 6)));
}

function parseSelection(content) {
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    return typeof content.intro === 'string' && Array.isArray(content.destinationIdsByDay)
      ? content
      : null;
  }
  const text = String(content || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first < 0 || last <= first) return null;
  try {
    const value = JSON.parse(text.slice(first, last + 1));
    return typeof value.intro === 'string' && Array.isArray(value.destinationIdsByDay) ? value : null;
  } catch {
    return null;
  }
}

function validateDays(selection, candidates, durationDays) {
  const expected = PER_DAY(durationDays);
  if (selection?.destinationIdsByDay?.length !== durationDays) return null;
  const byId = new Map(candidates.map((place) => [String(place.id), place]));
  const used = new Set();
  const days = selection.destinationIdsByDay.map((ids, index) => {
    if (!Array.isArray(ids) || ids.length !== expected) return null;
    const places = ids.map((id) => String(id));
    if (places.some((id) => !byId.has(id) || used.has(id))) return null;
    places.forEach((id) => used.add(id));
    return { dayNumber: index + 1, places: places.map((id) => byId.get(id)) };
  });
  return days.some((day) => !day) ? null : days;
}

function fallbackDays(candidates, durationDays) {
  const perDay = PER_DAY(durationDays);
  const picks = candidates.slice(0, durationDays * perDay);
  return Array.from({ length: durationDays }, (_, index) => ({
    dayNumber: index + 1,
    places: picks.slice(index * perDay, (index + 1) * perDay),
  }));
}

function formatReply(days, durationDays, language, intro = '') {
  const title = language === 'en'
    ? `Here is a ${durationDays}-day draft itinerary from the Jogja dataset:`
    : `Berikut draf itinerary ${durationDays} hari dari dataset wisata Jogja:`;
  const body = days.map((day) => {
    const label = language === 'en' ? `Day ${day.dayNumber}` : `Hari ${day.dayNumber}`;
    return `${label}\n${day.places.map((place, index) => `${index + 1}. ${place.name}`).join('\n')}`;
  }).join('\n\n');
  const next = language === 'en'
    ? 'Set your starting location in Plan to refine nearby recommendations.'
    : 'Atur lokasi awal di halaman Rencanakan untuk menyesuaikan rekomendasi terdekat.';
  return [intro.trim(), title, body, next].filter(Boolean).join('\n\n');
}

async function handleChat(request, env) {
  if (request.method !== 'POST') return error('METHOD_NOT_ALLOWED', 'Gunakan POST untuk chat.', 405);
  if (env.CHAT_LIMITER) {
    const clientKey = request.headers.get('CF-Connecting-IP') || 'unknown-client';
    const { success } = await env.CHAT_LIMITER.limit({ key: clientKey });
    if (!success) return error('RATE_LIMITED', 'Terlalu banyak permintaan. Coba lagi sebentar.', 429);
  }
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).origin !== new URL(request.url).origin) {
    return error('ORIGIN_NOT_ALLOWED', 'Permintaan harus berasal dari aplikasi Lampah Jogja.', 403);
  }
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_BODY_BYTES) return error('PAYLOAD_TOO_LARGE', 'Isi permintaan terlalu besar.', 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return error('PAYLOAD_TOO_LARGE', 'Isi permintaan terlalu besar.', 413);
  let body;
  try { body = JSON.parse(raw); } catch { return error('INVALID_JSON', 'Format permintaan tidak valid.', 400); }

  const messages = safeMessages(body?.messages);
  if (!messages) return error('INVALID_MESSAGES', 'Pesan chat tidak valid. Pesan terakhir harus dari pengguna dan maksimal 1.000 karakter.', 400);
  const context = parseContext(messages, body.language);
  if (!context.durationDays) {
    return json({
      reply: context.language === 'en'
        ? 'How many days will you be in Yogyakarta? I can then prepare a day-by-day draft from the destination dataset.'
        : 'Berapa hari kamu akan berada di Yogyakarta? Setelah durasinya diketahui, saya bisa membuat draf itinerary harian dari dataset destinasi.',
      meta: null, source: 'rules',
    });
  }

  const candidates = rankedCandidates(context);
  const allowed = candidates.map(({ id, name, categories, rating, voteCount }) => ({ id, name, categories, rating, voteCount }));
  const system = [
    'You are Lampah Jogja, a tourism itinerary assistant for first-time visitors to Yogyakarta, Indonesia.',
    `Respond in ${context.language === 'en' ? 'English' : 'Indonesian'}.`,
    'Build an itinerary using only candidate destination IDs provided. Never invent places, opening hours, travel times, or prices.',
    `The trip lasts ${context.durationDays} days. Return exactly ${context.durationDays} day arrays, with ${PER_DAY(context.durationDays)} places in each day.`,
    'Do not repeat a destination. Prefer candidates in their given order, which is already ranked by the dataset and user interests.',
    'Return only valid JSON: {"intro":"one short sentence","destinationIdsByDay":[["id"]]}. Do not add Markdown or extra keys.',
  ].join(' ');
  const modelMessages = [
    { role: 'system', content: system },
    ...messages,
    { role: 'user', content: `Candidate destinations, in ranked order:\n${JSON.stringify(allowed)}\n\nCreate the itinerary now.` },
  ];

  let days;
  let intro = '';
  let source = 'llm';
  let notice = null;
  try {
    if (!env.AI) throw new Error('Workers AI binding is not configured.');
    const generated = await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, {
      messages: modelMessages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          type: 'object',
          properties: {
            intro: { type: 'string' },
            destinationIdsByDay: {
              type: 'array',
              items: { type: 'array', items: { type: 'string' } },
            },
          },
          required: ['intro', 'destinationIdsByDay'],
          additionalProperties: false,
        },
      },
      temperature: 0.2,
      max_tokens: Math.min(1800, Math.max(600, context.durationDays * 90)),
    });
    const selection = parseSelection(generated?.response || generated?.choices?.[0]?.message?.content);
    days = validateDays(selection, candidates, context.durationDays);
    if (!days) throw new Error('Model output failed itinerary validation.');
    intro = selection.intro.slice(0, 240);
  } catch (cause) {
    source = 'rules';
    notice = 'LLM_UNAVAILABLE';
    days = fallbackDays(candidates, context.durationDays);
    // Log only the failure class; never log the user's chat content.
    console.warn('Workers AI fallback:', cause?.name || 'InferenceError');
  }

  return json({
    reply: formatReply(days, context.durationDays, context.language, intro),
    meta: { durationDays: context.durationDays, categories: context.categories },
    source,
    ...(notice ? { notice } : {}),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') {
      return request.method === 'GET'
        ? json({ ok: true, aiBound: Boolean(env.AI), model: env.AI_MODEL || DEFAULT_MODEL })
        : error('METHOD_NOT_ALLOWED', 'Gunakan GET.', 405);
    }
    if (url.pathname === '/api/chat') return handleChat(request, env);
    if (url.pathname.startsWith('/api/')) return error('NOT_FOUND', 'Endpoint API tidak ditemukan.', 404);
    return env.ASSETS.fetch(request);
  },
};
