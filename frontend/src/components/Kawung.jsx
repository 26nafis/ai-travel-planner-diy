/** Motif kawung (empat kelopak) dipakai sebagai penanda halte dan pola latar. */
export function KawungMark({ color = '#0194F3', size = 28, children, className = '' }) {
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }} aria-hidden={!children}>
      <svg viewBox="0 0 32 32" width={size} height={size} className="absolute inset-0">
        <g fill={color}>
          <ellipse cx="16" cy="8.5" rx="5" ry="7.5" />
          <ellipse cx="16" cy="23.5" rx="5" ry="7.5" />
          <ellipse cx="8.5" cy="16" rx="7.5" ry="5" />
          <ellipse cx="23.5" cy="16" rx="7.5" ry="5" />
        </g>
        <circle cx="16" cy="16" r="6.5" fill={color} />
      </svg>
      {children != null && <span className="relative text-[11px] font-bold leading-none text-white">{children}</span>}
    </span>
  );
}

export function KawungPattern({ id = 'kawung', color = '#0194F3', opacity = 0.18, className = '' }) {
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1.2" opacity={opacity}>
            <ellipse cx="22" cy="11" rx="6" ry="10" />
            <ellipse cx="22" cy="33" rx="6" ry="10" />
            <ellipse cx="11" cy="22" rx="10" ry="6" />
            <ellipse cx="33" cy="22" rx="10" ry="6" />
            <circle cx="22" cy="22" r="1.6" fill={color} />
            <circle cx="0" cy="0" r="1.6" fill={color} />
            <circle cx="44" cy="0" r="1.6" fill={color} />
            <circle cx="0" cy="44" r="1.6" fill={color} />
            <circle cx="44" cy="44" r="1.6" fill={color} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Penanda halte bernomor: lingkaran polos dengan cincin putih, gaya situs travel. */
export function StopMarker({ color = '#0194F3', size = 30, children, className = '' }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-bold text-white ring-4 ring-white shadow-card ${className}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}>
      {children}
    </span>
  );
}
