import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmt } from '../api';
import Badge from '../components/Badge';

const STATUSES = ['', 'pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled'];

export default function Bookings() {
  const [bookings, setBookings] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/bookings').then((d) => setBookings(d.bookings)).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const filtered = (bookings || []).filter((b) => {
    const matchStatus = !status || b.status === status;
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      (b.reference || '').toLowerCase().includes(s) ||
      (b.customerName || '').toLowerCase().includes(s) ||
      (b.pickupAddress || '').toLowerCase().includes(s) ||
      (b.dropoffAddress || '').toLowerCase().includes(s) ||
      (b.truckType || '').toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-sub">{bookings ? `${bookings.length} total bookings` : 'Loading…'}</p>
        </div>
      </div>

      {error && <div className="card card-pad mb-2"><div className="form-error">{error}</div></div>}

      <div className="filter-bar">
        <div className="search-box grow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search reference, customer, route or vehicle…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace('_', ' ').toUpperCase() : 'All statuses'}</option>)}
        </select>
      </div>

      {!bookings && !error ? <div className="loading"><span className="spinner" /> Loading bookings…</div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref</th><th>Customer</th><th>Route</th><th>Vehicle</th><th>Weight</th><th>Amount</th><th>Status</th><th>Payment</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td><Link to={`/bookings/${b.id}`} className="bold" style={{ color: 'var(--navy)' }}>{b.reference}</Link></td>
                    <td>
                      <div className="bold">{b.customerName}</div>
                      <div className="tiny muted">{b.company || ''}</div>
                    </td>
                    <td className="small muted">{b.pickupAddress} → {b.dropoffAddress}</td>
                    <td className="small">{b.truckType}</td>
                    <td className="small">{b.weight}t</td>
                    <td className="bold">{fmt.rand(b.estimatedPrice)}</td>
                    <td><Badge status={b.status} /></td>
                    <td><Badge status={b.paymentStatus} /></td>
                    <td><Link to={`/bookings/${b.id}`} className="btn btn-outline btn-sm">Manage</Link></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="9" className="empty-state">No bookings match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
