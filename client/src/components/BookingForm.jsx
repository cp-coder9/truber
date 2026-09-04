import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlacePicker from './PlacePicker';
import TruckTypeSelect from './TruckTypeSelect';
import { api, fmt } from '../api';

const PAY_METHODS = [
  { id: 'card', label: 'Card', emoji: '💳', hint: 'Visa / Mastercard' },
  { id: 'eft', label: 'EFT', emoji: '🏦', hint: 'Instant EFT' },
  { id: 'voucher', label: 'Voucher', emoji: '🎟️', hint: 'Trade voucher' },
];

function pad(n) { return String(n).padStart(2, '0'); }
function toInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromInput(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function BookingForm({ compact = false }) {
  const navigate = useNavigate();
  const [truckType, setTruckType] = useState('');
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [weight, setWeight] = useState(5);
  const [cargo, setCargo] = useState('');
  const [mode, setMode] = useState('now'); // 'now' | 'later'
  const [scheduleAt, setScheduleAt] = useState(() => toInput(new Date(Date.now() + 2 * 3600000)));
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // confirmed booking

  const canQuote = truckType && pickup?.lat !== undefined && dropoff?.lat !== undefined;

  const selectedSchedule = mode === 'later' ? fromInput(scheduleAt) : new Date();

  const getQuote = async (e) => {
    e?.preventDefault();
    setError('');
    if (!canQuote) {
      setError('Please choose a truck type and select pickup + dropoff locations.');
      return;
    }
    setLoading(true);
    try {
      const d = await api.post('/quotes', {
        truckType,
        weight: Number(weight),
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
      });
      setQuote(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmAndPay = async () => {
    if (!quote) return;
    setError('');
    setLoading(true);
    try {
      const scheduled = selectedSchedule;
      if (mode === 'later' && scheduled && scheduled.getTime() <= Date.now()) {
        setError('Scheduled pick-up time must be in the future.');
        setLoading(false);
        return;
      }
      const d = await api.post('/bookings', {
        truckType,
        weight: Number(weight),
        cargoDescription: cargo,
        pickupAddress: `${pickup.name}, ${pickup.province}, South Africa`,
        dropoffAddress: `${dropoff.name}, ${dropoff.province}, South Africa`,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        scheduledAt: scheduled ? scheduled.toISOString() : undefined,
        paymentMethod,
        distanceKm: quote.distanceKm,
      });
      setSuccess(d.booking);
    } catch (err) {
      if (err.status === 401) {
        navigate('/login', { state: { from: '/book' } });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="booking-success">
        <div className="success-check">✓</div>
        <h3 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>Booking confirmed!</h3>
        <p className="muted small" style={{ margin: '0 0 4px' }}>
          {success.reference} • {success.truckType} • {success.scheduled ? 'Scheduled' : 'Arriving now'}
        </p>
        <p className="muted small" style={{ margin: '0 0 18px' }}>
          Paid {fmt.rand(success.estimatedPrice)} by {success.paymentMethod?.toUpperCase()} — driver on the way. 🚚
        </p>
        <div className="flex" style={{ justifyContent: 'center', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => navigate(`/trips/${success.id}`)}>
            Track this trip
          </button>
          <button className="btn btn-outline" onClick={() => { setSuccess(null); reset(); }}>Book another</button>
        </div>
      </div>
    );
  }

  function reset() {
    setQuote(null);
    setCargo('');
    setTruckType('');
    setPickup(null);
    setDropoff(null);
  }

  return (
    <form onSubmit={getQuote} className="form">
      <TruckTypeSelect value={truckType} onChange={setTruckType} />

      <div className="field-row">
        <PlacePicker label="Pickup location" value={pickup} onChange={setPickup} placeholder="e.g. Johannesburg" />
        <PlacePicker label="Drop-off location" value={dropoff} onChange={setDropoff} placeholder="e.g. Durban" />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Load weight (tonnes)</label>
          <input type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="field">
          <label>Cargo description (optional)</label>
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="e.g. Building materials" />
        </div>
      </div>

      {/* Scheduling mode */}
      <div className="field">
        <label>When do you need it?</label>
        <div className="mode-tabs">
          <button type="button" className={'mode-tab ' + (mode === 'now' ? 'active' : '')} onClick={() => setMode('now')}>
            <span className="mode-icon">⚡</span> Now
          </button>
          <button type="button" className={'mode-tab ' + (mode === 'later' ? 'active' : '')} onClick={() => setMode('later')}>
            <span className="mode-icon">📅</span> Schedule
          </button>
        </div>
        {mode === 'later' && (
          <div className="field-row" style={{ marginTop: 10 }}>
            <div className="field">
              <label>Pick-up date & time</label>
              <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
            </div>
            <div className="field">
              <label>Schedule</label>
              <input
                value={selectedSchedule ? selectedSchedule.toLocaleString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                readOnly
                placeholder="Select a time"
              />
            </div>
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="flex">
        <button className="btn btn-dark btn-lg grow" type="submit" disabled={loading}>
          {loading ? 'Calculating…' : 'Get instant quote'}
        </button>
      </div>

      {quote && (
        <div className="price-box">
          <div className="flex between">
            <h3 style={{ margin: 0, color: '#c8d4e4' }}>Estimated trip cost</h3>
            {mode === 'later' ? <span className="badge confirmed">Scheduled</span> : <span className="badge available">Now</span>}
          </div>
          <div className="price-value">{fmt.rand(quote.price)}</div>
          <div className="small">≈ {Math.round(quote.distanceKm)} km • VAT included</div>

          {/* Immediate payment */}
          <div className="field" style={{ marginTop: 16 }}>
            <label style={{ color: '#c8d4e4' }}>Pay now to confirm</label>
            <div className="pay-methods">
              {PAY_METHODS.map((m) => (
                <button type="button" key={m.id} className={'pay-method' + (paymentMethod === m.id ? ' selected' : '')} onClick={() => setPaymentMethod(m.id)}>
                  <span className="pm-emoji">{m.emoji}</span>
                  <span className="pm-label">{m.label}</span>
                  <span className="tiny muted">{m.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="price-break">
            <div className="price-break-row"><span>Distance ({quote.breakdown.perKm}/km)</span><span>{fmt.rand(quote.breakdown.distanceCharge)}</span></div>
            <div className="price-break-row"><span>Load ({fmt.rand(quote.breakdown.perTon)}/tonne)</span><span>{fmt.rand(quote.breakdown.loadCharge)}</span></div>
            <div className="price-break-row"><span>Base fee</span><span>{fmt.rand(quote.breakdown.baseFee)}</span></div>
            <div className="price-break-row"><span>VAT (15%)</span><span>{fmt.rand(quote.tax)}</span></div>
          </div>

          <button type="button" className="btn btn-primary btn-lg btn-block mt-2" onClick={confirmAndPay} disabled={loading}>
            {loading ? 'Processing payment…' : `Confirm & pay ${fmt.rand(quote.price)}`}
          </button>
          <p className="tiny" style={{ color: '#a9bad1', margin: '10px 0 0', textAlign: 'center' }}>
            Secure payment • Charged immediately on booking • Free cancellation before dispatch
          </p>
        </div>
      )}
    </form>
  );
}
