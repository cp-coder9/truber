import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/trips');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="card auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to book and track your trucks.</p>
          <form onSubmit={submit} className="form">
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.za" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div className="small muted text-center" style={{ marginTop: 18 }}>
            New to BridgeTech? <Link to="/register" style={{ color: 'var(--orange-dark)', fontWeight: 700 }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
