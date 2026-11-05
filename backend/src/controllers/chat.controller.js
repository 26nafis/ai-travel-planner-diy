/**
 * POST /api/chat → { reply, meta? }
 * Body: { messages: [{ role: 'user'|'assistant', content }], language: 'id'|'en' }
 * meta dipakai frontend untuk mengisi form itinerary: { durationDays, categories, family, accessible }.
 */
export async function send(_req, res) {
  // TODO (Sprint 3):
  // - Validasi jumlah & panjang pesan
  // - Panggil layanan LLM dengan konteks data destinasi
  // - Kembalikan { reply, meta } dan batasi pemakaian per pengguna
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Chat AI belum diimplementasikan.' });
}
