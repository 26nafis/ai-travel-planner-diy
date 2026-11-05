import OpenAI from 'openai';

export function isHuggingFaceConfigured() {
  return Boolean(process.env.HF_TOKEN);
}

export function configuredModel() {
  return process.env.HF_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';
}

/** Ask Hugging Face to select only destination IDs supplied by the caller. */
export async function selectItinerary(candidates, durationDays, language) {
  const token = process.env.HF_TOKEN;
  if (!token) throw Object.assign(new Error('HF_TOKEN belum diatur di backend/.env'), { code: 'LLM_NOT_CONFIGURED' });

  const allowed = candidates.map(({ id, name, categories, rating, voteCount }) => ({ id, name, categories, rating, voteCount }));
  const system = [
    'You are Lampah Jogja, a tourism itinerary assistant for first-time visitors to Yogyakarta, Indonesia.',
    `Respond in ${language === 'en' ? 'English' : 'Indonesian'}.`,
    'Build an itinerary using only the candidate destination IDs in the user message. Never invent places, opening hours, travel times, or prices.',
    `The trip lasts ${durationDays} days. Return exactly ${durationDays} day arrays, with 3 places per day for trips of 3+ days and 4 places per day for shorter trips.`,
    'Do not repeat a destination. Prefer high recommendation scores implicit in the candidate order; for trips under 3 days, popular places are already prioritized.',
    'Return only valid JSON with this shape: {"intro":"one short sentence","destinationIdsByDay":[["id", "id", "id"]]}. No Markdown fences or extra keys.',
  ].join(' ');
  const user = `Candidate destinations, in ranked order:\n${JSON.stringify(allowed)}\n\nCreate the itinerary now.`;

  const client = new OpenAI({
    baseURL: 'https://router.huggingface.co/v1',
    apiKey: token,
    timeout: 45000,
    maxRetries: 0,
  });
  try {
    const response = await client.chat.completions.create({
      model: configuredModel(),
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.2,
      max_tokens: Math.min(4096, Math.max(700, durationDays * 120)),
    });
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw Object.assign(new Error('Respons Hugging Face kosong.'), { code: 'LLM_EMPTY_RESPONSE' });
    return parseSelection(content);
  } catch (error) {
    if (error.code === 'LLM_EMPTY_RESPONSE' || error.code === 'LLM_INVALID_RESPONSE') throw error;
    if (error.name === 'APIConnectionTimeoutError' || error.name === 'AbortError') throw Object.assign(new Error('Koneksi Hugging Face melewati batas waktu.'), { code: 'LLM_TIMEOUT' });
    if (error.status === 401 || error.status === 403) throw Object.assign(new Error('Token Hugging Face ditolak.'), { code: 'LLM_AUTH_FAILED' });
    if (error.status === 402) throw Object.assign(new Error('Kredit Inference Providers Hugging Face tidak mencukupi.'), { code: 'LLM_CREDITS_EXHAUSTED' });
    if (error.status) throw Object.assign(new Error(`Hugging Face mengembalikan HTTP ${error.status}.`), { code: 'LLM_REQUEST_FAILED' });
    throw error;
  }
}

function parseSelection(content) {
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw Object.assign(new Error('Format respons Hugging Face tidak sesuai.'), { code: 'LLM_INVALID_RESPONSE' });
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (typeof parsed.intro !== 'string' || !Array.isArray(parsed.destinationIdsByDay)) throw new Error();
    return { intro: parsed.intro.slice(0, 240), destinationIdsByDay: parsed.destinationIdsByDay };
  } catch {
    throw Object.assign(new Error('Hugging Face tidak mengembalikan JSON itinerary yang valid.'), { code: 'LLM_INVALID_RESPONSE' });
  }
}
