/**
 * Backend base URL — set VITE_API_URL in .env for production.
 * Must match Express CORS (localhost:5173 allowed by default).
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export function getToken() {
  return localStorage.getItem('token');
}

export function setSession(token, userPayload) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userPayload));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * JSON or FormData fetch with Bearer token.
 */
export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || res.statusText || 'Request failed');
  }
  return data;
}
