const BASE = '/api';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

async function request(path, { method = 'GET', body, params } = {}) {
  const token = localStorage.getItem('token');
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString()
    : '';
  const res = await fetch(BASE + path + qs, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  me: () => request('/auth/me'),
  updateMe: (b) => request('/auth/me', { method: 'PUT', body: b }),
  toggleAvailability: (isAvailable) =>
    request('/auth/me/availability', { method: 'PATCH', body: { isAvailable } }),

  donors: (params) => request('/donors', { params }),
  donorStats: () => request('/donors/stats'),

  sosList: (params) => request('/sos', { params }),
  sosMine: () => request('/sos/mine'),
  sosMatching: () => request('/sos/matching'),
  sosCreate: (b) => request('/sos', { method: 'POST', body: b }),
  sosRespond: (id) => request(`/sos/${id}/respond`, { method: 'POST' }),
  sosStatus: (id, status) => request(`/sos/${id}/status`, { method: 'PATCH', body: { status } }),
  sosDelete: (id) => request(`/sos/${id}`, { method: 'DELETE' }),
};

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
