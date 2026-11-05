/** Jarak garis lurus (km) antara dua koordinat. Bukan jarak jalan atau waktu tempuh. */
export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function mapsLink(place) {
  const q = encodeURIComponent(`${place.name} ${place.lat},${place.lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function isInsideDIY({ lat, lng }, b) {
  return lat <= b.north && lat >= b.south && lng >= b.west && lng <= b.east;
}

export const DAY_COLORS = ['#1E2B57', '#9C6B37', '#4F7F45', '#7A3E65', '#2F6F73', '#A88323', '#4B5563'];
export const dayColor = (i) => DAY_COLORS[i % DAY_COLORS.length];
