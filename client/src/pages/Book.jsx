import { Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import { useAuth } from '../context/AuthContext';

export default function Book() {
  const { user } = useAuth();

  return (
    <div className="container page">
      <div className="section-label">Book a truck</div>
      <h1 style={{ color: 'var(--navy)', fontSize: 38, letterSpacing: '-1px', margin: '8px 0' }}>
        Book your truck in minutes
      </h1>
      <p className="section-sub" style={{ marginBottom: 32 }}>
        Choose a truck, set your route, and get a firm, transparent quote — VAT included.
        {!user && <span> You'll need an account to confirm, so <Link to="/register" style={{ color: 'var(--orange-dark)', fontWeight: 700 }}>sign up</Link> first.</span>}
      </p>

      <div className="card card-pad" style={{ maxWidth: 760 }}>
        <BookingForm />
      </div>

      <div className="mt-4">
        <h3 style={{ color: 'var(--navy)' }}>Why book with BridgeTech?</h3>
        <div className="grid-3 mt-2">
          <div className="card card-pad">
            <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>Verified & insured</h4>
            <p className="small muted" style={{ margin: 0 }}>Every driver is code-10/14 licensed, roadworthy and haulage-insured.</p>
          </div>
          <div className="card card-pad">
            <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>Live tracking</h4>
            <p className="small muted" style={{ margin: 0 }}>Follow your load across the country with real-time updates.</p>
          </div>
          <div className="card card-pad">
            <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>Pay securely</h4>
            <p className="small muted" style={{ margin: 0 }}>Pay by card, EFT or invoice after delivery — no hidden fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
