import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="drop">🩸</span> BloodLink <b>SOS</b>
        </Link>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <nav className={open ? 'links open' : 'links'} onClick={close}>
          <NavLink to="/sos">SOS Board</NavLink>
          <NavLink to="/donors">Find Donors</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">My Dashboard</NavLink>
              <Link to="/sos/new" className="btn btn-sos small">+ Raise SOS</Link>
              <button className="btn btn-ghost small" onClick={() => { logout(); nav('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-primary small">Become a Donor</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
