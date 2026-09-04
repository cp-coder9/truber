import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <span className="brand-logo">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 15h10l3-6H7z" fill="#0b2545" />
      <circle cx="6" cy="17" r="2" fill="#0b2545" />
      <circle cx="16" cy="17" r="2" fill="#0b2545" />
      <path d="M18 9h3l1 3v3h-4V9z" fill="#0b2545" />
    </svg>
  </span>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <Logo />
          BridgeTech&nbsp;Logistics
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end>
            Home
          </NavLink>
          <NavLink to="/book" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Book a Truck
          </NavLink>
          {user ? (
            <>
              <NavLink to="/trips" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                My Trips
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Profile
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <div className="flex">
                <span className="avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                <span className="bold" style={{ color: '#fff' }}>{user.name}</span>
              </div>
              <button className="btn btn-ghost nav-link" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm nav-cta">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
