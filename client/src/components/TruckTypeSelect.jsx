import { useEffect, useState } from 'react';
import { api } from '../api';

const EMOJI = {
  'Bakkie / 1-ton': '🚙',
  'Box Truck': '🚚',
  Flatbed: '🛻',
  Fridge: '❄️',
  Tanker: '⛽',
  Lowbed: '🏗️',
  'Side Tipper': '🚛',
  'Super Link': '🚛',
};

export default function TruckTypeSelect({ value, onChange }) {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    api
      .get('/trucks/types')
      .then((d) => setTypes(d.types || []))
      .catch(() => {});
  }, []);

  return (
    <div className="field">
      <label>Truck type</label>
      <div className="pill-row">
        {types.map((t) => (
          <button
            type="button"
            key={t}
            className={'pill' + (value === t ? ' selected' : '')}
            onClick={() => onChange(t)}
          >
            {EMOJI[t] || '🚚'} {t}
          </button>
        ))}
      </div>
    </div>
  );
}
