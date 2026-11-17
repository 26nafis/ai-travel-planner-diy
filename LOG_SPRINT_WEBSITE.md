# Log Progres Website Lampah Jogja

**Tanggal snapshot:** 12 November 2026
**Basis pemeriksaan:** kode pada branch `feat/openfreemap-osrm-ui`, dokumentasi deployment, hasil pemeriksaan teknis yang tersedia, serta snapshot papan Trello yang pernah diperiksa.

## Cara membaca log ini

Proyek menggunakan alur **hybrid**: Waterfall untuk baseline dan gerbang keputusan, Kanban untuk mengatur pekerjaan harian. Karena Kanban tidak mensyaratkan sprint dengan durasi tetap, bagian W1–W8 di bawah adalah checkpoint rencana delapan minggu, bukan catatan aktivitas bertanggal. Repo juga tidak memberi bukti siapa yang menulis tiap fitur atau kapan fitur tersebut dibuat. Maka, “sudah ada” berarti implementasinya terlihat di kode; status penerimaan tetap menunggu QA.

## Ringkasan status

Website sudah memiliki alur inti perencanaan perjalanan, penyuntingan itinerary, penyimpanan lokal, peta dan rute, tampilan Indonesia–Inggris, serta chatbot berbasis Cloudflare Workers AI. Implementasi tersebut belum berarti seluruh kriteria produk sudah terpenuhi. Beberapa aturan rekomendasi belum sesuai rancangan, itinerary dari formulir masih menggunakan mesin aturan lokal, dan QA ujung-ke-ujung belum dibuktikan.

| Area | Status dari pemeriksaan |
|---|---|
| UI web responsif dan bilingual | Ada di kode; perlu QA perangkat |
| Data destinasi DIY | 468 entri dengan koordinat; perlu audit isi dan duplikasi |
| Form rencana perjalanan | Ada; pencarian titik awal terbatas pada saran bawaan |
| Rekomendasi berdasarkan durasi | Sebagian; aturan destinasi kurang dikenal untuk durasi ≥3 hari belum diterapkan |
| Buat dan sunting itinerary | Ada di mode penyimpanan lokal; perlu QA alur lengkap |
| Peta dan rute | MapLibre/OpenFreeMap dan OSRM ada; layanan rute publik tidak memiliki SLA |
| Chatbot LLM | Cloudflare Worker terhubung ke Llama 3.3 70B dengan fallback aturan |
| LLM untuk itinerary dari formulir | Belum terhubung; formulir memakai rekomendasi aturan lokal |
| Login dan penyimpanan cloud | Tidak aktif; perjalanan disimpan di browser yang sama |
| Penerimaan QA | Belum tercatat sebagai selesai |

## Log checkpoint delapan minggu

| Checkpoint | Pekerjaan yang sudah terlihat | Status |
|---|---|---|
| **W1–2 — Fondasi dan data** | Dataset destinasi DIY diproses menjadi data aplikasi. Terdapat 468 destinasi, koordinat, kategori, skor rekomendasi, rating, jumlah ulasan, dan label popularitas. | **Sebagian** — dua kelompok nama duplikat terdeteksi (“Lava Tour Merapi” dan “Candi Gebang”). Metadata jam operasional, aksesibilitas, dan keluarga belum terisi pada dataset saat ini. |
| **W3–4 — Form dan rekomendasi** | Form memilih durasi 1–7 hari atau 8–21 hari, lokasi awal, dan kategori minat alam/budaya/kuliner/aktivitas. Titik awal dapat dipilih dari geolokasi, saran bawaan, atau pin peta. Peringkat mempertimbangkan skor dataset, minat, dan kedekatan garis lurus. | **Sebagian** — perjalanan 1–2 hari memberi tambahan skor pada destinasi populer. Untuk ≥3 hari, kode belum memberi prioritas khusus kepada destinasi kurang dikenal. Kolom cari lokasi hanya memfilter daftar saran bawaan, belum mencari alamat/penginapan bebas. |
| **W5–6 — Itinerary dan peta** | Itinerary dapat dibuat, judulnya diubah, tempat ditambah/dihapus/diurutkan/dipindah antarhari, satu hari atau semua hari dibuat ulang, lalu disimpan, dibuka kembali, dan dihapus. Penyimpanan demo menggunakan `localStorage` pada browser yang sama. Peta menampilkan marker, rute jalan OSRM, jarak/perkiraan waktu, serta tautan Google Maps. | **Ada di kode; menunggu QA** — penyimpanan tidak tersinkron antarperangkat. Rute memakai server demo OSRM dan tidak mencakup kondisi lalu lintas langsung. |
| **W7–8 — AI, deployment, dan QA** | Cloudflare Worker menyediakan endpoint chat dan memakai binding Workers AI dengan model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Balasan dibatasi pada kandidat destinasi dataset, divalidasi, dan beralih ke aturan lokal bila model gagal. Pemeriksaan teknis sebelumnya mencatat build berhasil, homepage deployment merespons HTTP 200, dan `/api/health` menunjukkan binding AI aktif. | **Sebagian** — chatbot sudah tersambung, tetapi model tersebut bukan model mini. Form pembuat itinerary masih memakai mesin aturan frontend, bukan endpoint LLM Worker. Belum ada bukti QA pengguna untuk seluruh alur maupun pengujian mutu jawaban AI. |

## Fitur yang sudah ada di implementasi

### Pengalaman web

- Halaman beranda, rencana perjalanan, daftar perjalanan tersimpan, dan detail itinerary.
- Pilihan bahasa Indonesia dan Inggris.
- Tata letak responsif untuk ukuran layar kecil dan besar.
- Durasi perjalanan 1–7 hari serta pilihan fleksibel 8–21 hari.
- Preferensi kategori: alam, budaya, kuliner, dan aktivitas.
- Tanpa alur login; konsisten dengan keputusan terbaru untuk menyimpan perjalanan pada browser/perangkat yang sama.

### Itinerary dan peta

- Rekomendasi dan pembagian destinasi ke beberapa hari menggunakan aturan lokal.
- Penyuntingan urutan tempat, perpindahan tempat antarhari, tambah/hapus destinasi, ubah judul, dan buat ulang itinerary.
- Simpan, lihat kembali, dan hapus perjalanan lokal.
- Peta MapLibre dengan basemap OpenFreeMap, marker destinasi, serta pemilihan pin lokasi awal.
- Rute jalan dan estimasi jarak/waktu dari OSRM; tautan lokasi/rute dapat dibuka di Google Maps.

### Chatbot dan deployment

- Endpoint chat Cloudflare Worker menggunakan Workers AI dengan model Llama 3.3 70B.
- Keluaran itinerary chatbot diminta dalam struktur JSON dan divalidasi terhadap kandidat dari dataset; ada fallback berbasis aturan bila pemanggilan model gagal.
- Konfigurasi Cloudflare dan panduan deployment tersedia di repo.

## Pekerjaan yang perlu dilanjutkan

Urutan berikut disarankan sebelum fitur dinyatakan **Done** pada Trello:

1. **Selaraskan logika rekomendasi dengan kriteria produk.** Untuk durasi ≥3 hari, beri bobot/slot yang jelas pada destinasi kurang dikenal sesuai skor rekomendasi, lalu verifikasi aturan 1–2 hari populer dan ≥3 hari dengan contoh dataset.
2. **Putuskan sumber generator itinerary.** Saat ini formulir memakai mesin aturan lokal, sedangkan LLM hanya menangani chatbot. Jika itinerary harus disusun AI, hubungkan form ke Worker dan pertahankan validasi serta fallback; jika tidak, perbarui requirement dan materi presentasi.
3. **Audit dataset.** Putuskan cara menangani dua kelompok nama duplikat, cek koordinat dan sumber, serta tentukan apakah kolom jam operasional, aksesibilitas, dan kesesuaian keluarga akan diisi atau dikeluarkan dari klaim fitur.
4. **Lengkapi pencarian lokasi awal.** Saran bawaan sudah tersedia, tetapi pencarian bebas alamat atau penginapan/geocoding belum tersedia.
5. **Tetapkan status Supabase.** Aplikasi saat ini memuat dataset lokal dan menyimpan perjalanan di browser. Jika Supabase tetap menjadi kebutuhan, rancang koneksi dataset dan skema/aksesnya; login dan penyimpanan cloud saat ini tidak aktif.
6. **Uji kelayakan model dan biaya.** Uji mutu Llama 3.3 70B, bandingkan model mini bila masih menjadi tujuan, serta periksa kuota, batas permintaan, waktu respons, dan fallback.
7. **Lakukan QA penerimaan.** Uji skenario durasi, preferensi, izin lokasi ditolak, lokasi di luar DIY, data kosong/tidak valid, pembuatan dan penyuntingan itinerary, rute gagal, penggunaan bilingual, serta tampilan ponsel dan desktop.
8. **Perbarui Kanban dan dokumen produk.** Papan Trello pada snapshot sebelumnya masih menampilkan pekerjaan di Backlog/Ready, dengan In Progress, Review/QA, dan Done kosong. Sejumlah kartu lama juga menyebut Supabase Auth, Hugging Face, dan Google Maps API; selaraskan dengan keputusan terbaru: tanpa login, Worker Cloudflare, OpenFreeMap, dan OSRM.

## Catatan batasan dan status “Done”

- Dataset saat ini berada dalam berkas JSON aplikasi; belum dibaca dari Supabase.
- Perjalanan hanya tersimpan di browser yang sama; data dapat hilang bila penyimpanan situs dibersihkan dan tidak otomatis tersedia di perangkat lain.
- Pencarian lokasi memakai daftar saran statis. Geolokasi bergantung pada izin browser dan HTTPS/localhost.
- OSRM yang dipakai adalah endpoint demo publik. Jarak/waktu adalah estimasi rute jalan, bukan kondisi lalu lintas langsung.
- Belum ada bukti bahwa seluruh fitur sudah diuji oleh pemilik produk. Karena itu, fitur di atas dicatat sebagai implementasi yang terlihat, bukan penerimaan QA.
- Status branch saat snapshot: `feat/openfreemap-osrm-ui`; terdapat perubahan lokal yang belum di-commit. Log ini ditambahkan sebagai dokumentasi dan tidak mengubah kode fitur.

## Referensi implementasi

- Dataset: [`frontend/src/data/destinations.generated.json`](frontend/src/data/destinations.generated.json)
- Form dan pembuat rencana: [`frontend/src/pages/Plan.jsx`](frontend/src/pages/Plan.jsx), [`frontend/src/services/recommender.js`](frontend/src/services/recommender.js)
- Penyimpanan browser dan operasi perjalanan: [`frontend/src/services/mockApi.js`](frontend/src/services/mockApi.js)
- Detail itinerary: [`frontend/src/pages/TripDetail.jsx`](frontend/src/pages/TripDetail.jsx)
- Peta dan rute: [`frontend/src/components/TripMap.jsx`](frontend/src/components/TripMap.jsx), [`frontend/src/services/routing.js`](frontend/src/services/routing.js), [`frontend/src/lib/geo.js`](frontend/src/lib/geo.js)
- Chat dan validasi Worker AI: [`worker/index.js`](worker/index.js)
- Konfigurasi Cloudflare: [`wrangler.jsonc`](wrangler.jsonc), [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)
