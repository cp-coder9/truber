import { useEffect, useState } from 'react';

/** Offline SVG map of South Africa with an animated live truck marker. */

const WEST = 16.0;
const EAST = 33.5;
const NORTH = -21.5;
const SOUTH = -35.5;
const W = 760;
const H = 820;
const PAD = 28;

const project = (lat, lng) => ({
  x: PAD + ((lng - WEST) / (EAST - WEST)) * (W - 2 * PAD),
  y: PAD + ((NORTH - lat) / (NORTH - SOUTH)) * (H - 2 * PAD),
});

const REFS = [
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
  { name: 'Durban', lat: -29.8587, lng: 31.0218 },
  { name: 'Pretoria', lat: -25.7479, lng: 28.2293 },
  { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596 },
  { name: 'Gqeberha', lat: -33.9608, lng: 25.6022 },
].map((r) => ({ ...r, p: project(r.lat, r.lng) }));

function routePath(p1, p2) {
  const pull = 0.18;
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * pull * len;
  const cy = my + (dx / len) * pull * len;
  return { path: `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`, ctrl: { x: cx, y: cy } };
}

function bezierPoint(p0, c, p1, t) {
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const d = t * t;
  return { x: a * p0.x + b * c.x + d * p1.x, y: a * p0.y + b * c.y + d * p1.y };
}

export default function LiveTrackMap({ pickup, dropoff, status, truckLabel, driverName }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (status !== 'in_transit') return;
    const id = setInterval(() => setT((prev) => (prev >= 1 ? 0 : Math.min(1, prev + 0.004))), 80);
    return () => clearInterval(id);
  }, [status]);

  const p1 = pickup ? project(pickup.lat, pickup.lng) : null;
  const p2 = dropoff ? project(dropoff.lat, dropoff.lng) : null;
  if (!p1 || !p2) return null;

  const { path, ctrl } = routePath(p1, p2);
  let pos;
  if (status === 'in_transit') pos = bezierPoint(p1, ctrl, p2, t);
  else if (status === 'delivered' || status === 'completed') pos = p2;
  else pos = p1;

  const isLive = status === 'in_transit';
  const isDone = status === 'delivered' || status === 'completed';

  return (
    <div className="map-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="map-svg" role="img" aria-label="Live truck route map">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#e5ebf3" strokeWidth="1" />
          </pattern>
          <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a9d8f" />
            <stop offset="100%" stopColor="#ff9c1a" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={W} height={H} rx="16" fill="#f6f9fc" />
        <rect x="0" y="0" width={W} height={H} rx="16" fill="url(#grid)" />
        {REFS.map((r) => (
          <g key={r.name}>
            <circle cx={r.p.x} cy={r.p.y} r="4" fill="#c3cedd" />
            <text x={r.p.x + 7} y={r.p.y + 4} fontSize="12" fill="#8a97a8" fontWeight="600">{r.name}</text>
          </g>
        ))}
        <path d={path} fill="none" stroke="url(#route)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" opacity="0.85" />
        <g transform={`translate(${p1.x}, ${p1.y})`}>
          <circle r="9" fill="#2a9d8f" opacity="0.25"><animate attributeName="r" values="7;12" dur="1.6s" repeatCount="indefinite" /></circle>
          <circle r="7" fill="#2a9d8f" stroke="#fff" strokeWidth="2.5" />
          <text y="-16" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1f7a70">A</text>
        </g>
        <g transform={`translate(${p2.x}, ${p2.y})`}>
          <circle r="9" fill="#ff9c1a" opacity="0.25"><animate attributeName="r" values="7;12" dur="1.6s" repeatCount="indefinite" /></circle>
          <circle r="7" fill="#ff9c1a" stroke="#fff" strokeWidth="2.5" />
          <text y="-16" textAnchor="middle" fontSize="12" fontWeight="800" fill="#e8890a">B</text>
        </g>
        <g transform={`translate(${pos.x}, ${pos.y})`}>
          {isLive && (<circle r="16" fill="#ff9c1a" opacity="0.3"><animate attributeName="r" values="10;22" dur="1.4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.5;0" dur="1.4s" repeatCount="indefinite" /></circle>)}
          <circle r="8" fill={isDone ? '#16a34a' : isLive ? '#ff9c1a' : '#0b2545'} stroke="#fff" strokeWidth="2.5" />
          <text y="4" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="800">🚚</text>
        </g>
      </svg>
      <div className="map-legend">
        <span className={isLive ? 'map-live-dot' : `map-dot ${isDone ? 'done' : ''}`} />
        <div>
          <div className="map-legend-title">{isLive ? 'Live tracking — in transit' : isDone ? 'Delivery complete' : 'Awaiting departure'}</div>
          <div className="map-legend-sub">{truckLabel ? (isLive ? `${truckLabel} • ${driverName}` : truckLabel) : 'Driver en route'}</div>
        </div>
      </div>
    </div>
  );
}
