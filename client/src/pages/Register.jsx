import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { BLOOD_GROUPS } from '../api.js';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', bloodGroup: 'O+', locality: '', city: '', lastDonationDate: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await register({ ...form, lastDonationDate: form.lastDonationDate || undefined }); nav('/dashboard'); }
    catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h1>Become a volunteer donor</h1>
      {error && <p className="error">{error}</p>}
      <label>Full name<input required value={form.name} onChange={set('name')} /></label>
      <div className="two">
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password<input type="password" minLength="6" required value={form.password} onChange={set('password')} /></label>
      </div>
      <label>Phone (with country code, e.g. +919876543210)<input required value={form.phone} onChange={set('phone')} /></label>
      <div className="two">
        <label>Blood group
          <select value={form.bloodGroup} onChange={set('bloodGroup')}>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label>Last donated on (optional)<input type="date" value={form.lastDonationDate} onChange={set('lastDonationDate')} /></label>
      </div>
      <div className="two">
        <label>Locality / society<input required placeholder="e.g. Anna Nagar" value={form.locality} onChange={set('locality')} /></label>
        <label>City<input value={form.city} onChange={set('city')} /></label>
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating account…' : 'Register'}</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
