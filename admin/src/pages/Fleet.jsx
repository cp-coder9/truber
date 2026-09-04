import { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import Badge from '../components/Badge';

const EMPTY = {
  plate: '', make: '', model: '', type: 'Flatbed', capacityTons: 10, lengthMeters: 14,
  ratePerKm: 95, tonRate: 18, year: 2020, fuelType: 'Diesel', status: 'available', location: '',
};

const TYPES = ['Bakkie / 1-ton', 'Box Truck', 'Flatbed', 'Fridge', 'Tanker', 'Lowbed', 'Side Tipper', 'Super Link'];
const STATUSES = ['available', 'on_trip', 'maintenance', 'off'];

export default function Fleet() {
  const [trucks, setTrucks] = useState(null);
  const [modal, setModal] = useState(null); // null | {edit:bool, data}
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };
  const load = () => api.get('/trucks').then((d) => setTrucks(d.trucks)).catch((e) => setError(e.message));
  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY); setModal({ edit: false }); };
  const openEdit = (t) => { setForm(t); setModal({ edit: true }); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal.edit) {
        await api.put(`/trucks/${form.id}`, form);
        notify('Truck updated');
      } else {
        await api.post('/trucks', form);
        notify('Truck added to fleet');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (t) => {
    if (!confirm(`Delete truck ${t.plate}?`)) return;
    try {
      await api.del(`/trucks/${t.id}`);
      notify('Truck removed');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const count = (s) => trucks ? trucks.filter((t) => t.status === s).length : 0;

  return (
    <>
      {toast && <div className="toast success">{toast}</div>}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet management</h1>
          <p className="page-sub">{trucks ? `${trucks.length} vehicles • ${count('available')} available • ${count('on_trip')} on trip • ${count('maintenance')} in maintenance` : 'Loading…'}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add truck</button>
      </div>

      {error && <div className="card card-pad mb-2"><div className="form-error">{error}</div></div>}

      {!trucks ? <div className="loading"><span className="spinner" /> Loading fleet…</div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Plate</th><th>Vehicle</th><th>Type</th><th>Capacity</th><th>Rate/km</th><th>Year</th><th>Location</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {trucks.map((t) => (
                  <tr key={t.id}>
                    <td className="bold" style={{ color: 'var(--navy)' }}>{t.plate}</td>
                    <td>{t.make} {t.model}</td>
                    <td className="small">{t.type}</td>
                    <td className="small">{t.capacityTons}t / {t.lengthMeters}m</td>
                    <td className="bold">{fmt.rand(t.ratePerKm)}</td>
                    <td className="small">{t.year}</td>
                    <td className="small muted">{t.location}</td>
                    <td><Badge status={t.status} /></td>
                    <td>
                      <div className="flex" style={{ gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {trucks.length === 0 && <tr><td colSpan="9" className="empty-state">No trucks in the fleet yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.edit ? 'Edit truck' : 'Add truck to fleet'}</h3>
            <form onSubmit={submit} className="form">
              <div className="field-row">
                <div className="field"><label>Registration plate</label><input value={form.plate} onChange={update('plate')} required /></div>
                <div className="field"><label>Year</label><input type="number" value={form.year} onChange={update('year')} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Make</label><input value={form.make} onChange={update('make')} required /></div>
                <div className="field"><label>Model</label><input value={form.model} onChange={update('model')} required /></div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Type</label>
                  <select value={form.type} onChange={update('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                </div>
                <div className="field"><label>Fuel</label><select value={form.fuelType} onChange={update('fuelType')}><option>Diesel</option><option>Petrol</option></select></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Capacity (tonnes)</label><input type="number" value={form.capacityTons} onChange={update('capacityTons')} /></div>
                <div className="field"><label>Length (m)</label><input type="number" value={form.lengthMeters} onChange={update('lengthMeters')} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Rate /km (R)</label><input type="number" value={form.ratePerKm} onChange={update('ratePerKm')} /></div>
                <div className="field"><label>Rate /tonne (R)</label><input type="number" value={form.tonRate} onChange={update('tonRate')} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Status</label><select value={form.status} onChange={update('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
                <div className="field"><label>Location</label><input value={form.location} onChange={update('location')} /></div>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn btn-primary">{modal.edit ? 'Save changes' : 'Add truck'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
