import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, fmt } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LiveTrackMap from '../components/LiveTrackMap';
import InvoiceModal from '../components/InvoiceModal';
import DriverProfileModal from '../components/DriverProfileModal';

const TIMELINE_ORDER = ['requested', 'confirmed', 'in_transit', 'delivered', 'completed', 'paid', 'cancelled'];

export default function TripDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDriver, setShowDriver] = useState(false);

  const load = () => {
    api.get(`/bookings/${id}`).then((d) => setTrip(d.booking)).catch((e) => setError(e.message));
  };
  useEffect(load, [id]);
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  const cancel = async () => {
    const sure = window.confirm(
      'Cancel this trip?\n\nA cancellation handling fee may apply. Fees are waived before dispatch and escalate closer to departure. This cannot be undone.'
    );
    if (!sure) return;
    setBusy(true);
    try {
      const d = await api.post(`/bookings/${id}/cancel`, {});
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pay = async (method = 'card') => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/pay`, { method });
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  const currentIdx = (() => {
    const joined = trip ? [...trip.timeline.map((x) => x.status)] : [];
    for (let i = TIMELINE_ORDER.length - 1; i >= 0; i--) {
      if (joined.includes(TIMELINE_ORDER[i])) return TIMELINE_ORDER[i];
    }
    return null;
  })();

  if (!trip && !error) return <div className="loading"><span className="spinner" /> Loading trip…</div>;
  if (error) return <div className="container page"><div className="alert info">{error} <Link to="/trips">Back to trips</Link></div></div>;

  return (
    <div className="container page">
      <div className="flex between wrap">
        <div>
          <Link to="/trips" className="small muted">← Back to trips</Link>
          <h1 style={{ color: 'var(--navy)', fontSize: 34, letterSpacing: '-1px', margin: '6px 0' }}>{trip.reference}</h1>
        </div>
        <div className="flex">
          <StatusBadge status={trip.status} />
          <StatusBadge status={trip.paymentStatus} />
        </div>
      </div>

      <div className="grid-2 mt-2" style={{ gridTemplateColumns: '1.4fr 0.9fr' }}>
        {/* Route + details */}
        <div>
          <div className="card card-pad">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>Route</h3>
            <div className="flex" style={{ gap: 16 }}>
              <div className="grow">
                <div className="small muted">Pickup</div>
                <div className="bold">{trip.pickupAddress}</div>
              </div>
              <div style={{ color: 'var(--orange)' }}>→</div>
              <div className="grow">
                <div className="small muted">Drop-off</div>
                <div className="bold">{trip.dropoffAddress}</div>
              </div>
            </div>
            <div className="flex wrap mt-2" style={{ gap: 20 }}>
              <span className="small muted">Distance: <b className="bold" style={{ color: 'var(--navy)' }}>{trip.distanceKm} km</b></span>
              <span className="small muted">Load: <b className="bold" style={{ color: 'var(--navy)' }}>{trip.weight} t</b></span>
              <span className="small muted">Vehicle: <b className="bold" style={{ color: 'var(--navy)' }}>{trip.truckType}</b></span>
              <span className="small muted">Pick-up: <b className="bold" style={{ color: 'var(--navy)' }}>{trip.scheduled ? fmt.date(trip.scheduledAt) : 'Immediate'}</b></span>
            </div>
          </div>

          {/* Live tracking map */}
          {(trip.pickupLat && trip.dropoffLat) && (
            <div className="card card-pad mt-2">
              <div className="flex between mb-2">
                <h3 style={{ color: 'var(--navy)', marginTop: 0, marginBottom: 0 }}>Live tracking</h3>
                <span className="small muted">Update every few seconds</span>
              </div>
              <LiveTrackMap
                pickup={{ lat: trip.pickupLat, lng: trip.pickupLng }}
                dropoff={{ lat: trip.dropoffLat, lng: trip.dropoffLng }}
                status={trip.status}
                truckLabel={trip.truck ? `${trip.truck.plate} · ${trip.truck.type}` : null}
                driverName={trip.driver ? trip.driver.name : null}
              />
            </div>
          )}

          <div className="card card-pad mt-2">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>Assigned vehicle & driver</h3>
            {trip.truck || trip.driver ? (
              <div className="flex wrap" style={{ gap: 24 }}>
                <div>
                  <div className="small muted">Truck</div>
                  {trip.truck ? (
                    <div className="bold">{trip.truck.plate} — {trip.truck.make} {trip.truck.model}</div>
                  ) : (
                    <div className="muted">Awaiting assignment</div>
                  )}
                </div>
                <div>
                  <div className="small muted">Driver</div>
                  {trip.driver ? (
                    <button className="btn btn-ghost btn-sm" style={{ padding: 0, color: 'var(--navy)' }} onClick={() => setShowDriver(true)}>
                      <span className="driver-chip">
                        <span className="avatar" style={{ width: 26, height: 26, fontSize: 13, background: 'var(--steel)', marginRight: 6 }}>{trip.driver.name.charAt(0)}</span>
                        <span className="bold">{trip.driver.name}</span>
                        <span className="muted small">★ {trip.driver.rating}</span>
                        <span className="tiny" style={{ color: 'var(--orange-dark)' }}>View profile</span>
                      </span>
                    </button>
                  ) : (
                    <div className="muted">Awaiting assignment</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="alert info">This trip is awaiting a truck assignment. Our dispatch team will confirm shortly.</div>
            )}
          </div>

          {/* Timeline */}
          <div className="card card-pad mt-2">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>Trip status</h3>
            <div className="timeline">
              {(trip.timeline || []).map((t, i) => (
                <div key={i} className={'tl-item ' + (t.status === currentIdx ? 'active' : 'done')}>
                  <div className="tl-title" style={{ textTransform: 'capitalize' }}>{t.status}</div>
                  <div className="tl-note">{t.note}</div>
                  <div className="tl-time">{fmt.date(t.at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary + actions */}
        <div>
          <div className="price-box">
            <h3>Estimated cost</h3>
            <div className="price-value">{fmt.rand(trip.estimatedPrice)}</div>
            <div className="small">GST/VAT inclusive</div>
            <div className="price-break">
              <div className="price-break-row"><span>Status</span><span>{trip.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</span></div>
              <div className="price-break-row"><span>Method</span><span>{trip.paymentMethod ? trip.paymentMethod.toUpperCase() : '—'}</span></div>
            </div>
          </div>

          <div className="card card-pad mt-2" style={{ textAlign: 'center' }}>
            <button className="btn btn-dark btn-block" onClick={() => setShowInvoice(true)}>
              🧾 View {trip.paymentStatus === 'paid' ? 'Receipt' : 'Invoice'}
            </button>
            <p className="small muted" style={{ marginBottom: 0, marginTop: 8 }}>
              Download a signed tax invoice or receipt for your records.
            </p>
          </div>

          {trip.paymentStatus !== 'paid' && !['cancelled', 'completed', 'delivered'].includes(trip.status) && (
            <div className="card card-pad mt-2">
              <h4 style={{ color: 'var(--navy)', margin: '0 0 12px' }}>Make payment</h4>
              <div className="flex wrap">
                <button className="btn btn-dark btn-sm" disabled={busy} onClick={() => pay('card')}>Pay by card</button>
                <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => pay('eft')}>Pay by EFT</button>
              </div>
              <p className="small muted" style={{ marginBottom: 0, marginTop: 10 }}>Demo payment — no real money moves.</p>
            </div>
          )}

          {!['cancelled', 'completed', 'delivered'].includes(trip.status) && (
            <div className="card card-pad mt-2">
              <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>Need to cancel?</h4>
              <p className="small muted" style={{ margin: '0 0 12px' }}>
                A cancellation handling fee may apply. The fee is waived before dispatch and
                escalates the closer you are to departure.
              </p>
              <button
                className="btn btn-outline btn-block"
                disabled={busy}
                onClick={cancel}
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
              >
                Cancel this trip
              </button>
            </div>
          )}

          {trip.status === 'cancelled' && (
            <div className="card card-pad mt-2">
              <h4 style={{ color: 'var(--danger)', margin: '0 0 8px' }}>This trip was cancelled</h4>
              {trip.cancellationFee > 0 && (
                <>
                  <div className="flex between"><span className="small muted">Cancellation fee</span><span className="bold" style={{ color: 'var(--danger)' }}>{fmt.rand(trip.cancellationFee)}</span></div>
                  {trip.refundAmount > 0 && (
                    <div className="flex between"><span className="small muted">Refunded</span><span className="bold" style={{ color: 'var(--success)' }}>{fmt.rand(trip.refundAmount)}</span></div>
                  )}
                  <div className="small muted mt-2">The remainder of your payment was refunded to your original method.</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showInvoice && <InvoiceModal bookingId={trip.id} onClose={() => setShowInvoice(false)} />}
      {showDriver && trip.driver && <DriverProfileModal driverId={trip.driver.id} onClose={() => setShowDriver(false)} />}
    </div>
  );
}
