import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, BLOOD_GROUPS } from '../api.js';
import DonorCard from '../components/DonorCard.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function Donors() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const [filters, setFilters] = useState({
    bloodGroup: sp.get('bloodGroup') || '',
    locality: '',
    compatible: false,
    showUnavailable: false,
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.donors({
        bloodGroup: filters.bloodGroup,
        locality: filters.locality,
        compatible: filters.compatible && filters.bloodGroup ? 'true' : '',
        available: filters.showUnavailable ? 'false' : 'true',
      })
        .then((d) => { setDonors(d.donors); setError(''); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <>
      <h1>Find a donor</h1>
      <div className="card filters">
        <label>Blood group needed
          <select value={filters.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)}>
            <option value="">Any</option>
            {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label>Locality / society
          <input placeholder="e.g. Anna Nagar" value={filters.locality} onChange={(e) => set('locality', e.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={filters.compatible} onChange={(e) => set('compatible', e.target.checked)} />
          Include compatible groups
        </label>
        <label className="check">
          <input type="checkbox" checked={filters.showUnavailable} onChange={(e) => set('showUnavailable', e.target.checked)} />
          Show unavailable too
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? <p className="muted">Searching…</p> : <p className="muted">{donors.length} donor(s) found</p>}
      <div className="grid">
        {donors.map((d) => <DonorCard key={d._id} donor={d} signedIn={!!user} />)}
      </div>
      {!user && <p className="muted center">Phone numbers are masked for guests. <a href="/login">Login</a> to contact donors with one click.</p>}
    </>
  );
}
