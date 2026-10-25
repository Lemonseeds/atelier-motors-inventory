import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestDriveModal } from './TestDriveModal.jsx';
import * as apiModule from '../api.js';

const mockVehicle = {
  id: 1,
  make: 'Aurelia',
  model: 'GT S',
  category: 'Coupe',
  year: 2025,
  price: 89400,
  quantity: 3,
};

const mockUser = {
  id: 10,
  name: 'Jordan Belfort',
  email: 'jordan@example.com',
  role: 'user',
};

describe('TestDriveModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders experience types, vehicle info, and location selector', () => {
    render(
      <TestDriveModal
        vehicle={mockVehicle}
        user={mockUser}
        token="valid-token"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Schedule a Test Drive/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Aurelia GT S/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Atelier Showroom/)).toBeInTheDocument();
    expect(screen.getByText(/Home Concierge/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Showroom Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Date/i)).toBeInTheDocument();
  });

  it('allows switching to Home Concierge experience and entering delivery address', async () => {
    render(
      <TestDriveModal
        vehicle={mockVehicle}
        user={mockUser}
        token="valid-token"
        onClose={vi.fn()}
      />
    );

    await userEvent.click(screen.getByText(/Home Concierge/));
    expect(screen.getByLabelText(/Delivery Address \/ ZIP/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Showroom Location/i)).not.toBeInTheDocument();
  });

  it('prompts sign in when user has no active token', async () => {
    const onSignIn = vi.fn();
    render(
      <TestDriveModal
        vehicle={mockVehicle}
        user={null}
        token={null}
        onClose={vi.fn()}
        onSignIn={onSignIn}
      />
    );

    const reserveBtn = screen.getByRole('button', { name: /Sign In to Reserve/i });
    expect(reserveBtn).toBeInTheDocument();
    await userEvent.click(reserveBtn);
    expect(onSignIn).toHaveBeenCalledOnce();
  });

  it('submits booking successfully and displays confirmation code and calendar download', async () => {
    const apiSpy = vi.spyOn(apiModule, 'api').mockResolvedValueOnce({
      request: {
        id: 42,
        vehicleId: 1,
        vehicleName: 'Aurelia GT S',
        preferredDate: '2026-10-30',
        timeWindow: 'Afternoon',
        experienceType: 'Showroom',
        location: 'Manhattan Flagship (57th St, New York)',
        status: 'requested',
      },
    });

    render(
      <TestDriveModal
        vehicle={mockVehicle}
        user={mockUser}
        token="valid-auth-token"
        onClose={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Afternoon' }));
    await userEvent.click(screen.getByRole('button', { name: /Reserve Test Drive/i }));

    expect(apiSpy).toHaveBeenCalledWith('/test-drives', expect.objectContaining({
      method: 'POST',
      token: 'valid-auth-token',
      body: expect.objectContaining({
        vehicleId: 1,
        timeWindow: 'Afternoon',
        experienceType: 'Showroom',
      }),
    }));

    await waitFor(() => {
      expect(screen.getByText(/Test Drive Confirmed/i)).toBeInTheDocument();
      expect(screen.getByText(/#AT-TD-2026-0042/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add to Calendar/i })).toBeInTheDocument();
    });
  });
});
