import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await register(form);
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
          <h2>Create your account</h2>
          <p>Ship smarter with BridgeTech Logistics.</p>
          <form onSubmit={submit} className="form">
            <div className="field-row">
              <div className="field">
                <label>Full name</label>
                <input value={form.name} onChange={update('name')} placeholder="Jane Smith" required />
              </div>
              <div className="field">
                <label>Company (optional)</label>
                <input value={form.company} onChange={update('company')} placeholder="My Business (Pty) Ltd" />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={update('email')} placeholder="you@company.co.za" required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={update('phone')} placeholder="+27 82 000 0000" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={update('password')} placeholder="At least 6 characters" required />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <div className="small muted text-center" style={{ marginTop: 18 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--orange-dark)', fontWeight: 700 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
