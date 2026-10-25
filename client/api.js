const BASE_URL = '/api';

/**
 * Small fetch wrapper for the JSON API.
 * Adds the bearer token, parses JSON, and throws an Error (with `status`)
 * carrying the server's message for non-2xx responses.
 */
export async function api(path, { token, ...options } = {}) {
  const isObjectBody =
    options.body !== undefined &&
    options.body !== null &&
    typeof options.body === 'object' &&
    !(typeof FormData !== 'undefined' && options.body instanceof FormData);

  const body = isObjectBody ? JSON.stringify(options.body) : options.body;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    body,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }
  return data;
}
