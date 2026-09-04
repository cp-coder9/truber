import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="brand-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 15h10l3-6H7z" fill="#0b2545" />
                  <circle cx="6" cy="17" r="2" fill="#0b2545" />
                  <circle cx="16" cy="17" r="2" fill="#0b2545" />
                </svg>
              </span>
              BridgeTech Logistics
            </h4>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
              Proudly South African. Connecting businesses with verified trucks and
              professional drivers across every province — the Uber of trucking.
            </p>
          </div>
          <div>
            <h4>Services</h4>
            <Link to="/book">Book a truck</Link>
            <Link to="/book">Instant quotes</Link>
            <Link to="/trips">Track my delivery</Link>
            <Link to="/register">Create an account</Link>
          </div>
          <div>
            <h4>Our Fleet</h4>
            <span style={{ display: 'block', fontSize: 14, padding: '5px 0' }}>Super Links</span>
            <span style={{ display: 'block', fontSize: 14, padding: '5px 0' }}>Side Tippers</span>
            <span style={{ display: 'block', fontSize: 14, padding: '5px 0' }}>Refrigerated</span>
            <span style={{ display: 'block', fontSize: 14, padding: '5px 0' }}>Lowbeds</span>
          </div>
          <div>
            <h4>Contact</h4>
            <span style={{ display: 'block', fontSize: 14, padding: '5px 0' }}>Cape Town, South Africa</span>
            <span style={{ display: 'block', fontSize: 14, padding: '5px 0' }}>support@bridgetech.co.za</span>
            <span style={{ display: 'block', fontSize: 14, padding: '5px 0' }}>+27 21 555 0100</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BridgeTech Logistics (Pty) Ltd. All rights reserved.</span>
          <span>VAT registered • SARS compliant • RTC & Roadworthy certified</span>
        </div>
      </div>
    </footer>
  );
}
