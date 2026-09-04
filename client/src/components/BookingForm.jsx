import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlacePicker from './PlacePicker';
import TruckTypeSelect from './TruckTypeSelect';
import { api, fmt } from '../api';

export default function BookingForm({ compact = false }) {
  const navigate = useNavigate();
  const [truckType, setTruckType] = useState('');
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [weight, setWeight] = useState(5);
  const [cargo, setCargo] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canQuote = truckType && pickup?.lat !== undefined && dropoff?.lat !== undefined;

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

  const book = async () => {
    if (!quote) return;
    try {
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
        distanceKm: quote.distanceKm,
      });
      navigate(`/trips/${d.booking.id}`);
    } catch (err) {
      if (err.status === 401) {
        // Prompt login before confirming a booking.
        navigate('/login', { state: { from: '/book' } });
      } else {
        setError(err.message);
      }
    }
  };

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

      {error && <div className="form-error">{error}</div>}

      <div className="flex">
        <button className="btn btn-dark btn-lg grow" type="submit" disabled={loading}>
          {loading ? 'Calculating…' : 'Get instant quote'}
        </button>
      </div>

      {quote && (
        <div className="price-box">
          <h3>Estimated trip cost</h3>
          <div className="price-value">{fmt.rand(quote.price)}</div>
          <div className="small">≈ {Math.round(quote.distanceKm)} km • VAT included</div>
          <div className="price-break">
            <div className="price-break-row"><span>Distance ({quote.breakdown.perKm}/km)</span><span>{fmt.rand(quote.breakdown.distanceCharge)}</span></div>
            <div className="price-break-row"><span>Load ({fmt.rand(quote.breakdown.perTon)}/tonne)</span><span>{fmt.rand(quote.breakdown.loadCharge)}</span></div>
            <div className="price-break-row"><span>Base fee</span><span>{fmt.rand(quote.breakdown.baseFee)}</span></div>
            <div className="price-break-row"><span>VAT (15%)</span><span>{fmt.rand(quote.tax)}</span></div>
          </div>
          <button type="button" className="btn btn-primary btn-lg btn-block mt-2" onClick={book}>
            Book this truck now
          </button>
        </div>
      )}
    </form>
  );
}
