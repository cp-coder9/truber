import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MobileNav() {
  const { user } = useAuth();

  const items = [
    { to: '/', label: 'Home', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21V12h6v9"/></svg>, end: true },
    { to: '/book', label: 'Book', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 7h13v8H1z"/><path d="M14 10h4l3 3v2h-7"/><circle cx="5" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg> },
    ...(user ? [{ to: '/trips', label: 'Trips', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> }, { to: '/profile', label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg> }] : [{ to: '/login', label: 'Sign in', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg> }]),
  ];

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => 'mobile-nav-item' + (isActive ? ' active' : '')}>
            <span className="mn-ico">{it.icon}</span>
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
