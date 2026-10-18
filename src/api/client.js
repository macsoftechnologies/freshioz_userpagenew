export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('freshioz.com')
    ? 'https://api.freshioz.com/api'
    : '/api');

/**
 * Standard HTTP client with automatic Bearer token injection and error parsing
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const token = localStorage.getItem('freshioz_user_token') || localStorage.getItem('freshioz_partner_token') || localStorage.getItem('freshioz_auth_token');
  const headers = { ...options.headers };

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || `Request failed with status ${response.status}`;
    const error = new Error(Array.isArray(message) ? message.join(', ') : message);
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json().catch(() => null);
}
