import { useEffect, useState } from 'react';
import { api, BLOOD_GROUPS } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import SosCard from '../components/SosCard.jsx';

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [mine, setMine] = useState([]);
  const [matching, setMatching] = useState([]);
  const [form, setForm] = useState({
    name: user.name, phone: user.phone, bloodGroup: user.bloodGroup, locality: user.locality, city: user.city || '',
    lastDonationDate: user.lastDonationDate ? user.lastDonationDate.slice(0, 10) : '',
  });
  const [msg, setMsg] = useState('');

  const load = () => {
    api.sosMine().then((d) => setMine(d.requests)).catch(() => {});
    api.sosMatching().then((d) => setMatching(d.requests)).catch(() => {});
  };
  useEffect(load, []);

  const toggle = async () => {
    const d = await api.toggleAvailability(!user.isAvailable);
    setUser(d.user);
  };
  const save = async (e) => {
    e.preventDefault();
    try {
      const d = await api.updateMe({ ...form, lastDonationDate: form.lastDonationDate || null });
      setUser(d.user); setMsg('Profile saved ✓');
    } catch (err) { setMsg(err.message); }
  };
  const respond = async (id) => { await api.sosRespond(id); load(); };
  const setStatus = async (id, s) => { await api.sosStatus(id, s); load(); };
  const del = async (id) => { await api.sosDelete(id); load(); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h1>Hello, {user.name.split(' ')[0]} 👋</h1>

      <div className="card availability">
        <div>
          <h3>Donor availability</h3>
          <p className="muted">
            {user.isAvailable
              ? 'You are visible to people searching for ' + user.bloodGroup + ' donors.'
              : 'You are hidden from donor search until you switch back on.'}
          </p>
        </div>
        <button className={`switch ${user.isAvailable ? 'on' : ''}`} onClick={toggle} aria-pressed={user.isAvailable}>
          <span />
        </button>
      </div>

      <h2>Requests you can help with</h2>
      {matching.length === 0 && <p className="muted">No open requests match your blood group right now.</p>}
      <div className="grid">
        {matching.map((s) => <SosCard key={s._id} sos={s} user={user} onRespond={respond} />)}
      </div>

      <h2>Your SOS requests</h2>
      {mine.length === 0 && <p className="muted">You haven't raised any SOS requests.</p>}
      <div className="grid">
        {mine.map((s) => <SosCard key={s._id} sos={{ ...s, requester: user._id }} user={user} onStatus={setStatus} onDelete={del} />)}
      </div>

      <h2>Profile</h2>
      <form className="card form narrow" onSubmit={save}>
        <label>Name<input value={form.name} onChange={set('name')} required /></label>
        <label>Phone<input value={form.phone} onChange={set('phone')} required /></label>
        <div className="two">
          <label>Blood group
            <select value={form.bloodGroup} onChange={set('bloodGroup')}>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
          </label>
          <label>Last donated on<input type="date" value={form.lastDonationDate} onChange={set('lastDonationDate')} /></label>
        </div>
        <div className="two">
          <label>Locality / society<input value={form.locality} onChange={set('locality')} required /></label>
          <label>City<input value={form.city} onChange={set('city')} /></label>
        </div>
        {msg && <p className="muted">{msg}</p>}
        <button className="btn btn-primary">Save profile</button>
      </form>
    </>
  );
}
