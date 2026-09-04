import { useEffect, useState } from 'react';
import { api } from '../api';

const fmtMoney = (n) => 'R' + Number(n).toLocaleString('en-ZA', { maximumFractionDigits: 0 });

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
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="form-error">{error}</div>
          <button className="btn btn-outline btn-block" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  if (!p) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading"><span className="spinner" /> Loading profile…</div>
        </div>
      </div>
    );
  }

  const maxStars = Math.max(1, ...(p.ratingBreakdown || []).map((r) => r.count));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button style={{ position: 'absolute', top: 16, right: 18, border: 'none', background: '#eef2f7', width: 32, height: 32, borderRadius: '50%' }} onClick={onClose}>✕</button>
        <div className="driver-hero">
          <div className="driver-avatar-lg" style={{ background: p.avatarColor }}>{p.name.charAt(0).toUpperCase()}</div>
          <div className="grow">
            <h3 className="mt-0" style={{ color: 'var(--navy)' }}>{p.name}</h3>
            <div className="small muted">{p.licenseType} licensed • {p.yearsExperience} yrs experience</div>
            <div className="flex" style={{ gap: 8, marginTop: 6 }}>
              <span className="driver-rating-chip"><Stars rating={p.rating} /> <b>{p.rating}</b></span>
              <span className="small muted">{p.ratingCount} ratings</span>
            </div>
          </div>
        </div>

        {p.truck && (
          <div className="driver-truck-box mt-2">
            <span style={{ fontSize: 24 }}>🚛</span>
            <div><div className="bold">{p.truck.make} {p.truck.model}</div><div className="small muted">{p.truck.plate} • {p.truck.type}</div></div>
          </div>
        )}

        <div className="driver-stats">
          <div><div className="driver-stat-num">{p.completedTrips}</div><div className="small muted">Completed</div></div>
          <div><div className="driver-stat-num">{p.ratingCount}</div><div className="small muted">Ratings</div></div>
          <div><div className="driver-stat-num">{p.rating.toFixed(1)}</div><div className="small muted">Avg</div></div>
        </div>

        <h4 style={{ color: 'var(--navy)', margin: '20px 0 10px' }}>Rating breakdown</h4>
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
            <h4 style={{ color: 'var(--navy)', margin: '20px 0 10px' }}>Recent reviews</h4>
            <div className="review-list">
              {p.reviews.map((r, i) => (
                <div className="review-card" key={i}>
                  <div className="flex between"><span><b>{r.from}</b> <span className="small muted">· {r.company}</span></span><span style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span></div>
                  <p className="small muted mt-0" style={{ margin: '6px 0 0' }}>{r.text}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
