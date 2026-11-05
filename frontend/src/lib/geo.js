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

export function mapsDirectionsLink(start, places) {
  if (!places?.length) return 'https://www.google.com/maps';
  const point = (p) => `${p.lat},${p.lng}`;
  const stops = start ? places : places.slice(1);
  const params = new URLSearchParams({
    api: '1', origin: start ? point(start) : point(places[0]),
    destination: point(stops.at(-1) || places[0]), travelmode: 'driving',
  });
  const waypoints = stops.slice(0, -1).map(point).join('|');
  if (waypoints) params.set('waypoints', waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function isInsideDIY({ lat, lng }, b) {
  return lat <= b.north && lat >= b.south && lng >= b.west && lng <= b.east;
}

export const DAY_COLORS = ['#0194F3', '#FF5E1F', '#0B9E6B', '#7B61FF', '#00A3A3', '#E5487A', '#4B5563'];
export const dayColor = (i) => DAY_COLORS[i % DAY_COLORS.length];
