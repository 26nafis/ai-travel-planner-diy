# Lampah Jogja

Prototipe web planner perjalanan untuk wisatawan yang baru pertama kali datang ke DIY. Pengguna memilih durasi, titik awal, dan kategori minat; aplikasi menyusun itinerary, lalu pengguna dapat mengubah, menyusun ulang, menyimpan, membuka, atau menghapus perjalanan.

## Menjalankan

```powershell
cd frontend
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite. Dalam mode tanpa backend, aplikasi memakai aturan lokal dan menyimpan perjalanan di `localStorage` browser yang sama. Frontend berjalan pada `http://127.0.0.1:5173`.

## Dataset

CSV sumber berada di `dataset/dataset-wisata-jogja-sekitar.csv`. Untuk membuat ulang data yang dipakai frontend:

```powershell
py scripts/prepare_dataset.py
```

Skrip menormalkan tipe destinasi menjadi kategori aplikasi, menghitung skor dari rating dan jumlah ulasan, serta menandai popularitas berdasarkan jumlah ulasan. Data sumber tidak menyediakan kabupaten, jam buka, aksesibilitas, atau atribut ramah keluarga; karena itu aplikasi tidak mengklaim menyaring destinasi berdasarkan atribut tersebut. Deskripsi sumber berbahasa Indonesia.

## Yang tersedia saat ini

- Web responsif dengan pilihan bahasa Indonesia dan Inggris.
- Durasi 1–7 hari dan pilihan 8 hari atau lebih (hingga 21 hari).
- Titik awal dari geolokasi, daftar lokasi umum, atau pin pada peta skematis.
- Rekomendasi kategori dan penyusunan itinerary berdasarkan dataset, rating/ulasan, serta kedekatan garis lurus.
- Edit urutan, pindah/hapus destinasi, tambah tempat, susun ulang semua/hari tertentu, dan simpan lokal.
- Tautan per hari untuk membuka rute berkendara di Google Maps; rute dan waktu tempuh dihitung oleh Google Maps setelah dibuka.
- Endpoint chat backend mengirim kandidat destinasi dataset ke Hugging Face dan menerima pilihan ID destinasi yang divalidasi server.
- Bila token/model tidak tersedia atau jawabannya tidak valid, chatbot membuat draf dari aturan dataset dan menandainya sebagai fallback.

## Belum terhubung

- Chat backend memerlukan token Hugging Face dengan izin Inference Providers. Buat `backend/.env` dari `.env.example`, lalu isi `HF_TOKEN`.
- Untuk uji chatbot melalui backend lokal, jalankan `npm install` dan `npm run dev` di folder `backend`; jalankan frontend dengan `VITE_API_URL=http://localhost:3000`.
- Database Supabase, penyimpanan perjalanan lintas perangkat, dan endpoint trip backend belum diaktifkan. Dataset koneksi tes sekarang dibaca dari JSON lokal; sumber produksi dapat dialihkan ke Supabase.
- Google Maps JavaScript API bersifat opsional. Tanpa kunci API, tampilan peta tetap skematis; daftar titik awal adalah saran bawaan, bukan pencarian alamat/geocoding.
- Dataset membutuhkan validasi cakupan wilayah, kelengkapan koordinat, kualitas deskripsi, dan kemutakhiran ulasan sebelum dipakai sebagai informasi perjalanan publik.

Endpoint chat adalah bagian backend yang sudah tersedia untuk uji lokal. Endpoint auth, destinasi API, dan trip masih berupa kerangka.
