import { supabaseAdmin, supabaseForUser } from '../config/supabase.js';

/** Memeriksa header "Authorization: Bearer <token>" dan memasang req.user serta req.db. */
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Silakan masuk terlebih dahulu.' });
  // TODO: verifikasi token ke Supabase Auth
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Sesi tidak valid.' });
  req.user = data.user;
  req.db = supabaseForUser(token); // query lewat klien ini tunduk pada RLS
  next();
}
