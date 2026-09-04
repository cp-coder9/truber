import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmt } from '../api';
import Badge from '../components/Badge';
import LiveTrackMap from '../components/LiveTrackMap';
import InvoiceModal from '../components/InvoiceModal';

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  const load = () => {
    api.get(`/bookings/${id}`).then((d) => setBooking(d.booking)).catch((e) => setError(e.message));
    api.get('/trucks/available').then((d) => setTrucks(d.trucks)).catch(() => {});
    api.get('/drivers/available').then((d) => setDrivers(d.drivers)).catch(() => {});
  };
  useEffect(load, [id]);

  const assign = async (e) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.target);
    try {
      const truckId = form.get('truckId');
      const driverId = form.get('driverId');
      await api.patch(`/bookings/${id}/assign`, { truckId: truckId || undefined, driverId: driverId || undefined });
      notify('Truck/driver assigned');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status) => {
    setBusy(true);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      notify(`Status set to ${status.replace('_', ' ')}`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel this booking? A cancellation handling fee will be charged per policy.')) return;
    setBusy(true);
    try {
      const d = await api.post(`/bookings/${id}/cancel`, {});
      notify(`Cancelled — fee R${d.cancellationFee}`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !booking) return <div className="card card-pad"><div className="form-error">{error}</div></div>;
  if (!booking) return <div className="loading"><span className="spinner" /> Loading booking…</div>;

  const canProgress = !['delivered', 'completed', 'cancelled'].includes(booking.status);

  return (
    <>
      {toast && <div className="toast success">{toast}</div>}
      <div className="page-header">
        <div>
          <Link to="/bookings" className="small muted">← Back to bookings</Link>
          <h1 className="page-title">{booking.reference}</h1>
          <p className="page-sub">Created {fmt.date(booking.createdAt)} • Customer: {booking.customerName} ({booking.company || booking.customerId})</p>
        </div>
        <div className="flex">
          <Badge status={booking.status} />
          <Badge status={booking.paymentStatus} />
        </div>
      </div>

      {error && <div className="card card-pad mb-2"><div className="form-error">{error}</div></div>}

      <div className="grid-2" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div>
          {/* Route */}
          <div className="card card-pad">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>Route</h3>
            <div className="flex" style={{ gap: 16 }}>
              <div className="grow">
                <div className="small muted">Pickup</div>
                <div className="bold">{booking.pickupAddress}</div>
              </div>
              <div style={{ color: 'var(--orange)', fontWeight: 800 }}>→</div>
              <div className="grow">
                <div className="small muted">Drop-off</div>
                <div className="bold">{booking.dropoffAddress}</div>
              </div>
            </div>
            <div className="flex wrap mt-2" style={{ gap: 22 }}>
              <div><div className="small muted">Distance</div><div className="bold">{booking.distanceKm} km</div></div>
              <div><div className="small muted">Load weight</div><div className="bold">{booking.weight} t</div></div>
              <div><div className="small muted">Cargo</div><div className="bold">{booking.cargoDescription || '—'}</div></div>
              <div><div className="small muted">Scheduled</div><div className="bold">{fmt.date(booking.scheduledAt)}</div></div>
            </div>
          </div>

          {/* Live tracking map */}
          {booking.pickupLat && booking.dropoffLat && (
            <div className="card card-pad mt-2">
              <div className="flex between mb-2">
                <h3 style={{ color: 'var(--navy)', marginTop: 0, marginBottom: 0 }}>Live tracking</h3>
                <span className="tiny muted">Truck position on route</span>
              </div>
              <LiveTrackMap
                pickup={{ lat: booking.pickupLat, lng: booking.pickupLng }}
                dropoff={{ lat: booking.dropoffLat, lng: booking.dropoffLng }}
                status={booking.status}
                truckLabel={booking.truck ? `${booking.truck.plate} · ${booking.truck.type}` : null}
                driverName={booking.driver ? booking.driver.name : null}
              />
            </div>
          )}

          {/* Assign */}
          <div className="card card-pad mt-2">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>Dispatch / assignment</h3>
            <form onSubmit={assign} className="form">
              <div className="field-row">
                <div className="field">
                  <label>Assign truck</label>
                  <select name="truckId" defaultValue={booking.truckId || ''}>
                    <option value="">— Select a truck —</option>
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>{t.plate} — {t.make} {t.model} ({t.type})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Assign driver</label>
                  <select name="driverId" defaultValue={booking.driverId || ''}>
                    <option value="">— Select a driver —</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.licenseType})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn btn-dark" disabled={busy}>Assign vehicle & driver</button>
            </form>
            {(booking.truck || booking.driver) && (
              <div className="flex wrap mt-2" style={{ gap: 18 }}>
                {booking.truck && <div><div className="small muted">Assigned truck</div><div className="bold">{booking.truck.plate} — {booking.truck.make} {booking.truck.model}</div></div>}
                {booking.driver && <div><div className="small muted">Assigned driver</div><div className="bold">{booking.driver.name} ★{booking.driver.rating}</div></div>}
              </div>
            )}
          </div>

          {/* Status controls */}
          <div className="card card-pad mt-2">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>Advance status</h3>
            <div className="flex wrap" style={{ gap: 10 }}>
              {canProgress && (
                <>
                  <button className="btn btn-dark" disabled={busy || booking.status === 'confirmed'} onClick={() => setStatus('confirmed')}>Confirm</button>
                  <button className="btn btn-dark" disabled={busy || booking.status === 'in_transit'} onClick={() => setStatus('in_transit')}>Mark in transit</button>
                  <button className="btn btn-dark" disabled={busy || booking.status === 'delivered'} onClick={() => setStatus('delivered')}>Mark delivered</button>
                  <button className="btn btn-primary" disabled={busy || booking.status === 'completed'} onClick={() => setStatus('completed')}>Complete job</button>
                  {!['completed', 'delivered', 'cancelled'].includes(booking.status) && (
                    <button className="btn btn-danger" disabled={busy} onClick={cancel}>Cancel booking</button>
                  )}
                </>
              )}
            </div>
            <p className="small muted mt-2">Flow: Confirm → In transit → Delivered → Completed. Completing finalises the booking and settles payment. Cancellations incur a handling fee.</p>
          </div>

          {/* Timeline */}
          <div className="card card-pad mt-2">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>History</h3>
            <div className="timeline" style={{ borderLeft: '2px solid var(--line)', paddingLeft: 20 }}>
              {(booking.timeline || []).slice().reverse().map((t, i) => (
                <div key={i} style={{ position: 'relative', padding: '0 0 16px' }}>
                  <span style={{ position: 'absolute', left: -26, top: 4, width: 12, height: 12, borderRadius: '50%', background: 'var(--steel)', border: '2px solid #fff' }} />
                  <div className="bold" style={{ textTransform: 'capitalize', color: 'var(--navy)' }}>{t.status}</div>
                  <div className="small muted">{t.note}</div>
                  <div className="tiny muted">{fmt.date(t.at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary column */}
        <div>
          <div className="card card-pad">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>Cost summary</h3>
            <div className="price-box" style={{ background: 'var(--navy)' }}>
              <h3 style={{ color: '#c8d4e4', marginTop: 0 }}>Est. total</h3>
              <div style={{ fontSize: 38, fontWeight: 900, color: '#fff' }}>{fmt.rand(booking.estimatedPrice)}</div>
              <div className="small" style={{ color: '#c8d4e4' }}>VAT inclusive</div>
            </div>
            <div className="flex between mt-2">
              <span className="small muted">Distance</span>
              <span className="bold">{booking.distanceKm} km</span>
            </div>
            <div className="flex between">
              <span className="small muted">Vehicle</span>
              <span className="bold">{booking.truckType}</span>
            </div>
            <div className="flex between">
              <span className="small muted">Payment</span>
              <span className="bold">{booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</span>
            </div>
            <div className="flex between">
              <span className="small muted">Method</span>
              <span className="bold">{booking.paymentMethod ? booking.paymentMethod.toUpperCase() : '—'}</span>
            </div>
            <div className="flex between">
              <span className="small muted">Scheduled</span>
              <span className="bold">{booking.scheduled ? 'Yes' : 'Immediate'}</span>
            </div>
            {booking.status === 'cancelled' && (
              <>
                <div className="flex between"><span className="small muted">Cancellation fee</span><span className="bold" style={{ color: 'var(--danger)' }}>{fmt.rand(booking.cancellationFee || 0)}</span></div>
                {booking.refundAmount > 0 && <div className="flex between"><span className="small muted">Refunded</span><span className="bold" style={{ color: 'var(--success)' }}>{fmt.rand(booking.refundAmount)}</span></div>}
              </>
            )}
          </div>

          <div className="card card-pad mt-2">
            <div className="small muted" style={{ marginBottom: 8 }}>Customer</div>
            <div className="bold">{booking.customerName}</div>
            <div className="small muted">{booking.company}</div>
          </div>

          <div className="card card-pad mt-2">
            <button className="btn btn-dark btn-block" onClick={() => setShowInvoice(true)}>
              🧾 View {booking.paymentStatus === 'paid' ? 'Receipt' : 'Invoice'}
            </button>
            <p className="small muted" style={{ marginBottom: 0, marginTop: 8 }}>
              Generate a printable tax invoice or receipt.
            </p>
          </div>
        </div>
      </div>

      {showInvoice && <InvoiceModal bookingId={booking.id} onClose={() => setShowInvoice(false)} />}
    </>
  );
}
