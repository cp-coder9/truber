import { useEffect, useState } from 'react';
import { api } from '../api';

/** Autocomplete input backed by the offline SA places endpoint. */
export default function PlacePicker({ label, value, onChange, placeholder = 'Search a South African city…', icon }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const d = await api.get(`/places?q=${encodeURIComponent(query)}`);
        setResults(d.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const select = (r) => {
    onChange(r);
    setQuery(r.name);
    setOpen(false);
    setResults([]);
  };

  return (
    <div className="field" style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        value={value ? (value.name || query) : query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange({ name: e.target.value });
        }}
        onFocus={() => query.trim() && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        placeholder={placeholder}
      />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', zIndex: 30, top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 10, boxShadow: '0 12px 28px rgba(11,37,69,.18)', marginTop: 6, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {results.map((r) => (
            <div
              key={r.lat + '-' + r.lng}
              onMouseDown={() => select(r)}
              style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              <span className="bold">{r.name}</span>
              <span className="muted small">{r.province}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
