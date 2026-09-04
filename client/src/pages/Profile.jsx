import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, fmt } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/customers/me').then((d) => setProfile(d.profile)).catch((e) => setError(e.message));
    api.get('/bookings').then((d) => setTrips(d.bookings)).catch(() => {});
  }, [user, navigate]);

  if (!user) return null;

  const avatar = user.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="container page">
      <div className="grid-2" style={{ gridTemplateColumns: '0.9fr 1.4fr' }}>
        {/* Identity card */}
        <div>
          <div className="card card-pad" style={{ textAlign: 'center' }}>
            <div className="driver-avatar-lg" style={{ background: 'var(--steel)', margin: '0 auto 12px' }}>{avatar}</div>
            <h2 style={{ color: 'var(--navy)', margin: '0 0 4px' }}>{user.name}</h2>
            <p className="muted small" style={{ margin: '0' }}>{user.company || 'Customer'}</p>
            <p className="muted small" style={{ margin: '6px 0 0' }}>{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
          </div>

          {profile && (
            <div className="card card-pad mt-2">
              <div className="small muted" style={{ marginBottom: 14 }}>Account summary</div>
              <div className="driver-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div><div className="driver-stat-num">{profile.bookingCount}</div><div className="small muted">Bookings</div></div>
                <div><div className="driver-stat-num">{fmt.rand(profile.totalSpend)}</div><div className="small muted">Total spent</div></div>
                <div><div className="driver-stat-num">{profile.activeBookings}</div><div className="small muted">Active now</div></div>
                <div><div className="driver-stat-num">{fmt.rand(profile.cancellationFeesPaid)}</div><div className="small muted">Cancel fees</div></div>
              </div>
              <button className="btn btn-outline btn-block mt-2" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
            </div>
          )}

          {profile && profile.byType && Object.keys(profile.byType).length > 0 && (
            <div className="card card-pad mt-2">
              <div className="small muted" style={{ marginBottom: 10 }}>Vehicle types used</div>
              <div className="flex wrap" style={{ gap: 8 }}>
                {Object.entries(profile.byType).map(([t, n]) => (
                  <span key={t} className="pill">{t} × {n}</span>
                ))}
              </div>
            </div>
          )}

          {error && <div className="form-error mt-2">{error}</div>}
        </div>

        {/* Trips */}
        <div>
          <div className="flex between wrap">
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>Your bookings</h3>
            <Link to="/book" className="btn btn-primary btn-sm">+ Book a truck</Link>
          </div>
          {!trips ? (
            <div className="loading"><span className="spinner" /> Loading trips…</div>
          ) : trips.length === 0 ? (
            <div className="card card-pad text-center mt-2"><p className="muted">No bookings yet.</p></div>
          ) : (
            <div className="mt-2">
              {trips.map((t) => (
                <Link to={`/trips/${t.id}`} key={t.id} className="list-item" style={{ display: 'flex', textDecoration: 'none' }}>
                  <div className="grow">
                    <div className="flex between wrap">
                      <span className="bold" style={{ color: 'var(--navy)' }}>{t.reference}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="small muted" style={{ marginTop: 4 }}>{t.pickupAddress} → {t.dropoffAddress}</div>
                    <div className="small muted" style={{ marginTop: 4 }}>
                      {t.truckType} • {t.weight}t • {t.scheduled ? fmt.date(t.scheduledAt) : 'Immediate'} • <b>{fmt.rand(t.estimatedPrice)}</b>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
