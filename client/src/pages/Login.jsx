import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(form); nav(loc.state?.from || '/dashboard'); }
    catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
      <p className="muted">New here? <Link to="/register">Register as a volunteer donor</Link></p>
    </form>
  );
}
