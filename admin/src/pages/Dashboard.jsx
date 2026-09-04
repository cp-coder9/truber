import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmt } from '../api';
import Badge from '../components/Badge';

function Stat({ icon, bg, color, value, label }) {
  return (
    <div className="card stat-card">
      <div className="stat-ico" style={{ background: bg, color }}>{icon}</div>
      <div>
        <div className="v">{value}</div>
        <div className="l">{label}</div>
      </div>
    </div>
  );
}

const I = {
  revenue: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  bookings: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  fleet: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 7h13v8H1z"/><path d="M14 10h4l3 3v2h-7"/><circle cx="5" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>,
  drivers: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>,
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats').then((d) => {
      setStats(d);
      setError('');
    }).catch((e) => setError(e.message));
    api.get('/bookings').then((d) => setBookings(d.bookings.slice(0, 6))).catch(() => {});
  }, []);

  if (error && !stats) return <div className="card card-pad"><div className="form-error">{error}</div></div>;
  if (!stats) return <div className="loading"><span className="spinner" /> Loading dashboard…</div>;

  const { summary, months, byStatus } = stats;
  const maxMonth = Math.max(1, ...months.map((m) => m.amount));
  const active = summary.activeBookings;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">BridgeTech operations overview</p>
        </div>
        <Link to="/bookings" className="btn btn-primary">Manage bookings</Link>
      </div>

      <div className="grid-4">
        <Stat icon={I.revenue} bg="#fff7ed" color="#ea8c00" value={fmt.rand(summary.revenue)} label="Total revenue" />
        <Stat icon={I.bookings} bg="#eff6ff" color="#2563eb" value={summary.totalBookings} label="Total bookings" />
        <Stat icon={I.fleet} bg="#ecfdf5" color="#059669" value={summary.fleetSize} label="Fleet size" />
        <Stat icon={I.drivers} bg="#f5f3ff" color="#7c3aed" value={summary.drivers} label="Drivers" />
      </div>

      <div className="grid-2 mt-2">
        {/* Revenue chart */}
        <div className="card card-pad">
          <div className="flex between">
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>Revenue (6 months)</h3>
            <span className="tiny muted">{fmt.rand(summary.revenue)} total</span>
          </div>
          <div className="chart-bars mt-2">
            {months.map((m) => (
              <div className="chart-col" key={m.key}>
                <div className="chart-bar-val">{fmt.rand(m.amount)}</div>
                <div className="chart-bar" style={{ height: `${Math.max(4, (m.amount / maxMonth) * 160)}px` }} />
                <div className="chart-bar-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet availability */}
        <div className="card card-pad">
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>Fleet availability</h3>
          <div className="progress-donut mt-2">
            <div className="donut" style={{ background: 'conic-gradient(var(--steel) 0deg, var(--steel) ' + (stats.fleetAvailable / summary.fleetSize) * 360 + 'deg, #e2e8f0 ' + (stats.fleetAvailable / summary.fleetSize) * 360 + 'deg)' }}>
              <span style={{ background: '#fff', width: 88, height: 88, borderRadius: '50%', position: 'absolute', display: 'grid', placeItems: 'center', margin: 'auto' }}>
                {Math.round((stats.fleetAvailable / summary.fleetSize) * 100)}%
              </span>
            </div>
            <div>
              <div className="bold" style={{ color: 'var(--navy)' }}>{stats.fleetAvailable} of {summary.fleetSize} trucks available</div>
              <div className="small muted">{stats.driversAvailable} of {summary.drivers} drivers ready</div>
              <div className="small muted mt-0" style={{ marginTop: 6 }}>{active} active bookings now</div>
            </div>
          </div>

          <h4 className="small bold" style={{ color: 'var(--navy)', margin: '22px 0 10px' }}>Booking status breakdown</h4>
          <div className="flex wrap" style={{ gap: 8 }}>
            {Object.entries(byStatus).map(([k, v]) => (
              <span key={k} className="flex"><Badge status={k} /> <span className="bold">{v}</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card mt-2" style={{ overflow: 'hidden' }}>
        <div className="card-pad flex between" style={{ paddingBottom: 0 }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>Recent bookings</h3>
          <Link to="/bookings" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr><th>Ref</th><th>Customer</th><th>Route</th><th>Vehicle</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><Link to={`/bookings/${b.id}`} className="bold" style={{ color: 'var(--navy)' }}>{b.reference}</Link></td>
                  <td>{b.customerName}</td>
                  <td className="small muted">{b.pickupAddress} → {b.dropoffAddress}</td>
                  <td className="small">{b.truckType}</td>
                  <td className="bold">{fmt.rand(b.estimatedPrice)}</td>
                  <td><div className="flex" style={{ gap: 6 }}><Badge status={b.status} /><Badge status={b.paymentStatus} /></div></td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="6" className="empty-state">No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
