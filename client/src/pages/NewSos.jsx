import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, BLOOD_GROUPS } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function NewSos() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    patientName: '', bloodGroup: 'O+', units: 1, urgency: 'urgent', hospital: '',
    locality: user?.locality || '', city: user?.city || '',
    contactName: user?.name || '', contactPhone: user?.phone || '', note: '', neededBy: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = { ...form, units: Number(form.units), neededBy: form.neededBy || undefined };
      const res = await api.sosCreate(payload);
      setDone(res);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="card narrow center">
        <h2>✅ SOS broadcast</h2>
        <p>Your request is live on the board.</p>
        <p><b>{done.matchingDonors}</b> available compatible donor(s) are registered in <b>{form.locality}</b>.</p>
        <div className="contact-row center-row">
          <Link className="btn btn-primary" to={`/donors?bloodGroup=${encodeURIComponent(form.bloodGroup)}`}>Contact donors now</Link>
          <button className="btn btn-ghost" onClick={() => nav('/sos')}>View board</button>
        </div>
      </div>
    );
  }

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h1>🚨 Raise an SOS</h1>
      {error && <p className="error">{error}</p>}
      <label>Patient name<input required value={form.patientName} onChange={set('patientName')} /></label>
      <div className="two">
        <label>Blood group
          <select value={form.bloodGroup} onChange={set('bloodGroup')}>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label>Units needed<input type="number" min="1" max="20" required value={form.units} onChange={set('units')} /></label>
      </div>
      <label>Urgency
        <select value={form.urgency} onChange={set('urgency')}>
          <option value="critical">Critical (within hours)</option>
          <option value="urgent">Urgent (within a day)</option>
          <option value="normal">Normal (planned)</option>
        </select>
      </label>
      <label>Hospital<input required value={form.hospital} onChange={set('hospital')} /></label>
      <div className="two">
        <label>Locality / society<input required value={form.locality} onChange={set('locality')} /></label>
        <label>City<input value={form.city} onChange={set('city')} /></label>
      </div>
      <div className="two">
        <label>Contact person<input required value={form.contactName} onChange={set('contactName')} /></label>
        <label>Contact phone<input required value={form.contactPhone} onChange={set('contactPhone')} /></label>
      </div>
      <label>Needed by (optional)<input type="datetime-local" value={form.neededBy} onChange={set('neededBy')} /></label>
      <label>Note (optional)<textarea rows="3" maxLength="400" value={form.note} onChange={set('note')} /></label>
      <button className="btn btn-sos" disabled={busy}>{busy ? 'Broadcasting…' : 'Broadcast SOS'}</button>
    </form>
  );
}
