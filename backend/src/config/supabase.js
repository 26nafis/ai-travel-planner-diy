import { createClient } from '@supabase/supabase-js';

// TODO: isi .env. Klien admin hanya untuk operasi server; untuk query milik pengguna,
// gunakan klien dengan token pengguna agar RLS tetap berlaku (lihat middleware/auth.js).
export const supabaseAdmin = createClient(process.env.SUPABASE_URL || 'http://localhost', process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing', {
  auth: { persistSession: false },
});

export function supabaseForUser(accessToken) {
  return createClient(process.env.SUPABASE_URL || 'http://localhost', process.env.SUPABASE_ANON_KEY || 'missing', {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}
