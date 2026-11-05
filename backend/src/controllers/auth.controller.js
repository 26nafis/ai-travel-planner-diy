// Bentuk respons harus sama dengan frontend/src/services/mockApi.js
const todo = (res, what) => res.status(501).json({ code: 'NOT_IMPLEMENTED', message: `${what} belum diimplementasikan.` });

/** POST /api/auth/register  body { name, email, password, language } → { token, user } */
export async function register(req, res) {
  // TODO: supabase.auth.signUp, lalu buat baris di tabel profiles
  return todo(res, 'Register');
}

/** POST /api/auth/login  body { email, password } → { token, user } */
export async function login(req, res) {
  // TODO: supabase.auth.signInWithPassword → token = session.access_token
  return todo(res, 'Login');
}

/** POST /api/auth/logout → 204 */
export async function logout(_req, res) { res.status(204).end(); }

/** GET /api/auth/me → user { id, name, email, language } */
export async function me(req, res) {
  // TODO: ambil baris profiles milik req.user.id
  return todo(res, 'Me');
}

/** PATCH /api/profile  body { name?, language? } → user */
export async function updateProfile(req, res) {
  return todo(res, 'Update profile');
}
