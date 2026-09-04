import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, fmt } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function Trips() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api
      .get('/bookings')
      .then((d) => setTrips(d.bookings))
      .catch((err) => setError(err.message));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container page">
      <div className="flex between wrap">
        <div>
          <div className="section-label">My bookings</div>
          <h1 style={{ color: 'var(--navy)', fontSize: 38, letterSpacing: '-1px', margin: '8px 0' }}>Your trips</h1>
        </div>
        <Link to="/book" className="btn btn-primary">+ Book a truck</Link>
      </div>

      {error && <div className="alert info mt-2">{error}</div>}

      {!trips && !error && <div className="loading"><span className="spinner" /> Loading trips…</div>}

      {trips && trips.length === 0 && (
        <div className="card card-pad text-center mt-4" style={{ padding: 48 }}>
          <h3 style={{ color: 'var(--navy)' }}>No trips yet</h3>
          <p className="muted">Book your first truck to get started.</p>
          <Link to="/book" className="btn btn-dark btn-lg mt-2">Book a truck</Link>
        </div>
      )}

      {trips && trips.length > 0 && (
        <div className="mt-2">
          {trips.map((t) => (
            <Link to={`/trips/${t.id}`} key={t.id} className="list-item" style={{ display: 'flex', textDecoration: 'none' }}>
              <div className="grow">
                <div className="flex between wrap">
                  <span className="bold" style={{ color: 'var(--navy)', fontSize: 16 }}>{t.reference}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="small muted mt-0" style={{ marginTop: 6 }}>
                  {t.pickupAddress} → {t.dropoffAddress}
                </div>
                <div className="flex wrap" style={{ marginTop: 6, gap: 14 }}>
                  <span className="small muted">{t.truckType} • {t.weight}t</span>
                  <span className="small muted">≈ {t.distanceKm} km</span>
                  <span className="small muted">{fmt.dateShort(t.createdAt)}</span>
                </div>
              </div>
              <div className="text-center" style={{ minWidth: 120 }}>
                <div className="bold" style={{ color: 'var(--navy)', fontSize: 18 }}>{fmt.rand(t.estimatedPrice)}</div>
                <div className="small muted">{t.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
