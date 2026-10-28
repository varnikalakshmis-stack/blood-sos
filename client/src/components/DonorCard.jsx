import { Link } from 'react-router-dom';
import ContactButtons from './ContactButtons.jsx';

export default function DonorCard({ donor, signedIn }) {
  return (
    <div className={`card donor ${donor.isAvailable ? '' : 'off'}`}>
      <div className="bg-badge">{donor.bloodGroup}</div>
      <div className="grow">
        <h3>{donor.name}</h3>
        <p className="muted">📍 {donor.locality}{donor.city ? `, ${donor.city}` : ''}</p>
        <p>
          <span className={`pill ${donor.isAvailable ? 'ok' : 'no'}`}>
            {donor.isAvailable ? 'Available' : 'Unavailable'}
          </span>{' '}
          {!donor.eligible && <span className="pill warn">Donated recently</span>}
        </p>
        <p className="muted small-text">{donor.phone}</p>
        {signedIn ? (
          <ContactButtons contact={donor.contact} />
        ) : (
          <Link className="btn btn-ghost small" to="/login">Login to contact</Link>
        )}
      </div>
    </div>
  );
}
