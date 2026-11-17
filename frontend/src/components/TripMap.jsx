import { useEffect, useRef, useState } from 'react';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLang } from '../i18n/LanguageContext.jsx';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const EMPTY_ROUTE = { type: 'FeatureCollection', features: [] };

/** points: [{ id, lat, lng, number, color, title, day }], start: { lat, lng, label } */
export default function TripMap({ points = [], start, activeId, onSelect, onPick, routeGeometry, className = '' }) {
  const { t } = useLang();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const maplibreRef = useRef(null);
  const markersRef = useRef([]);
  const callbacksRef = useRef({});
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  callbacksRef.current = { onPick, onSelect };

  useEffect(() => {
    if (!containerRef.current) return undefined;
    let alive = true;
    let map;
    let timeout;

    import('maplibre-gl').then((maplibre) => {
      if (!alive) return;
      const { LngLatBounds, Map: MapLibreMap, Marker, NavigationControl, setWorkerUrl } = maplibre;
      maplibreRef.current = maplibre;
      setWorkerUrl(mapWorkerUrl);
      map = new MapLibreMap({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [110.35, -7.86],
        zoom: 8.2,
        minZoom: 6,
        maxZoom: 18,
        attributionControl: { compact: true },
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
      });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');

      timeout = window.setTimeout(() => { if (alive && !map.loaded()) setFailed(true); }, 14000);
      map.once('load', () => {
        if (!alive) return;
        window.clearTimeout(timeout);
        setLoaded(true);
        if (!map.getSource('route-line')) {
          map.addSource('route-line', { type: 'geojson', data: EMPTY_ROUTE });
          const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
          const paper = getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim();
          map.addLayer({
            id: 'route-line', type: 'line', source: 'route-line',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': accent, 'line-width': 5, 'line-opacity': 0.88 },
          });
          map.addLayer({
            id: 'route-casing', type: 'line', source: 'route-line',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': paper, 'line-width': 9, 'line-opacity': 0.9 },
          }, 'route-line');
        }
      });
      map.on('click', (event) => {
        const pick = callbacksRef.current.onPick;
        if (pick) pick({ lat: event.lngLat.lat, lng: event.lngLat.lng });
      });
    }).catch(() => { if (alive) setFailed(true); });

    return () => {
      alive = false;
      window.clearTimeout(timeout);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!map || !loaded || !maplibre) return;
    const { LngLatBounds, Marker } = maplibre;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (start && Number.isFinite(start.lat) && Number.isFinite(start.lng)) {
      const startEl = document.createElement('span');
      startEl.className = 'map-start-marker';
      startEl.setAttribute('aria-label', start.label || t.map.start);
      startEl.title = start.label || t.map.start;
      markersRef.current.push(new Marker({ element: startEl, anchor: 'center' }).setLngLat([start.lng, start.lat]).addTo(map));
    }

    points.forEach((point) => {
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `map-stop-marker${point.id === activeId ? ' is-active' : ''}`;
      element.style.setProperty('--marker-color', point.color || '#176b91');
      element.textContent = String(point.number ?? '•');
      element.setAttribute('aria-label', point.title || t.trip.mapTitle);
      element.title = point.title || '';
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        callbacksRef.current.onSelect?.(point.id);
      });
      markersRef.current.push(new Marker({ element, anchor: 'center' }).setLngLat([point.lng, point.lat]).addTo(map));
    });

    const bounds = new LngLatBounds();
    let count = 0;
    [...points, ...(start ? [start] : [])].forEach((point) => {
      if (Number.isFinite(point.lat) && Number.isFinite(point.lng)) {
        bounds.extend([point.lng, point.lat]);
        count += 1;
      }
    });
    if (count > 1) map.fitBounds(bounds, { padding: 54, maxZoom: 13, duration: 450 });
    else if (count === 1) map.flyTo({ center: bounds.getCenter(), zoom: 13, duration: 450 });
  }, [points, start, activeId, loaded, t]);

  useEffect(() => {
    const source = mapRef.current?.getSource('route-line');
    if (source) {
      source.setData(routeGeometry
        ? { type: 'Feature', properties: {}, geometry: routeGeometry }
        : EMPTY_ROUTE);
    }
  }, [routeGeometry, loaded]);

  return (
    <div aria-busy={!loaded && !failed} className={`relative isolate overflow-hidden rounded-[var(--radius-card)] border border-garis bg-primary-50 ${onPick ? 'cursor-crosshair' : ''} ${className}`}>
      <div ref={containerRef} className="absolute inset-0" aria-label={t.trip.mapTitle} />
      {!loaded && !failed && <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-tinta shadow-card" role="status"><span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />{t.map.loading}</div>}
      {failed && <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 px-3 py-2 text-xs text-tinta shadow-card" role="status">{t.map.unavailable}</div>}
      {onPick && <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-tinta shadow-card">{t.plan.pinHint}</div>}
    </div>
  );
}
