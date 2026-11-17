# Deploy Lampah Jogja ke Cloudflare Workers

Frontend Vite, endpoint `/api/chat`, dan Workers AI dijalankan di satu Worker. Pembuatan itinerary, edit, simpan, buka, dan hapus tetap memakai localStorage browser. Backend Express/Vercel yang ada tidak dipakai oleh konfigurasi ini.

## Yang perlu disiapkan

1. Akun Cloudflare dan subdomain `workers.dev` yang sudah aktif. Domain sendiri bersifat opsional.
2. Repo GitHub berisi branch yang akan dipakai untuk deployment.
3. Pastikan nama model di `wrangler.jsonc` masih tersedia pada katalog Workers AI sebelum deploy. Model default saat ini `@cf/meta/llama-3.3-70b-instruct-fp8-fast` untuk mempertahankan keluarga Meta-Llama.
4. Jika memakai Workers Builds dari GitHub, gunakan root directory repo, build command `npm run build`, deploy command `npx wrangler deploy`, dan jangan set `VITE_API_URL` agar itinerary tetap memakai storage lokal.

## Deploy pertama dari komputer lokal

Jalankan dari root repo:

```powershell
npm install
npx wrangler login
npm run deploy
```

Wrangler akan meminta otorisasi akun Cloudflare di browser. Setelah deploy, buka URL `https://lampah-jogja.<subdomain>.workers.dev` yang ditampilkan di terminal.

## Cara kerjanya

- `wrangler.jsonc` membangun static assets dari `frontend/dist`, mengarahkan `/api/*` ke Worker, dan menyediakan fallback SPA untuk URL React.
- Workers AI dihubungkan dengan binding `AI`; kode memanggil model dari sisi server. Tidak ada token AI yang dikirim ke browser.
- `npm run build` memasang dependensi frontend lalu membuat asset Vite. `npm run dev` membangun asset dan menjalankan Worker melalui Wrangler. Pemanggilan Workers AI dari Wrangler menggunakan akun Cloudflare dan mengonsumsi kuota.
- Ubah `AI_MODEL` di `wrangler.jsonc` atau dashboard Worker untuk memilih model lain. Jangan pilih kembali Llama 3.1 8B FP8 yang dijadwalkan berhenti pada 20 November 2026.

## Pengaturan keamanan dan biaya

- Endpoint `POST /api/chat` dibatasi 10 permintaan per 60 detik per alamat IP dan lokasi edge melalui Rate Limiting binding Worker. Batas ini bersifat perkiraan dan penghitung tiap lokasi edge terpisah; ini mengurangi spam tetapi bukan batas biaya global.
- Kuota gratis Workers AI saat ini 10.000 Neurons per hari. Melewati kuota gratis memerlukan Workers Paid dan dikenai biaya; model 70B memiliki tarif token tersendiri. Periksa [harga Workers AI](https://developers.cloudflare.com/workers-ai/platform/pricing/) sebelum menaikkan penggunaan.
- Pantau Logs/Observability setelah deployment. Worker hanya mencatat kelas kegagalan AI; jangan menambahkan isi chat atau koordinat pengguna ke log.
- Peta menggunakan OpenFreeMap dan rute memakai server demo OSRM eksternal. Keduanya bukan bagian dari Workers AI dan memiliki kebijakan/availability masing-masing.

## Verifikasi pascadeploy

1. Buka `/api/health`; pastikan `ok` dan `aiBound` bernilai `true`.
2. Buat itinerary, ubah urutan, simpan, muat ulang halaman, lalu pastikan perjalanan tetap ada di browser yang sama.
3. Kirim permintaan chat seperti “3 hari di Jogja, suka alam dan kuliner”; pastikan hasil hanya menyebut destinasi dari dataset. Jika model gagal, Worker mengembalikan fallback berbasis aturan.
4. Buka detail perjalanan dan pastikan OpenFreeMap, rute, jarak, dan estimasi waktu muncul. Rute memakai data jalan dan tidak menyertakan lalu lintas langsung.

Catatan: database Supabase, perjalanan lintas perangkat, login, dan endpoint itinerary backend tidak termasuk dalam konfigurasi ini.
