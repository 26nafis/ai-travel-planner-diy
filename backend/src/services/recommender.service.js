/**
 * Logika rekomendasi (rancangan bagian 5). Sama dengan versi demo di frontend,
 * dipindahkan ke sini agar menjadi sumber kebenaran di produksi.
 */
import { haversineKm } from './geo.js';

export const PLACES_PER_DAY = (days) => (days <= 2 ? 4 : 3);

function scorePlace(place, { durationDays, preferences, start }, rand) {
  const cats = preferences.categories || [];
  let score = 0;
  const reasons = [];

  const wantPopular = durationDays <= 2;
  if (wantPopular && place.popularity === 'popular') { score += 5; reasons.push('popular'); }
  if (!wantPopular && place.popularity === 'hidden') { score += 5; reasons.push('hidden'); }

  const matched = place.categories.filter((c) => cats.includes(c));
  score += matched.length * 2;
  matched.forEach((c) => reasons.push(`cat:${c}`));

  if (preferences.family && place.family) { score += 1; reasons.push('family'); }
  if (preferences.accessible && place.accessible) { score += 1; reasons.push('accessible'); }

  const km = start ? haversineKm(start, place) : 0;
  score -= km / 12; // makin jauh dari titik awal, makin kecil skornya
  if (km < 8) reasons.push('near');

  score += rand() * 0.8; // variasi kecil untuk regenerate
  return { ...place, score, km, reasons };
}

function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function rankCandidates(destinations, input, seed = Date.now()) {
  const rand = seeded(seed);
  const { preferences } = input;
  let pool = destinations;
  if (preferences.accessible) pool = pool.filter((d) => d.accessible);
  if (preferences.family) pool = pool.filter((d) => d.family);
  const cats = preferences.categories || [];
  if (cats.length) {
    const filtered = pool.filter((d) => d.categories.some((c) => cats.includes(c)));
    if (filtered.length >= input.durationDays * 2) pool = filtered; // longgarkan bila terlalu sedikit
  }
  return pool.map((p) => scorePlace(p, input, rand)).sort((a, b) => b.score - a.score);
}

/** Bagi kandidat ke hari-hari dengan rantai tetangga terdekat agar tiap hari tidak berpencar. */
export function buildDays(candidates, durationDays, start, exclude = new Set()) {
  const need = durationDays * PLACES_PER_DAY(durationDays);
  const fresh = candidates.filter((c) => !exclude.has(c.id));
  const picked = [...fresh, ...candidates.filter((c) => exclude.has(c.id))].slice(0, need);

  const ordered = [];
  const remaining = [...picked];
  let cursor = start || remaining[0];
  while (remaining.length) {
    let bestIdx = 0;
    let bestKm = Infinity;
    remaining.forEach((p, i) => {
      const km = haversineKm(cursor, p);
      if (km < bestKm) { bestKm = km; bestIdx = i; }
    });
    const [next] = remaining.splice(bestIdx, 1);
    ordered.push(next);
    cursor = next;
  }

  const perDay = Math.max(1, Math.ceil(ordered.length / durationDays));
  return Array.from({ length: durationDays }, (_, i) => ({
    dayNumber: i + 1,
    items: ordered.slice(i * perDay, (i + 1) * perDay).map((p) => ({
      destinationId: p.id,
      reasons: p.reasons,
      km: Math.round(p.km * 10) / 10,
    })),
  }));
}
