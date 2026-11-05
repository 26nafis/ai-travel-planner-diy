/**
 * Balasan AI tiruan untuk mode demo (tanpa backend LLM).
 * Tujuannya hanya mendemokan alur chat → saran destinasi → form yang sudah terisi.
 * Saat VITE_API_URL diisi, api.chat memakai endpoint POST /api/chat yang sebenarnya.
 */
import { DESTINATIONS } from '../data/destinations.js';

const CATEGORY_HINTS = {
  nature: ['alam', 'nature', 'pemandangan', 'gunung', 'pantai', 'hutan', 'sunrise', 'view'],
  culture: ['budaya', 'culture', 'sejarah', 'history', 'museum', 'candi', 'keraton', 'tradisional'],
  culinary: ['kuliner', 'culinary', 'makan', 'food', 'jajan', 'gudeg', 'kafe', 'kopi', 'coffee'],
  activity: ['aktivitas', 'activity', 'seru', 'adventure', 'wahana', 'sains', 'keramik'],
};

const CATEGORY_NAMES = {
  id: { nature: 'alam', culture: 'budaya', culinary: 'kuliner', activity: 'aktivitas' },
  en: { nature: 'nature', culture: 'culture', culinary: 'food', activity: 'activities' },
};

const NUMBER_WORDS = {
  satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function detectDays(text) {
  const digits = text.match(/(\d+)\s*(hari|day|days)\b/);
  if (digits) return Math.min(21, Math.max(1, Number(digits[1])));
  if (!/(hari|day|days)\b/.test(text)) return null;
  for (const [word, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(text)) return n;
  }
  return null;
}

function detectCategories(text) {
  return Object.entries(CATEGORY_HINTS)
    .filter(([, words]) => words.some((w) => text.includes(w)))
    .map(([id]) => id);
}

function joinList(items, lang) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${lang === 'id' ? 'dan' : 'and'} ${items.at(-1)}`;
}

export function demoChatReply({ messages = [], language = 'id' }) {
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const text = last.toLowerCase();
  const lang = language === 'en' ? 'en' : 'id';

  const days = detectDays(text);
  const categories = detectCategories(text);
  const hiddenOnly = /\b(jarang|hidden|off the beaten|sepi|anti mainstream|lesser)\b/.test(text);

  const hasSignal = days != null || categories.length > 0 || hiddenOnly;
  if (!hasSignal) {
    return {
      reply: lang === 'id'
        ? 'Halo! Saya asisten Lampah Jogja. Ceritakan rencanamu, misalnya "3 hari di Jogja, suka alam dan kuliner". Nanti aku bantu susun kerangkanya.'
        : 'Hi! I’m the Lampah Jogja assistant. Tell me your plan, e.g. "3 days in Jogja, into nature and food". I’ll help sketch the itinerary.',
      meta: null,
    };
  }

  let pool = categories.length
    ? DESTINATIONS.filter((d) => d.categories.some((c) => categories.includes(c)))
    : [...DESTINATIONS];
  if (hiddenOnly) pool = pool.filter((d) => d.popularity === 'hidden');

  // Jangan biarkan filter terlalu sempit: kalau kosong, kembali ke semua destinasi.
  if (pool.length === 0) pool = [...DESTINATIONS];

  // Kunjungan pendek memberi bobot pada tempat populer; durasi lebih panjang
  // mengurutkan berdasarkan skor dari rating dan jumlah ulasan dataset.
  const shortStay = days != null && days < 3;
  pool.sort((a, b) => {
    const scoreA = (a.recommendationScore || 0) + (shortStay && a.popularity === 'popular' ? 0.3 : 0);
    const scoreB = (b.recommendationScore || 0) + (shortStay && b.popularity === 'popular' ? 0.3 : 0);
    return scoreB - scoreA || a.name.localeCompare(b.name);
  });

  const picks = pool.slice(0, 3);
  if (picks.length === 0) {
    return {
      reply: lang === 'id'
        ? 'Belum ada destinasi yang cocok dengan permintaan itu. Coba sebutkan minat lain, atau buka halaman Rencanakan untuk memilih langsung.'
        : 'No places matched that request yet. Try another interest, or open the Plan page to choose directly.',
      meta: null,
    };
  }

  const catNames = categories.map((c) => CATEGORY_NAMES[lang][c]);
  const intro = lang === 'id'
    ? `Ini kerangka${days ? ` ${days} hari` : ''}${catNames.length ? ` dengan minat ${joinList(catNames, lang)}` : ''}:`
    : `Here’s a${days ? ` ${days}-day` : ''} sketch${catNames.length ? ` focused on ${joinList(catNames, lang)}` : ''}:`;
  const bullets = picks.map((p) => `• ${p.name} (${p.regency}) — ${p.desc?.[lang] || p.desc?.id || ''}`).join('\n');
  const outro = lang === 'id'
    ? 'Klik "Susun itinerary ini" untuk membuka form yang sudah terisi, lalu tentukan titik awalmu.'
    : 'Tap "Plan this itinerary" to open a pre-filled form, then set your starting point.';

  return {
    reply: `${intro}\n${bullets}\n\n${outro}`,
    meta: { durationDays: days, categories },
  };
}
