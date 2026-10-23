const BASE_URL = '/api';

/**
 * Small fetch wrapper for the JSON API.
 * Adds the bearer token, parses JSON, and throws an Error (with `status`)
 * carrying the server's message for non-2xx responses.
 */
export async function api(path, { token, ...options } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }
  return body;
}
