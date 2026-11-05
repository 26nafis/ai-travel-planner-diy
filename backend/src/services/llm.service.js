/**
 * Integrasi Hugging Face Inference + Meta-Llama.
 * Prinsip: LLM hanya boleh memilih dari ID destinasi kandidat. Backend memvalidasi hasilnya.
 */
export async function composeItinerary(candidates, input) {
  // TODO (Sprint 3):
  // - Kirim daftar kandidat {id, name, categories, popularity, km} + durationDays + bahasa
  // - Minta keluaran JSON: { days: [{ dayNumber, items: [{ destinationId, note }] }] }
  // - Tolak/abaikan destinationId yang tidak ada di candidates
  // - Terapkan timeout & batas pemakaian; lempar error agar controller beralih ke aturan
  throw Object.assign(new Error('LLM belum dikonfigurasi'), { code: 'LLM_UNAVAILABLE' });
}
