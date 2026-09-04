import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@bridgetech.co.za');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="logo" style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--orange)', display: 'grid', placeItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 15h10l3-6H7z" fill="#0b2545"/><circle cx="6" cy="17" r="2" fill="#0b2545"/><circle cx="16" cy="17" r="2" fill="#0b2545"/></svg>
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--navy)' }}>BridgeTech Admin</div>
            <div className="small muted">Operations Console</div>
          </div>
        </div>

        <form onSubmit={submit} className="form" style={{ marginTop: 22 }}>
          <div className="field">
            <label>Admin email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" required />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in to console'}
          </button>
        </form>

        <div className="tiny muted" style={{ marginTop: 16, lineHeight: 1.7 }}>
          Demo admin: <b style={{ color: 'var(--navy)' }}>admin@bridgetech.co.za</b> / <b style={{ color: 'var(--navy)' }}>Admin@123</b>
        </div>
      </div>
    </div>
  );
}
