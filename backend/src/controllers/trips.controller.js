/**
 * Semua endpoint di sini memakai req.db (klien Supabase dengan token pengguna) agar RLS berlaku.
 * Bentuk Trip: { id, title, saved, source: 'ai'|'rules', durationDays, language,
 *   start: { type, label, lat, lng }, preferences: { categories[], family, accessible },
 *   days: [{ dayNumber, items: [{ destinationId, reasons[], km }] }], createdAt, updatedAt }
 */
const todo = (res, what) => res.status(501).json({ code: 'NOT_IMPLEMENTED', message: `${what} belum diimplementasikan.` });

export async function generate(req, res) {
  // TODO:
  // 1. Validasi input (durationDays 1–21, koordinat, preferences)
  // 2. rankCandidates() dari services/recommender.service.js
  // 3. llm.service.composeItinerary(candidates, input) → validasi semua ID ada di dataset
  // 4. Gagal/timeout → buildDays() berbasis aturan, source = 'rules'
  // 5. Simpan trips (saved=false) + itinerary_days + itinerary_items, kembalikan Trip
  return todo(res, 'Generate itinerary');
}
export async function list(req, res) { return todo(res, 'Daftar perjalanan'); }      // hanya saved = true
export async function get(req, res) { return todo(res, 'Detail perjalanan'); }
export async function update(req, res) { return todo(res, 'Ubah perjalanan'); }      // body { title?, days? }
export async function save(req, res) { return todo(res, 'Simpan perjalanan'); }      // set saved = true
export async function regenerate(req, res) { return todo(res, 'Susun ulang'); }      // body { dayIndex? }
export async function remove(req, res) { return todo(res, 'Hapus perjalanan'); }     // 204
