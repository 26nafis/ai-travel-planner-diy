# Lampah Jogja: AI Travel Planner DIY

Frontend (UI/UX) sudah lengkap dan bisa dijalankan tanpa backend (mode demo).
Backend berisi kerangka Express yang tinggal diisi (`TODO`).

## Struktur

```
ai-travel-planner-diy/
├── frontend/                 React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/            Landing, AuthPage (masuk/daftar), Plan, TripDetail, MyTrips, NotFound
│       ├── components/       Header, TripMap, DayTimeline, AddPlacePanel, pemilih durasi/lokasi/preferensi, dll.
│       ├── i18n/             id.js & en.js (semua teks UI), LanguageContext
│       ├── context/          AuthContext
│       ├── services/         api.js (pintu tunggal), mockApi.js (demo), recommender.js
│       ├── data/             destinations.js (DATA CONTOH, ganti dengan dataset tim)
│       └── lib/              geo.js (jarak garis lurus, tautan Google Maps, warna hari)
└── backend/                  Node.js + Express (siap deploy ke Vercel)
    ├── api/index.js          entry Vercel
    ├── src/routes/           auth, profile, destinations, trips
    ├── src/controllers/      handler berisi TODO, mengembalikan 501 sampai diisi
    ├── src/services/         recommender.service.js, llm.service.js (Hugging Face/Llama)
    ├── src/middleware/auth.js
    └── db/schema.sql         tabel + Row Level Security untuk Supabase
```

## Menjalankan frontend

```bash
cd frontend
cp .env.example .env      # biarkan VITE_API_URL kosong untuk mode demo
npm install
npm run dev               # http://localhost:5173
```

Mode demo menyimpan akun dan perjalanan di localStorage browser, jadi alur lengkap
(daftar → susun itinerary → edit → simpan → buka lagi → hapus) bisa didemokan tanpa server.
Peta memakai peta skematis bawaan sampai `VITE_GOOGLE_MAPS_API_KEY` diisi.

## Menyambungkan ke backend

1. Isi `backend/.env`, jalankan `db/schema.sql` di Supabase, lalu `npm install && npm run dev` di `backend/`.
2. Isi `VITE_API_URL=http://localhost:3000` di `frontend/.env`.
3. Lengkapi controller sampai respons sama bentuknya dengan `frontend/src/services/mockApi.js`.

## Kontrak API

| Method | Endpoint | Body | Respons |
|---|---|---|---|
| POST | /api/auth/register | `{ name, email, password, language }` | `{ token, user }` |
| POST | /api/auth/login | `{ email, password }` | `{ token, user }` |
| GET | /api/auth/me | | `user` |
| PATCH | /api/profile | `{ name?, language? }` | `user` |
| GET | /api/destinations | | `Destination[]` |
| POST | /api/chat | `{ messages, language }` | `{ reply, meta? }` |
| POST | /api/trips/generate | `{ durationDays, start, preferences, language }` | `Trip` (saved: false) |
| GET | /api/trips | | `Trip[]` yang sudah disimpan |
| GET | /api/trips/:id | | `Trip` |
| PUT | /api/trips/:id | `{ title?, days? }` | `Trip` |
| POST | /api/trips/:id/save | `{ title?, days? }` | `Trip` (saved: true) |
| POST | /api/trips/:id/regenerate | `{ dayIndex? }` | `Trip` |
| DELETE | /api/trips/:id | | 204 |

Error selalu berbentuk `{ code, message }`. Bentuk `Trip` dan `Destination` dijelaskan
di komentar `backend/src/controllers/`.

Bila `source` pada Trip bernilai `rules` (LLM gagal dan backend memakai aturan), frontend
menampilkan pemberitahuan kepada pengguna, sesuai kriteria keberhasilan nomor 7.

## Mengganti nama aplikasi

"Lampah Jogja" hanya nama kerja. Ganti `appName` di `frontend/src/i18n/id.js` dan `en.js`,
serta `<title>` di `frontend/index.html`.
