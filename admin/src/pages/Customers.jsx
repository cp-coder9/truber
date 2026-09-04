import { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import Badge from '../components/Badge';

export default function Customers() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [custBookings, setCustBookings] = useState([]);

  const load = () => api.get('/customers').then((d) => setCustomers(d.customers)).catch((e) => setError(e.message));
  useEffect(load, []);

  const view = async (c) => {
    setSelected(c);
    try {
      const d = await api.get(`/customers/${c.id}/bookings`);
      setCustBookings(d.bookings);
    } catch {
      setCustBookings([]);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-sub">{customers ? `${customers.length} companies / individuals` : 'Loading…'}</p>
        </div>
      </div>

      {error && <div className="card card-pad mb-2"><div className="form-error">{error}</div></div>}

      {!customers ? <div className="loading"><span className="spinner" /> Loading customers…</div> : (
        <div className="grid-2">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Company</th><th>Contact</th><th>Bookings</th><th>Spend</th><th></th></tr></thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="bold" style={{ color: 'var(--navy)' }}>{c.name}</td>
                      <td className="small">{c.company || '—'}</td>
                      <td className="small">{c.email}<div className="tiny muted">{c.phone}</div></td>
                      <td className="small">{c.bookingCount}</td>
                      <td className="bold">{fmt.rand(c.totalSpend)}</td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => view(c)}>View</button></td>
                    </tr>
                  ))}
                  {customers.length === 0 && <tr><td colSpan="6" className="empty-state">No customers yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card card-pad">
            {!selected ? (
              <div className="empty-state">Select a customer to view their bookings.</div>
            ) : (
              <>
                <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>{selected.name}</h3>
                <div className="small muted">{selected.company || 'Individual'} • {selected.email} • {selected.phone}</div>
                <div className="small muted">Member since {fmt.dateShort(selected.createdAt)}</div>
                <div className="flex wrap mt-2" style={{ gap: 18 }}>
                  <div><div className="small muted">Total bookings</div><div className="bold">{selected.bookingCount}</div></div>
                  <div><div className="small muted">Total spend</div><div className="bold">{fmt.rand(selected.totalSpend)}</div></div>
                  <div><div className="small muted">Active now</div><div className="bold">{selected.activeBookings}</div></div>
                </div>
                <h4 style={{ color: 'var(--navy)', margin: '22px 0 0' }}>Bookings</h4>
                {custBookings.length === 0 ? (
                  <div className="small muted mt-2">No bookings to show.</div>
                ) : (
                  <div className="mt-2">
                    {custBookings.map((b) => (
                      <div key={b.id} className="flex between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                        <div>
                          <div className="bold small" style={{ color: 'var(--navy)' }}>{b.reference}</div>
                          <div className="tiny muted">{b.pickupAddress} → {b.dropoffAddress}</div>
                        </div>
                        <div className="text-right">
                          <div className="bold">{fmt.rand(b.estimatedPrice)}</div>
                          <div className="flex" style={{ justifyContent: 'flex-end', marginTop: 4 }}><Badge status={b.status} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
