import { useEffect, useState } from 'react';
import { api } from '../api';

const fmt = {
  rand: (n) => 'R' + Number(n).toLocaleString('en-ZA', { maximumFractionDigits: 0 }),
  date: (iso) => new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
};

function Stars({ rating }) {
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>{'★'.repeat(Math.round(rating))}<span style={{ opacity: 0.35 }}>{'★'.repeat(5 - Math.round(rating))}</span></span>
  );
}

export default function DriverProfileModal({ driverId, onClose }) {
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/drivers/${driverId}/profile`).then((d) => setP(d.profile)).catch((e) => setError(e.message));
  }, [driverId]);

  if (error) {
    return (
      <div className="bottom-sheet" onClick={onClose}>
        <div className="bottom-sheet-card" onClick={(e) => e.stopPropagation()}>
          <div className="form-error">{error}</div>
          <button className="btn btn-outline btn-block" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="bottom-sheet" onClick={onClose}>
        <div className="bottom-sheet-card" onClick={(e) => e.stopPropagation()}>
          <div className="loading"><span className="spinner" /> Loading profile…</div>
        </div>
      </div>
    );
  }

  const maxStars = Math.max(1, ...(p.ratingBreakdown || []).map((r) => r.count));

  return (
    <div className="bottom-sheet" onClick={onClose}>
      <div className="bottom-sheet-card sheet-driver" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose}>✕</button>

        <div className="driver-hero">
          <div className="driver-avatar-lg" style={{ background: p.avatarColor }}>
            {p.name.charAt(0).toUpperCase()}
          </div>
          <div className="grow">
            <h3 className="mt-0">{p.name}</h3>
            <div className="small muted">{p.licenseType} licensed • {p.yearsExperience} yrs experience</div>
            <div className="flex" style={{ gap: 8, marginTop: 6 }}>
              <span className="driver-rating-chip"><Stars rating={p.rating} /> <b>{p.rating}</b></span>
              <span className="small muted">{p.ratingCount} trips rated</span>
            </div>
          </div>
        </div>

        {p.truck && (
          <div className="driver-truck-box">
            <span className="truck-emoji-sm">🚛</span>
            <div>
              <div className="bold">{p.truck.make} {p.truck.model}</div>
              <div className="small muted">{p.truck.plate} • {p.truck.type}</div>
            </div>
          </div>
        )}

        <div className="driver-stats">
          <div><div className="driver-stat-num">{p.completedTrips}</div><div className="small muted">Completed trips</div></div>
          <div><div className="driver-stat-num">{p.ratingCount}</div><div className="small muted">Total ratings</div></div>
          <div><div className="driver-stat-num">{(p.rating || 0).toFixed(1)}</div><div className="small muted">Avg rating</div></div>
        </div>

        <h4 className="mt-2" style={{ color: 'var(--navy)' }}>Rating breakdown</h4>
        <div className="rating-bars">
          {(p.ratingBreakdown || []).map((r) => (
            <div className="rating-row" key={r.stars}>
              <span className="rating-star-label">{r.stars} ★</span>
              <div className="rating-track"><div className="rating-fill" style={{ width: `${(r.count / maxStars) * 100}%` }} /></div>
              <span className="rating-count">{r.count}</span>
            </div>
          ))}
        </div>

        {(p.reviews || []).length > 0 && (
          <>
            <h4 className="mt-2" style={{ color: 'var(--navy)' }}>Recent reviews</h4>
            <div className="review-list">
              {p.reviews.map((r, i) => (
                <div className="review-card" key={i}>
                  <div className="flex between">
                    <div><span className="bold">{r.from}</span> <span className="small muted">· {r.company}</span></div>
                    <span className="small" style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="small muted mt-0" style={{ margin: '6px 0 0' }}>{r.text}</p>
                  <div className="tiny muted">{fmt.date(r.date)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="sheet-actions">
          <a className="btn btn-dark btn-block" href={`tel:${p.phone}`}>📞 Call driver</a>
        </div>
      </div>
    </div>
  );
}
