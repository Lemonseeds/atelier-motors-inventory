import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App.jsx';
import { api } from './api.js';

vi.mock('./api.js', () => ({ api: vi.fn() }));

const liveVehicle = { id: 9, make: 'Vanta', model: 'R', category: 'Sedan', year: 2026, price: 50000, quantity: 1, imageUrl: '', description: '' };

function signInAs(role) {
  localStorage.setItem('atelier-auth', JSON.stringify({ token: 'token', user: { id: 1, name: 'Robin', role } }));
  vi.mocked(api).mockImplementation(async (path) => (path === '/auth/me' ? { user: { id: 1, name: 'Robin', role } } : { vehicles: [liveVehicle] }));
}

beforeEach(() => {
  vi.mocked(api).mockReset();
});

describe('App', () => {
  it('shows a sign-in button and preview collection to visitors', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/find the car/i);
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('loads live inventory for a signed-in member without admin controls', async () => {
    signInAs('user');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /Vanta R/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add vehicle/i })).not.toBeInTheDocument();
  });

  it('gives admins the add-vehicle control', async () => {
    signInAs('admin');
    render(<App />);
    expect(await screen.findByRole('button', { name: /add vehicle/i })).toBeInTheDocument();
  });
});
