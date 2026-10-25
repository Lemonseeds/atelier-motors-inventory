import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api.js';

describe('client api helper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('automatically serializes plain object body to JSON string with Content-Type header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const payload = { vehicleId: 1, preferredDate: '2026-10-29', timeWindow: 'Afternoon' };
    const res = await api('/test-drives', {
      method: 'POST',
      token: 'jwt-123',
      body: payload,
    });

    expect(res).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/test-drives', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-123',
      },
    });
  });

  it('preserves pre-stringified JSON string body without double serialization', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 5 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const stringBody = JSON.stringify({ name: 'Ayrton' });
    await api('/users', {
      method: 'POST',
      body: stringBody,
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/users', {
      method: 'POST',
      body: stringBody,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('throws an error with status and server error message on non-2xx responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid JSON.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(api('/fail')).rejects.toThrow('Invalid JSON.');
  });
});
