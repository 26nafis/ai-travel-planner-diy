const OSRM_BASE_URL = `${import.meta.env.VITE_OSRM_BASE_URL || 'https://router.project-osrm.org'}/route/v1/driving`;
const REQUEST_GAP_MS = 1100;
const routeCache = new Map();
let queue = Promise.resolve();
let lastRequestAt = 0;

function validPoint(point) {
  return Number.isFinite(point?.lat) && Number.isFinite(point?.lng)
    && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
}

function cacheKey(points) {
  return points.map(({ lat, lng }) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';');
}

/** Fetch a driving route from the public OSRM demo; requests are serialized and cached. */
export function getDrivingRoute(points) {
  if (!Array.isArray(points) || points.length < 2 || points.some((point) => !validPoint(point))) {
    return Promise.reject(new Error('Rute membutuhkan minimal dua titik dengan koordinat yang valid.'));
  }
  const key = cacheKey(points);
  if (routeCache.has(key)) return routeCache.get(key);

  const request = queue.then(async () => {
    const wait = Math.max(0, REQUEST_GAP_MS - (Date.now() - lastRequestAt));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();

    const path = points.map(({ lat, lng }) => `${lng},${lat}`).join(';');
    const url = `${OSRM_BASE_URL}/${path}?overview=full&geometries=geojson&steps=false&alternatives=false`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Layanan rute merespons ${response.status}.`);
    const payload = await response.json();
    const route = payload.routes?.[0];
    if (payload.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
      throw new Error('Rute jalan untuk titik ini tidak ditemukan.');
    }
    return {
      geometry: route.geometry,
      distanceKm: route.distance / 1000,
      durationMinutes: Math.round(route.duration / 60),
    };
  });

  // Keep later requests flowing after a failed request, while caching in-flight work.
  queue = request.catch(() => undefined);
  routeCache.set(key, request);
  if (routeCache.size > 48) routeCache.delete(routeCache.keys().next().value);
  request.catch(() => routeCache.delete(key));
  return request;
}
