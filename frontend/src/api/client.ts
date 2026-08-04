import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leasepilot-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) window.dispatchEvent(new Event('leasepilot:unauthorized'));
    return Promise.reject(error);
  },
);
export const getErrorMessage = (error: unknown): string =>
  axios.isAxiosError(error)
    ? ((error.response?.data as { error?: { message?: string } })?.error?.message ?? error.message)
    : 'Something went wrong';
