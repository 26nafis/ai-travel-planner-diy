import { useEffect, useMemo, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { DIY_BOUNDS } from '../data/destinations.js';
import { useLang } from '../i18n/LanguageContext.jsx';


const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

/**
 * points: [{ id, lat, lng, number, color, title, day }]
 * start:  { lat, lng, label } | null
 * onPick: (latLng) => void   — aktifkan mode pilih titik
 */
export default function TripMap(props) {
  return GMAPS_KEY ? <GoogleTripMap {...props} /> : <SchematicMap {...props} />;
}

/* ---------- Google Maps JavaScript API ---------- */
function FitBounds({ points, start }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google) return;
    const all = [...points, ...(start ? [start] : [])];
    if (!all.length) return;
    const b = new window.google.maps.LatLngBounds();
    all.forEach((p) => b.extend({ lat: p.lat, lng: p.lng }));
    if (all.length === 1) { map.setCenter(all[0]); map.setZoom(13); } else map.fitBounds(b, 48);
  }, [map, points, start]);
  return null;
}

function GoogleTripMap({ points = [], start, activeId, onSelect, onPick, className = '' }) {
  const { t, lang } = useLang();
  return (
    <div className={`overflow-hidden rounded-xl border border-garis ${className}`}>
      <APIProvider apiKey={GMAPS_KEY} language={lang}>
        <Map mapId={MAP_ID} defaultCenter={{ lat: -7.86, lng: 110.40 }} defaultZoom={10} gestureHandling="cooperative"
          disableDefaultUI clickableIcons={false} style={{ width: '100%', height: '100%' }}
          onClick={(e) => onPick && e.detail.latLng && onPick({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng })}>
          <FitBounds points={points} start={start} />
          {start && (
            <AdvancedMarker position={start} title={t.map.start}>
              <span className="grid h-5 w-5 place-items-center rounded-full border-[3px] border-white bg-tinta shadow" />
            </AdvancedMarker>
          )}
          {points.map((p) => (
            <AdvancedMarker key={p.id} position={p} title={p.title} onClick={() => onSelect?.(p.id)} zIndex={p.id === activeId ? 10 : 1}>
              <span className={`grid place-items-center rounded-full border-2 border-white text-xs font-bold text-white shadow ${p.id === activeId ? 'h-9 w-9' : 'h-7 w-7'}`} style={{ background: p.color }}>
                {p.number}
              </span>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}

/* ---------- Peta skematis (tanpa kunci API) ---------- */
// Garis batas DIY yang sangat disederhanakan, hanya untuk orientasi.
const OUTLINE = [
  [-7.54, 110.44], [-7.60, 110.50], [-7.74, 110.55], [-7.80, 110.65], [-7.86, 110.76], [-7.95, 110.84],
  [-8.13, 110.84], [-8.21, 110.74], [-8.20, 110.60], [-8.12, 110.45], [-8.03, 110.33], [-7.97, 110.20],
  [-7.90, 110.05], [-7.80, 110.01], [-7.66, 110.12], [-7.69, 110.25], [-7.60, 110.35],
];
const W = 760, H = 680;
const project = ({ lat, lng }) => ({
  x: ((lng - DIY_BOUNDS.west) / (DIY_BOUNDS.east - DIY_BOUNDS.west)) * W,
  y: ((DIY_BOUNDS.north - lat) / (DIY_BOUNDS.north - DIY_BOUNDS.south)) * H,
});
const unproject = ({ x, y }) => ({
  lng: DIY_BOUNDS.west + (x / W) * (DIY_BOUNDS.east - DIY_BOUNDS.west),
  lat: DIY_BOUNDS.north - (y / H) * (DIY_BOUNDS.north - DIY_BOUNDS.south),
});

function SchematicMap({ points = [], start, activeId, onSelect, onPick, className = '' }) {
  const { t } = useLang();
  const svgRef = useRef(null);
  const outline = useMemo(() => OUTLINE.map(([lat, lng]) => { const p = project({ lat, lng }); return `${p.x},${p.y}`; }).join(' '), []);

  // garis putus-putus per hari, mengikuti urutan kunjungan
  const dayLines = useMemo(() => {
    const byDay = {};
    points.forEach((p) => { (byDay[p.day] ||= []).push(p); });
    return Object.values(byDay).map((ps) => ({ color: ps[0].color, d: ps.map((p, i) => { const q = project(p); return `${i ? 'L' : 'M'}${q.x},${q.y}`; }).join(' ') }));
  }, [points]);

  const handleClick = (e) => {
    if (!onPick) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    onPick(unproject(loc));
  };

  // Perbesar ke area titik-titik yang tampil; mode pilih titik tetap memperlihatkan seluruh DIY.
  const viewBox = useMemo(() => {
    const all = [...points, ...(start ? [start] : [])].map(project);
    if (onPick || all.length < 2) return `0 0 ${W} ${H}`;
    let x0 = Math.min(...all.map((p) => p.x)), x1 = Math.max(...all.map((p) => p.x));
    let y0 = Math.min(...all.map((p) => p.y)), y1 = Math.max(...all.map((p) => p.y));
    const minSpan = 220, pad = 70;
    if (x1 - x0 < minSpan) { const c = (x0 + x1) / 2; x0 = c - minSpan / 2; x1 = c + minSpan / 2; }
    if (y1 - y0 < minSpan) { const c = (y0 + y1) / 2; y0 = c - minSpan / 2; y1 = c + minSpan / 2; }
    return `${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`;
  }, [points, start, onPick]);
  const [, , vbW, vbH] = viewBox.split(' ').map(Number);
  const scale = (Math.max(vbW, vbH) / W) * 1.5; // ukuran penanda mengikuti zoom

  const s = start ? project(start) : null;
  return (
    <figure className={`relative overflow-hidden rounded-xl border border-garis bg-[#D6ECFB] ${className}`}>
      <svg ref={svgRef} viewBox={viewBox} className={`h-full w-full ${onPick ? 'cursor-crosshair' : ''}`}
        preserveAspectRatio="xMidYMid meet" onClick={handleClick} role="img" aria-label={t.trip.mapTitle}>
        <polygon points={outline} fill="#FFFFFF" stroke="#B9D9F0" strokeWidth={2 * scale} strokeLinejoin="round" />
        <text x={W / 2} y={H - 18} textAnchor="middle" fill="#8A97A3" fontSize="15" fontStyle="italic">Samudra Hindia</text>
        <text x={project({ lat: -7.555, lng: 110.445 }).x + 14} y={project({ lat: -7.555, lng: 110.445 }).y + 4} fill="#8A97A3" fontSize={14 * scale}>Merapi</text>
        {dayLines.map((l, i) => <path key={i} d={l.d} fill="none" stroke={l.color} strokeWidth={2 * scale} strokeDasharray={`${5 * scale} ${6 * scale}`} opacity="0.55" />)}
        {s && (
          <g>
            <circle cx={s.x} cy={s.y} r={11 * scale} fill="#03121A" stroke="#fff" strokeWidth={4 * scale} />
            <text x={s.x + 16 * scale} y={s.y + 5 * scale} fontSize={14 * scale} fontWeight="700" fill="#03121A" paintOrder="stroke" stroke="#F7F8F4" strokeWidth={4 * scale}>{start.label || t.map.start}</text>
          </g>
        )}
        {points.map((p) => {
          const q = project(p);
          const active = p.id === activeId;
          return (
            <g key={p.id} transform={`translate(${q.x},${q.y}) scale(${scale})`} className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSelect?.(p.id); }} tabIndex={onSelect ? 0 : -1}
              onKeyDown={(e) => e.key === 'Enter' && onSelect?.(p.id)} aria-label={`${p.number}. ${p.title}`}>
              <circle r={active ? 17 : 13} fill={p.color} stroke="#fff" strokeWidth="3" />
              <text y="4.5" textAnchor="middle" fontSize={active ? 14 : 12} fontWeight="700" fill="#fff">{p.number}</text>
              {active && <text x="22" y="5" fontSize="15" fontWeight="700" fill="#1A1D26" paintOrder="stroke" stroke="#F7F8F4" strokeWidth="4">{p.title}</text>}
            </g>
          );
        })}
      </svg>
      <figcaption className="absolute bottom-2 left-3 right-3 text-[11px] text-abu">{t.map.schematic}</figcaption>
    </figure>
  );
}
