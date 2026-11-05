/**
 * Satu pintu untuk semua pemanggilan data.
 * - VITE_API_URL kosong  → memakai mockApi (mode demo, tanpa backend).
 * - VITE_API_URL terisi  → memanggil backend Express (kontrak endpoint ada di README).
 */
import { mockApi } from './mockApi.js';

const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
export const IS_DEMO = !BASE;

let token = null;
export const setToken = (t) => { token = t; try { t ? sessionStorage.setItem('lampah:token', t) : sessionStorage.removeItem('lampah:token'); } catch { /* */ } };
try { token = sessionStorage.getItem('lampah:token'); } catch { /* */ }

async function http(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(data?.message || `Permintaan gagal (${res.status}).`);
    e.code = data?.code || (res.status === 401 ? 'UNAUTHORIZED' : 'HTTP_' + res.status);
    throw e;
  }
  return data;
}

const realApi = {
  register: (b) => http('POST', '/api/auth/register', b),
  login: (b) => http('POST', '/api/auth/login', b),
  me: () => (token ? http('GET', '/api/auth/me').catch(() => null) : Promise.resolve(null)),
  logout: () => http('POST', '/api/auth/logout').catch(() => null),
  updateProfile: (b) => http('PATCH', '/api/profile', b),
  listDestinations: () => http('GET', '/api/destinations'),
  chat: (b) => http('POST', '/api/chat', b),
  generateTrip: (b) => http('POST', '/api/trips/generate', b),
  regenerate: (id, b) => http('POST', `/api/trips/${id}/regenerate`, b || {}),
  saveTrip: (id, b) => http('POST', `/api/trips/${id}/save`, b || {}),
  updateTrip: (id, b) => http('PUT', `/api/trips/${id}`, b),
  listTrips: () => http('GET', '/api/trips'),
  getTrip: (id) => http('GET', `/api/trips/${id}`),
  deleteTrip: (id) => http('DELETE', `/api/trips/${id}`),
};

export const api = IS_DEMO ? mockApi : realApi;
