import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const I = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21V12h6v9"/></svg>,
  bookings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  fleet: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 7h13v8H1z"/><path d="M14 10h4l3 3v2h-7"/><circle cx="5" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>,
  drivers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>,
  customers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>,
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', icon: I.home, end: true },
    { to: '/bookings', label: 'Bookings', icon: I.bookings },
    { to: '/fleet', label: 'Fleet', icon: I.fleet },
    { to: '/drivers', label: 'Drivers', icon: I.drivers },
    { to: '/customers', label: 'Customers', icon: I.customers },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 15h10l3-6H7z" fill="#0b2545"/><circle cx="6" cy="17" r="2" fill="#0b2545"/><circle cx="16" cy="17" r="2" fill="#0b2545"/></svg>
          </span>
          <div>
            BridgeTech
            <div className="tiny" style={{ fontWeight: 500, color: '#8fa0ba' }}>Admin Console</div>
          </div>
        </div>

        <nav className="side-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="side-user">
            <span className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</span>
            <div style={{ lineHeight: 1.2 }}>
              <div className="bold" style={{ color: '#fff', fontSize: 14 }}>{user?.name}</div>
              <div className="tiny" style={{ color: '#8fa0ba' }}>{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: '#c8d4e4', width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
