import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

const EMPTY = { name: '', phone: '', email: '', licenseNumber: '', licenseType: 'Code 14', status: 'available', rating: 5, yearsExperience: 5, location: '' };
const LICENSE = ['Code 8', 'Code 10', 'Code 14'];
const STATUSES = ['available', 'on_trip', 'off'];

export default function Drivers() {
  const [drivers, setDrivers] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };
  const load = () => api.get('/drivers').then((d) => setDrivers(d.drivers)).catch((e) => setError(e.message));
  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY); setModal({ edit: false }); };
  const openEdit = (d) => { setForm(d); setModal({ edit: true }); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal.edit) {
        await api.put(`/drivers/${form.id}`, form);
        notify('Driver updated');
      } else {
        await api.post('/drivers', form);
        notify('Driver added');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (d) => {
    if (!confirm(`Remove driver ${d.name}?`)) return;
    try {
      await api.del(`/drivers/${d.id}`);
      notify('Driver removed');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const count = (s) => drivers ? drivers.filter((d) => d.status === s).length : 0;

  return (
    <>
      {toast && <div className="toast success">{toast}</div>}
      <div className="page-header">
        <div>
          <h1 className="page-title">Drivers</h1>
          <p className="page-sub">{drivers ? `${drivers.length} drivers • ${count('available')} available` : 'Loading…'}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add driver</button>
      </div>

      {error && <div className="card card-pad mb-2"><div className="form-error">{error}</div></div>}

      {!drivers ? <div className="loading"><span className="spinner" /> Loading drivers…</div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Contact</th><th>License</th><th>Experience</th><th>Rating</th><th>Location</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td className="bold" style={{ color: 'var(--navy)' }}>{d.name}</td>
                    <td className="small">{d.phone}<div className="tiny muted">{d.email}</div></td>
                    <td className="small">{d.licenseNumber}<div className="tiny muted">{d.licenseType}</div></td>
                    <td className="small">{d.yearsExperience} yrs</td>
                    <td className="bold">★ {d.rating}</td>
                    <td className="small muted">{d.location}</td>
                    <td><Badge status={d.status} /></td>
                    <td>
                      <div className="flex" style={{ gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(d)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 && <tr><td colSpan="8" className="empty-state">No drivers registered yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.edit ? 'Edit driver' : 'Add driver'}</h3>
            <form onSubmit={submit} className="form">
              <div className="field"><label>Full name</label><input value={form.name} onChange={update('name')} required /></div>
              <div className="field-row">
                <div className="field"><label>Phone</label><input value={form.phone} onChange={update('phone')} required /></div>
                <div className="field"><label>Email</label><input type="email" value={form.email} onChange={update('email')} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>License number</label><input value={form.licenseNumber} onChange={update('licenseNumber')} required /></div>
                <div className="field"><label>License type</label><select value={form.licenseType} onChange={update('licenseType')}>{LICENSE.map((l) => <option key={l}>{l}</option>)}</select></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Years experience</label><input type="number" value={form.yearsExperience} onChange={update('yearsExperience')} /></div>
                <div className="field"><label>Rating (0-5)</label><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={update('rating')} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Status</label><select value={form.status} onChange={update('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
                <div className="field"><label>Location</label><input value={form.location} onChange={update('location')} /></div>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn btn-primary">{modal.edit ? 'Save changes' : 'Add driver'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
