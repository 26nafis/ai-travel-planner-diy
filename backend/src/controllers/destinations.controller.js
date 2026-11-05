/**
 * GET /api/destinations → Destination[]
 * Bentuk item: { id, name, regency, lat, lng, categories[], family, accessible,
 *                popularity: 'popular'|'hidden', hours, desc: { id, en } }
 */
export async function list(_req, res) {
  // TODO: select dari tabel destinations lalu petakan desc_id/desc_en → desc { id, en }
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Daftar destinasi belum diimplementasikan.' });
}
