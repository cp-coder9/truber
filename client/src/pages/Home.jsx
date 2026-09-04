import { Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

const STATS = [
  { value: '1.2k+', label: 'Trucks on the network' },
  { value: '9', label: 'Provinces covered' },
  { value: '98%', label: 'On-time delivery' },
  { value: '24/7', label: 'Support & dispatch' },
];

const STEPS = [
  { n: 1, title: 'Tell us your route', text: 'Choose a truck type and enter your pickup and drop-off locations.' },
  { n: 2, title: 'Get an instant quote', text: 'Our pricing engine calculates the cost in seconds — VAT included.' },
  { n: 3, title: 'We match a truck', text: 'A verified driver and the right rig are assigned and confirmed.' },
  { n: 4, title: 'Track & pay', text: 'Follow your load live and pay securely on delivery.' },
];

const FLEET = [
  { emoji: '🚛', name: 'Super Link', meta: '32t • 22m • long-distance hauling', rate: 'from R160/km' },
  { emoji: '🛻', name: 'Flatbed', meta: '12t • 14m • steel & machinery', rate: 'from R95/km' },
  { emoji: '❄️', name: 'Refrigerated', meta: '14t • temp-controlled cargo', rate: 'from R110/km' },
  { emoji: '🏗️', name: 'Lowbed', meta: '28t • plant & heavy equipment', rate: 'from R150/km' },
  { emoji: '⛽', name: 'Tanker', meta: '20t • fuel & liquid freight', rate: 'from R130/km' },
  { emoji: '🚚', name: 'Box Truck', meta: '8t • parcel & pallet freight', rate: 'from R72/km' },
  { emoji: '🚙', name: '1-ton Bakkie', meta: '1t • small urgent loads', rate: 'from R38/km' },
];

function TrustIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="section-label">South Africa's truck-hiring platform</div>
            <h1>Hire a truck in <span>minutes</span>, not days.</h1>
            <p>
              The Uber of trucking. Book a verified truck and professional driver for
              any load — anywhere in South Africa — with instant pricing and live tracking.
            </p>
            <div className="flex wrap">
              <Link to="/book" className="btn btn-primary btn-lg">Book a truck</Link>
              <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                Create account
              </Link>
            </div>
            <div className="hero-badges">
              <span className="hero-badge"><TrustIcon /> Verified drivers</span>
              <span className="hero-badge"><TrustIcon /> Transparent pricing</span>
              <span className="hero-badge"><TrustIcon /> Nationwide coverage</span>
              <span className="hero-badge"><TrustIcon /> Secure payments</span>
            </div>
          </div>

          <div>
            <div className="trip-card">
              <h3 className="mt-0" style={{ color: 'var(--navy)' }}>Book your truck</h3>
              <p className="small muted" style={{ marginTop: 0 }}>Get an instant quote in under 30 seconds.</p>
              <BookingForm compact />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="grid-4">
            {STATS.map((s) => (
              <div className="card stat" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <p className="section-label text-center">How it works</p>
          <h2 className="section-title text-center">Four easy steps to move your cargo</h2>
          <div className="steps mt-4">
            {STEPS.map((s) => (
              <div className="card step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section className="section">
        <div className="container">
          <p className="section-label">Our fleet</p>
          <h2 className="section-title">A truck for every load</h2>
          <p className="section-sub">
            From a single pallet to a 32-ton inter-provincial haul, we've got the right vehicle for the job.
          </p>
          <div className="truck-grid mt-4">
            {FLEET.map((t) => (
              <div className="card truck-card" key={t.name}>
                <div className="truck-emoji">{t.emoji}</div>
                <div className="truck-name">{t.name}</div>
                <div className="truck-meta">{t.meta}</div>
                <div className="truck-rate">
                  <span className="small muted">Rate</span>
                  <b>{t.rate}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ padding: '40px 0 72px' }}>
        <div className="container">
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-2))', border: 'none', padding: '48px', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: 30, margin: '0 0 10px' }}>Ready to move your cargo?</h2>
            <p style={{ color: '#c8d4e4', fontSize: 18, margin: '0 auto 24px', maxWidth: 520 }}>
              Join hundreds of South African businesses shipping smarter with BridgeTech.
            </p>
            <Link to="/book" className="btn btn-primary btn-lg">Get an instant quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
