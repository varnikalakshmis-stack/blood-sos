import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import SosCard from '../components/SosCard.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, byGroup: [] });
  const [sos, setSos] = useState([]);

  useEffect(() => {
    api.donorStats().then(setStats).catch(() => {});
    api.sosList({ status: 'open' }).then((d) => setSos(d.requests.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <h1>When every minute matters, find a donor next door.</h1>
        <p>
          BloodLink SOS connects people who need blood with volunteer donors in their own
          neighbourhood or society — by blood group and locality.
        </p>
        <div className="hero-actions">
          <Link to="/donors" className="btn btn-primary">🔍 Find a donor</Link>
          <Link to={user ? '/sos/new' : '/login'} className="btn btn-sos">🚨 Raise SOS</Link>
          {!user && <Link to="/register" className="btn btn-ghost">Become a volunteer</Link>}
        </div>
      </section>

      <section>
        <h2>Available donors in the network <span className="muted">({stats.total} registered)</span></h2>
        <div className="stat-grid">
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => {
            const c = stats.byGroup.find((x) => x.bloodGroup === g)?.count || 0;
            return (
              <Link key={g} to={`/donors?bloodGroup=${encodeURIComponent(g)}`} className="stat">
                <b>{g}</b>
                <span>{c} available</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="row-between">
          <h2>Latest SOS requests</h2>
          <Link to="/sos">View all →</Link>
        </div>
        {sos.length === 0 && <p className="muted">No open requests right now.</p>}
        <div className="grid">{sos.map((s) => <SosCard key={s._id} sos={s} user={user} />)}</div>
      </section>

      <section className="how">
        <h2>How it works</h2>
        <div className="grid three">
          <div className="card"><h3>1. Register</h3><p>Volunteers sign up with blood group and locality, and flip availability on or off any time.</p></div>
          <div className="card"><h3>2. Broadcast</h3><p>In an emergency, post an SOS. It appears at the top of the board, ranked by urgency.</p></div>
          <div className="card"><h3>3. Connect</h3><p>One tap to call or WhatsApp a matching donor — no forms, no waiting.</p></div>
        </div>
      </section>
    </>
  );
}
