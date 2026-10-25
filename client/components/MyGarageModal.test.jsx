import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyGarageModal } from './MyGarageModal.jsx';
import * as apiModule from '../api.js';

const mockUser = {
  id: 10,
  name: 'Eleanor Vance',
  email: 'eleanor@atelier.luxury',
  role: 'user',
};

const mockOrder = {
  id: 'ord-101',
  vin: '1AT894002025XYZ1',
  status: 'handcrafting',
  delivery_address: '450 Park Avenue, New York, NY',
  estimated_delivery: '2026-11-20',
  created_at: '2026-10-25T12:00:00Z',
  vehicle: {
    id: 1,
    make: 'Aurelia',
    model: 'GT S',
    category: 'Coupe',
    year: 2025,
    price: 89400,
  },
};

const mockTestDrive = {
  id: 201,
  vehicle_id: 1,
  date: '2026-11-05',
  time_slot: '14:00',
  experience_type: 'concierge',
  location: '740 Park Ave, New York',
  status: 'confirmed',
  vehicle: {
    id: 1,
    make: 'Aurelia',
    model: 'GT S',
    price: 89400,
  },
};

describe('MyGarageModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders sign-in prompt when user is not authenticated', () => {
    const handleSignIn = vi.fn();
    render(
      <MyGarageModal
        user={null}
        token={null}
        onClose={vi.fn()}
        onSignIn={handleSignIn}
      />
    );

    expect(screen.getByText(/Member Garage Access/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Your Garage/i })).toBeInTheDocument();
  });

  it('displays empty state when member has no orders', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (path) => {
      if (path === '/orders') return { orders: [] };
      if (path === '/test-drives') return { requests: [] };
      return {};
    });

    render(
      <MyGarageModal
        user={mockUser}
        token="valid-token"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Your Garage is Ready/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/You haven’t reserved or acquired any Atelier Motors vehicles yet/i)).toBeInTheDocument();
  });

  it('renders order with 5-stage progression timeline and VIN', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (path) => {
      if (path === '/orders') return { orders: [mockOrder] };
      if (path === '/test-drives') return { requests: [] };
      return {};
    });

    render(
      <MyGarageModal
        user={mockUser}
        token="valid-token"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Aurelia GT S/)[0]).toBeInTheDocument();
    });

    expect(screen.getByText(/1AT894002025XYZ1/)).toBeInTheDocument();
    expect(screen.getByText(/Handcrafted Assembly/i)).toBeInTheDocument();
    expect(screen.getByText(/450 Park Avenue, New York, NY/i)).toBeInTheDocument();
  });

  it('toggles digital Monroney window sticker modal', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (path) => {
      if (path === '/orders') return { orders: [mockOrder] };
      if (path === '/test-drives') return { requests: [] };
      return {};
    });

    render(
      <MyGarageModal
        user={mockUser}
        token="valid-token"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Aurelia GT S/)[0]).toBeInTheDocument();
    });

    const stickerButton = screen.getByRole('button', { name: /View Monroney Window Sticker/i });
    await userEvent.click(stickerButton);

    expect(screen.getByText(/Official Monroney Window Label/i)).toBeInTheDocument();
    expect(screen.getByText(/GOVERNMENT 5-STAR SAFETY RATINGS/i)).toBeInTheDocument();
    expect(screen.getByText(/STANDARD LUXURY EQUIPMENT/i)).toBeInTheDocument();
  });

  it('switches to Scheduled Test Drives tab', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (path) => {
      if (path === '/orders') return { orders: [mockOrder] };
      if (path === '/test-drives') return { requests: [mockTestDrive] };
      return {};
    });

    render(
      <MyGarageModal
        user={mockUser}
        token="valid-token"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Scheduled Test Drives \(1\)/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/Scheduled Test Drives \(1\)/i));

    expect(screen.getByText(/Concierge Handover/i)).toBeInTheDocument();
    expect(screen.getByText(/740 Park Ave, New York/i)).toBeInTheDocument();
  });
});
