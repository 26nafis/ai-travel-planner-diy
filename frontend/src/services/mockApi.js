/**
 * API tiruan untuk mode demo. Menyimpan akun & perjalanan di localStorage browser.
 * JANGAN dipakai di produksi: kata sandi disimpan apa adanya di browser.
 * Bentuk respons sengaja disamakan dengan kontrak backend di README.
 */
import { DESTINATIONS } from '../data/destinations.js';
import { rankCandidates, buildDays } from './recommender.js';
import { demoChatReply } from './chat.js';

const KEY_USERS = 'lampah:users';
const KEY_SESSION = 'lampah:session';
const KEY_TRIPS = 'lampah:trips';
const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms));

function read(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* penyimpanan penuh/diblokir */ }
}
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function fail(code, message) { const e = new Error(message); e.code = code; throw e; }
function currentUser() {
  const s = read(KEY_SESSION, null);
  if (!s) fail('UNAUTHORIZED', 'Sesi berakhir. Silakan masuk lagi.');
  return s.user;
}
function ownTrips() {
  const user = currentUser();
  return read(KEY_TRIPS, []).filter((t) => t.userId === user.id);
}
function saveTripRecord(trip) {
  const all = read(KEY_TRIPS, []);
  const i = all.findIndex((t) => t.id === trip.id);
  if (i >= 0) all[i] = trip; else all.unshift(trip);
  write(KEY_TRIPS, all);
  return trip;
}

export const mockApi = {
  async register({ name, email, password }) {
    await wait();
    const users = read(KEY_USERS, []);
    if (users.some((u) => u.email === email.toLowerCase())) fail('EMAIL_TAKEN', 'Email sudah terdaftar.');
    const user = { id: uid(), name, email: email.toLowerCase(), language: 'id' };
    users.push({ ...user, password });
    write(KEY_USERS, users);
    write(KEY_SESSION, { token: 'demo-' + user.id, user });
    return { token: 'demo-' + user.id, user };
  },
  async login({ email, password }) {
    await wait();
    const found = read(KEY_USERS, []).find((u) => u.email === email.toLowerCase() && u.password === password);
    if (!found) fail('INVALID_CREDENTIALS', 'Email atau kata sandi salah.');
    const { password: _pw, ...user } = found;
    write(KEY_SESSION, { token: 'demo-' + user.id, user });
    return { token: 'demo-' + user.id, user };
  },
  async me() {
    const s = read(KEY_SESSION, null);
    return s ? s.user : null;
  },
  async logout() { localStorage.removeItem(KEY_SESSION); },
  async updateProfile(patch) {
    const s = read(KEY_SESSION, null);
    if (!s) return null;
    const user = { ...s.user, ...patch };
    write(KEY_SESSION, { ...s, user });
    write(KEY_USERS, read(KEY_USERS, []).map((u) => (u.id === user.id ? { ...u, ...patch } : u)));
    return user;
  },

  async listDestinations() { await wait(150); return DESTINATIONS; },

  async chat({ messages, language }) {
    await wait(700);
    return demoChatReply({ messages, language });
  },

  async generateTrip(input) {
    currentUser();
    await wait(1100);
    const ranked = rankCandidates(DESTINATIONS, input);
    const days = buildDays(ranked, input.durationDays, input.start);
    const trip = {
      id: uid(), userId: currentUser().id, saved: false, source: 'rules',
      title: null, ...input, days, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    return saveTripRecord(trip);
  },

  async regenerate(id, { dayIndex } = {}) {
    await wait(900);
    const trip = ownTrips().find((t) => t.id === id) || fail('NOT_FOUND', 'Perjalanan tidak ditemukan.');
    const used = new Set(trip.days.flatMap((d) => d.items.map((i) => i.destinationId)));
    const ranked = rankCandidates(DESTINATIONS, trip, Date.now());
    let days;
    if (dayIndex == null) {
      days = buildDays(ranked, trip.durationDays, trip.start, used);
    } else {
      const others = new Set(trip.days.filter((_, i) => i !== dayIndex).flatMap((d) => d.items.map((x) => x.destinationId)));
      const current = new Set(trip.days[dayIndex].items.map((x) => x.destinationId));
      const pool = ranked.filter((r) => !others.has(r.id));
      const one = buildDays(pool, 1, trip.start, current)[0];
      const count = Math.max(trip.days[dayIndex].items.length, 2);
      days = trip.days.map((d, i) => (i === dayIndex ? { ...d, items: one.items.slice(0, count) } : d));
    }
    return saveTripRecord({ ...trip, days, updatedAt: new Date().toISOString() });
  },

  async saveTrip(id, patch = {}) {
    await wait(350);
    const trip = ownTrips().find((t) => t.id === id) || fail('NOT_FOUND', 'Perjalanan tidak ditemukan.');
    return saveTripRecord({ ...trip, ...patch, saved: true, updatedAt: new Date().toISOString() });
  },
  async updateTrip(id, patch) {
    const trip = ownTrips().find((t) => t.id === id) || fail('NOT_FOUND', 'Perjalanan tidak ditemukan.');
    return saveTripRecord({ ...trip, ...patch, updatedAt: new Date().toISOString() });
  },
  async listTrips() { await wait(300); return ownTrips().filter((t) => t.saved); },
  async getTrip(id) {
    await wait(200);
    return ownTrips().find((t) => t.id === id) || fail('NOT_FOUND', 'Perjalanan tidak ditemukan.');
  },
  async deleteTrip(id) {
    await wait(250);
    const user = currentUser();
    write(KEY_TRIPS, read(KEY_TRIPS, []).filter((t) => !(t.id === id && t.userId === user.id)));
  },
};
