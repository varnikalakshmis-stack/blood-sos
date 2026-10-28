import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, BLOOD_GROUPS } from '../api.js';
import SosCard from '../components/SosCard.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function SosBoard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ bloodGroup: '', locality: '' });
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.sosList({ status: 'open', ...filters })
      .then((d) => { setItems(d.requests); setError(''); })
      .catch((e) => setError(e.message));
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    const poll = setInterval(load, 15000); // live-ish board: refresh every 15s
    return () => { clearTimeout(t); clearInterval(poll); };
  }, [load]);

  const respond = async (id) => { try { await api.sosRespond(id); load(); } catch (e) { setError(e.message); } };
  const setStatus = async (id, s) => { try { await api.sosStatus(id, s); load(); } catch (e) { setError(e.message); } };
  const del = async (id) => { try { await api.sosDelete(id); load(); } catch (e) { setError(e.message); } };

  return (
    <>
      <div className="row-between">
        <h1>🚨 SOS Board</h1>
        <Link to={user ? '/sos/new' : '/login'} className="btn btn-sos">+ Raise SOS</Link>
      </div>
      <div className="card filters">
        <label>Blood group
          <select value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}>
            <option value="">All</option>
            {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label>Locality
          <input placeholder="e.g. Velachery" value={filters.locality} onChange={(e) => setFilters({ ...filters, locality: e.target.value })} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && <p className="muted center">No open SOS requests match. 🎉</p>}
      <div className="grid">
        {items.map((s) => (
          <SosCard key={s._id} sos={s} user={user} onRespond={respond} onStatus={setStatus} onDelete={del} />
        ))}
      </div>
    </>
  );
}
