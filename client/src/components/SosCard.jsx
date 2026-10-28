import ContactButtons from './ContactButtons.jsx';
import { timeAgo } from '../api.js';

export default function SosCard({ sos, user, onRespond, onStatus, onDelete }) {
  const mine = user && sos.requester && (sos.requester._id || sos.requester) === user._id;
  const responding = user && (sos.responders || []).includes(user._id);

  return (
    <div className={`card sos ${sos.urgency} ${sos.status !== 'open' ? 'closed' : ''}`}>
      <div className="sos-head">
        <div className="bg-badge big">{sos.bloodGroup}</div>
        <div className="grow">
          <div className="row-between">
            <span className={`pill urg-${sos.urgency}`}>{sos.urgency.toUpperCase()}</span>
            <span className="muted small-text">{timeAgo(sos.createdAt)}</span>
          </div>
          <h3>{sos.units} unit{sos.units > 1 ? 's' : ''} needed · {sos.patientName}</h3>
          <p className="muted">🏥 {sos.hospital}</p>
          <p className="muted">📍 {sos.locality}{sos.city ? `, ${sos.city}` : ''}</p>
        </div>
      </div>
      {sos.note && <p className="note">“{sos.note}”</p>}
      {sos.neededBy && <p className="small-text">⏰ Needed by {new Date(sos.neededBy).toLocaleString()}</p>}
      <p className="small-text muted">
        Contact: <b>{sos.contactName}</b> · {sos.responderCount} donor{sos.responderCount === 1 ? '' : 's'} responding
      </p>

      {sos.status !== 'open' ? (
        <span className="pill no">{sos.status.toUpperCase()}</span>
      ) : (
        <>
          <ContactButtons contact={sos.contact} />
          <div className="contact-row">
            {user && !mine && onRespond && (
              <button className={`btn small ${responding ? 'btn-ghost' : 'btn-primary'}`} onClick={() => onRespond(sos._id)}>
                {responding ? '✓ You offered help (undo)' : '🙋 I can donate'}
              </button>
            )}
            {mine && onStatus && (
              <>
                <button className="btn btn-primary small" onClick={() => onStatus(sos._id, 'fulfilled')}>Mark fulfilled</button>
                <button className="btn btn-ghost small" onClick={() => onStatus(sos._id, 'cancelled')}>Cancel</button>
              </>
            )}
          </div>
        </>
      )}
      {mine && onDelete && (
        <button className="link-btn" onClick={() => window.confirm('Delete this request?') && onDelete(sos._id)}>Delete</button>
      )}
    </div>
  );
}
