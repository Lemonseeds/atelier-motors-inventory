import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthDialog } from './AuthDialog.jsx';
import { VehicleDialog } from './VehicleDialog.jsx';
import { api } from '../api.js';

vi.mock('../api.js', () => ({ api: vi.fn() }));

beforeEach(() => {
  vi.mocked(api).mockReset();
});

describe('AuthDialog', () => {
  it('registers with name, email and password and reports success', async () => {
    const onSuccess = vi.fn();
    vi.mocked(api).mockResolvedValue({ token: 't', user: { name: 'Ada' } });
    render(<AuthDialog mode="register" setMode={vi.fn()} onClose={vi.fn()} onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Ada');
    await userEvent.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'LongEnough1');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(api).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', password: 'LongEnough1' }) }));
    expect(onSuccess).toHaveBeenCalledWith({ token: 't', user: { name: 'Ada' } });
  });

  it('shows the API error when login fails', async () => {
    vi.mocked(api).mockRejectedValue(new Error('Invalid email or password.'));
    render(<AuthDialog mode="login" setMode={vi.fn()} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });
});

describe('VehicleDialog', () => {
  it('sends numeric year, price and quantity when adding a vehicle', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const onClose = vi.fn();
    render(<VehicleDialog vehicle={null} onClose={onClose} onSave={onSave} />);
    await userEvent.type(screen.getByLabelText(/make/i), 'Eon');
    await userEvent.type(screen.getByLabelText(/^model$/i), 'Lucent');
    await userEvent.type(screen.getByLabelText(/price/i), '68500');
    await userEvent.type(screen.getByLabelText(/quantity/i), '2');
    await userEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ make: 'Eon', model: 'Lucent', price: 68500, quantity: 2, year: expect.any(Number) }));
    expect(onClose).toHaveBeenCalled();
  });
});
