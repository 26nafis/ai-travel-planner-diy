/**
 * DATA CONTOH untuk mode demo.
 * Koordinat dan jam buka bersifat perkiraan dan BELUM diverifikasi.
 * Ganti dengan dataset tim (lihat rancangan bagian 7) melalui endpoint GET /api/destinations.
 *
 * popularity: 'popular' (populer/ikonik) | 'hidden' (kurang dikenal)
 * categories: 'nature' | 'culture' | 'culinary' | 'activity'
 */
export const DESTINATIONS = [
  { id: 'keraton', name: 'Keraton Yogyakarta', regency: 'Kota Yogyakarta', lat: -7.8053, lng: 110.3642, categories: ['culture'], family: true, accessible: true, popularity: 'popular', hours: '08.00–14.00',
    desc: { id: 'Istana Kesultanan dengan pendopo, koleksi pusaka, dan pertunjukan seni harian.', en: 'The Sultanate palace, with pavilions, heirlooms, and daily performances.' } },
  { id: 'tamansari', name: 'Taman Sari', regency: 'Kota Yogyakarta', lat: -7.8100, lng: 110.3594, categories: ['culture'], family: true, accessible: false, popularity: 'popular', hours: '09.00–15.00',
    desc: { id: 'Bekas taman air kerajaan dengan kolam dan lorong bawah tanah.', en: 'Former royal water garden with bathing pools and underground passages.' } },
  { id: 'malioboro', name: 'Jalan Malioboro', regency: 'Kota Yogyakarta', lat: -7.7925, lng: 110.3658, categories: ['culture', 'culinary'], family: true, accessible: true, popularity: 'popular', hours: '24 jam',
    desc: { id: 'Jalan legendaris untuk berjalan kaki, belanja batik, dan jajanan malam.', en: 'The city’s famous street for walking, batik shopping, and night snacks.' } },
  { id: 'vredeburg', name: 'Museum Benteng Vredeburg', regency: 'Kota Yogyakarta', lat: -7.8003, lng: 110.3663, categories: ['culture'], family: true, accessible: true, popularity: 'popular', hours: '08.00–16.00',
    desc: { id: 'Benteng kolonial yang kini menjadi museum sejarah perjuangan.', en: 'A colonial fort turned museum of Indonesia’s independence struggle.' } },
  { id: 'alkid', name: 'Alun-Alun Kidul', regency: 'Kota Yogyakarta', lat: -7.8118, lng: 110.3633, categories: ['culture', 'activity'], family: true, accessible: true, popularity: 'popular', hours: 'Sore–malam',
    desc: { id: 'Lapangan selatan keraton, ramai saat malam dengan sepeda lampu dan tradisi masangin.', en: 'The palace’s south square, lively at night with lit-up pedal cars.' } },
  { id: 'tamanpintar', name: 'Taman Pintar', regency: 'Kota Yogyakarta', lat: -7.8007, lng: 110.3676, categories: ['activity'], family: true, accessible: true, popularity: 'popular', hours: '08.30–15.30',
    desc: { id: 'Taman sains interaktif yang cocok untuk anak-anak.', en: 'An interactive science park that suits children well.' } },
  { id: 'jnm', name: 'Jogja National Museum', regency: 'Kota Yogyakarta', lat: -7.7999, lng: 110.3528, categories: ['culture'], family: false, accessible: true, popularity: 'hidden', hours: 'Mengikuti jadwal pameran',
    desc: { id: 'Ruang seni kontemporer yang sering menjadi tuan rumah pameran besar.', en: 'A contemporary art space that hosts major exhibitions.' } },
  { id: 'kotagede', name: 'Kotagede', regency: 'Kota Yogyakarta', lat: -7.8290, lng: 110.4005, categories: ['culture'], family: true, accessible: false, popularity: 'hidden', hours: null,
    desc: { id: 'Kota tua Mataram dengan gang sempit, rumah kalang, dan perajin perak.', en: 'The old Mataram town, with narrow lanes and silversmith workshops.' } },
  { id: 'gudeg-yudjum', name: 'Gudeg Yu Djum Wijilan', regency: 'Kota Yogyakarta', lat: -7.8049, lng: 110.3672, categories: ['culinary'], family: true, accessible: true, popularity: 'popular', hours: '06.00–21.00',
    desc: { id: 'Gudeg kering khas Jogja di sentra gudeg Wijilan.', en: 'Classic dry-style gudeg in the Wijilan gudeg quarter.' } },
  { id: 'kopijoss', name: 'Kopi Joss Lik Man', regency: 'Kota Yogyakarta', lat: -7.7890, lng: 110.3637, categories: ['culinary'], family: false, accessible: true, popularity: 'hidden', hours: 'Malam',
    desc: { id: 'Angkringan dekat Stasiun Tugu dengan kopi berisi arang membara.', en: 'A street stall near Tugu Station serving coffee with a hot charcoal.' } },
  { id: 'bakmi-mbahgito', name: 'Bakmi Jawa Mbah Gito', regency: 'Bantul', lat: -7.8240, lng: 110.4040, categories: ['culinary'], family: true, accessible: true, popularity: 'hidden', hours: '11.00–22.00',
    desc: { id: 'Bakmi Jawa yang dimasak di atas tungku arang, dalam bangunan kayu.', en: 'Javanese noodles cooked over charcoal in a wooden house.' } },
  { id: 'sate-klathak', name: 'Sate Klathak Pak Pong', regency: 'Bantul', lat: -7.8711, lng: 110.3956, categories: ['culinary'], family: true, accessible: true, popularity: 'hidden', hours: '10.00–22.00',
    desc: { id: 'Sate kambing berbumbu garam, ditusuk jeruji sepeda.', en: 'Salt-seasoned goat satay grilled on bicycle-spoke skewers.' } },
  { id: 'kasongan', name: 'Desa Wisata Kasongan', regency: 'Bantul', lat: -7.8466, lng: 110.3434, categories: ['culture', 'activity'], family: true, accessible: true, popularity: 'hidden', hours: '08.00–17.00',
    desc: { id: 'Sentra gerabah tempat kamu bisa mencoba membuat keramik.', en: 'A pottery village where you can try making ceramics.' } },
  { id: 'mangunan-pinus', name: 'Hutan Pinus Mangunan', regency: 'Bantul', lat: -7.9265, lng: 110.4317, categories: ['nature'], family: true, accessible: false, popularity: 'popular', hours: '06.00–17.00',
    desc: { id: 'Hutan pinus berbukit yang sejuk untuk berjalan santai.', en: 'Cool hillside pine forest for an easy walk.' } },
  { id: 'becici', name: 'Puncak Becici', regency: 'Bantul', lat: -7.9030, lng: 110.4380, categories: ['nature'], family: true, accessible: false, popularity: 'hidden', hours: '06.00–18.00',
    desc: { id: 'Gardu pandang di antara pinus dengan pemandangan matahari terbit.', en: 'A pine-forest viewpoint known for its sunrise.' } },
  { id: 'kebun-buah', name: 'Kebun Buah Mangunan', regency: 'Bantul', lat: -7.9418, lng: 110.4246, categories: ['nature'], family: true, accessible: false, popularity: 'hidden', hours: '05.00–17.00',
    desc: { id: 'Bukit dengan lautan kabut di atas Sungai Oya pada pagi hari.', en: 'A hilltop where morning fog settles over the Oya River.' } },
  { id: 'parangtritis', name: 'Pantai Parangtritis', regency: 'Bantul', lat: -8.0257, lng: 110.3290, categories: ['nature'], family: true, accessible: true, popularity: 'popular', hours: '24 jam',
    desc: { id: 'Pantai paling terkenal di selatan Jogja, ramai saat senja.', en: 'Jogja’s best-known southern beach, busiest at sunset.' } },
  { id: 'gumuk-pasir', name: 'Gumuk Pasir Parangkusumo', regency: 'Bantul', lat: -8.0130, lng: 110.3080, categories: ['nature', 'activity'], family: true, accessible: false, popularity: 'hidden', hours: '07.00–18.00',
    desc: { id: 'Bukit pasir pantai yang bisa dicoba untuk sandboarding.', en: 'Coastal sand dunes where you can try sandboarding.' } },
  { id: 'ratuboko', name: 'Situs Ratu Boko', regency: 'Sleman', lat: -7.7705, lng: 110.4894, categories: ['culture'], family: true, accessible: false, popularity: 'popular', hours: '06.30–17.00',
    desc: { id: 'Situs keraton kuno di atas bukit dengan gapura ikonik.', en: 'An ancient hilltop palace site with an iconic gateway.' } },
  { id: 'sambisari', name: 'Candi Sambisari', regency: 'Sleman', lat: -7.7623, lng: 110.4472, categories: ['culture'], family: true, accessible: true, popularity: 'hidden', hours: '08.00–16.00',
    desc: { id: 'Candi Hindu yang terletak beberapa meter di bawah permukaan tanah.', en: 'A Hindu temple sitting several metres below ground level.' } },
  { id: 'candi-ijo', name: 'Candi Ijo', regency: 'Sleman', lat: -7.7838, lng: 110.5118, categories: ['culture', 'nature'], family: true, accessible: false, popularity: 'hidden', hours: '08.00–17.00',
    desc: { id: 'Candi tertinggi di Jogja dengan panorama sawah dan landasan pacu.', en: 'Jogja’s highest temple, overlooking rice fields and the old airport.' } },
  { id: 'breksi', name: 'Tebing Breksi', regency: 'Sleman', lat: -7.7820, lng: 110.5045, categories: ['nature', 'activity'], family: true, accessible: false, popularity: 'popular', hours: '06.00–20.00',
    desc: { id: 'Bekas tambang batu berukir dengan amfiteater terbuka.', en: 'A carved former limestone quarry with an open-air amphitheatre.' } },
  { id: 'ullen-sentalu', name: 'Museum Ullen Sentalu', regency: 'Sleman', lat: -7.5981, lng: 110.4237, categories: ['culture'], family: false, accessible: false, popularity: 'hidden', hours: '08.30–16.00',
    desc: { id: 'Museum budaya Jawa di Kaliurang dengan tur berpemandu.', en: 'A guided-tour museum of Javanese court culture in Kaliurang.' } },
  { id: 'merapi-lava', name: 'Lava Tour Merapi', regency: 'Sleman', lat: -7.5890, lng: 110.4460, categories: ['nature', 'activity'], family: true, accessible: false, popularity: 'popular', hours: '06.00–16.00',
    desc: { id: 'Tur jip menyusuri jejak erupsi Merapi 2010.', en: 'A jeep tour through the traces of Merapi’s 2010 eruption.' } },
  { id: 'goa-pindul', name: 'Goa Pindul', regency: 'Gunungkidul', lat: -7.9316, lng: 110.6491, categories: ['nature', 'activity'], family: true, accessible: false, popularity: 'popular', hours: '07.00–16.00',
    desc: { id: 'Cave tubing menyusuri sungai bawah tanah dengan ban.', en: 'Cave tubing along an underground river.' } },
  { id: 'sri-gethuk', name: 'Air Terjun Sri Gethuk', regency: 'Gunungkidul', lat: -7.9418, lng: 110.4936, categories: ['nature'], family: true, accessible: false, popularity: 'hidden', hours: '08.00–17.00',
    desc: { id: 'Air terjun di tepi Sungai Oya, dicapai dengan rakit.', en: 'A waterfall on the Oya River, reached by raft.' } },
  { id: 'timang', name: 'Pantai Timang', regency: 'Gunungkidul', lat: -8.1750, lng: 110.6620, categories: ['nature', 'activity'], family: false, accessible: false, popularity: 'hidden', hours: '07.00–17.00',
    desc: { id: 'Pantai karang dengan gondola kayu menuju pulau kecil.', en: 'A rocky beach with a wooden gondola to a tiny island.' } },
  { id: 'wediombo', name: 'Pantai Wediombo', regency: 'Gunungkidul', lat: -8.1890, lng: 110.7090, categories: ['nature'], family: true, accessible: false, popularity: 'hidden', hours: '24 jam',
    desc: { id: 'Teluk berpasir putih dengan laguna alami yang tenang.', en: 'A white-sand bay with a calm natural lagoon.' } },
  { id: 'kalibiru', name: 'Kalibiru', regency: 'Kulon Progo', lat: -7.8050, lng: 110.1290, categories: ['nature'], family: true, accessible: false, popularity: 'hidden', hours: '07.00–17.00',
    desc: { id: 'Hutan wisata dengan panggung kayu menghadap Waduk Sermo.', en: 'A forest park with wooden decks above the Sermo Reservoir.' } },
  { id: 'glagah', name: 'Pantai Glagah', regency: 'Kulon Progo', lat: -7.9150, lng: 110.0750, categories: ['nature'], family: true, accessible: true, popularity: 'hidden', hours: '24 jam',
    desc: { id: 'Pantai dekat bandara YIA dengan laguna dan pemecah ombak.', en: 'A beach near YIA airport with a lagoon and breakwater.' } },
];

/** Titik awal populer untuk pencarian alamat di mode demo. */
export const START_SUGGESTIONS = [
  { label: 'Stasiun Tugu Yogyakarta', lat: -7.7892, lng: 110.3634 },
  { label: 'Stasiun Lempuyangan', lat: -7.7903, lng: 110.3752 },
  { label: 'Bandara Internasional Yogyakarta (YIA)', lat: -7.9074, lng: 110.0549 },
  { label: 'Terminal Giwangan', lat: -7.8346, lng: 110.3925 },
  { label: 'Prawirotaman', lat: -7.8187, lng: 110.3683 },
  { label: 'Universitas Gadjah Mada', lat: -7.7713, lng: 110.3775 },
  { label: 'Jalan Kaliurang KM 5', lat: -7.7560, lng: 110.3815 },
  { label: 'Seturan', lat: -7.7700, lng: 110.4100 },
];

/** Batas kira-kira wilayah DIY untuk peta skematis & validasi pin. */
export const DIY_BOUNDS = { north: -7.54, south: -8.22, west: 110.0, east: 110.86 };
