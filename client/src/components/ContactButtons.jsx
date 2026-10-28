// Single-click contact links: call / WhatsApp / SMS
export default function ContactButtons({ contact, label = 'Contact' }) {
  if (!contact) return null;
  return (
    <div className="contact-row" aria-label={label}>
      <a className="btn btn-call small" href={contact.call}>📞 Call</a>
      <a className="btn btn-wa small" href={contact.whatsapp} target="_blank" rel="noreferrer">💬 WhatsApp</a>
      <a className="btn btn-ghost small" href={contact.sms}>✉️ SMS</a>
    </div>
  );
}
