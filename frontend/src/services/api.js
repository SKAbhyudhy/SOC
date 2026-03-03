import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: async (username, password) => {
    const body = new URLSearchParams({ username, password });
    const { data } = await api.post('/api/auth/login', body, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    localStorage.setItem('token', data.access_token);
    return data;
  },
  me: () => api.get('/api/auth/me').then((r) => r.data),
};

export const socApi = {
  dashboard: () => api.get('/api/dashboard/metrics').then((r) => r.data),
  analytics: () => api.get('/api/analytics/metrics').then((r) => r.data),
  incidents: () => api.get('/api/incidents').then((r) => r.data),
  cases: () => api.get('/api/cases').then((r) => r.data),
  ingestManual: (payload) => api.post('/api/ingest/manual', payload).then((r) => r.data),
  ingestDataset: () => api.post('/api/ingest/dataset/start').then((r) => r.data),
  toggleScheduler: (enabled) => api.post(`/api/ingest/scheduler/toggle?enabled=${enabled}`).then((r) => r.data),
  approveMitigation: (incident_id) => api.post('/api/mitigation/approve', { incident_id }).then((r) => r.data),
  executeMitigation: (incident_id) => api.post('/api/mitigation/execute', { incident_id }).then((r) => r.data),
  switchTenant: (tenant_id) => api.post('/api/tenant/switch', { tenant_id }).then((r) => r.data),
};

export default api;
