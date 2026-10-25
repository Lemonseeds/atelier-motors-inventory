import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  window.history.replaceState({}, '', '/');
  window.scrollTo = vi.fn();
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

  it('navigates from the vehicle menu to a learn page and configurator', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /^Vehicles$/ }));
    expect(screen.getByRole('button', { name: 'Learn about Solenne R8' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Learn about Solenne R8' }));
    expect(window.location.pathname).toBe('/vehicles/solenne-r8/learn');
    await user.click(screen.getByRole('button', { name: 'Design yours' }));
    expect(window.location.pathname).toBe('/vehicles/solenne-r8/design');
    expect(screen.getByRole('button', { name: 'Carmine Red' })).toBeInTheDocument();
  });

  it('compares two cars and updates configured option prices', async () => {
    const user = userEvent.setup();
    render(<App/>);
    const addButtons = screen.getAllByRole('button', { name: 'Add to compare' });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    await user.click(screen.getByRole('button', { name: /Compare cars/i }));
    expect(screen.getByRole('dialog', { name: 'Compare vehicles' })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog', { name: 'Compare vehicles' })).getByRole('heading', { name: 'Northline Summit X' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Paint', { selector: '#compare-paint-1' }), '3');
    expect(screen.getByText('$91,200')).toBeInTheDocument();
  });
});
