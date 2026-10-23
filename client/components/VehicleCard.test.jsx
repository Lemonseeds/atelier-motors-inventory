import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleCard } from './VehicleCard.jsx';

const vehicle = { id: 1, make: 'Aurelia', model: 'GT S', category: 'Coupe', year: 2025, price: 89400, quantity: 3, imageUrl: '', description: 'Sculpted lines.' };
const handlers = () => ({ onPurchase: vi.fn(), onEdit: vi.fn(), onRestock: vi.fn(), onDelete: vi.fn() });

describe('VehicleCard', () => {
  it('shows the vehicle details, formatted price and stock', () => {
    render(<VehicleCard vehicle={vehicle} {...handlers()} />);
    expect(screen.getByRole('heading', { name: /Aurelia GT S/ })).toBeInTheDocument();
    expect(screen.getByText('$89,400')).toBeInTheDocument();
    expect(screen.getByText('3 available')).toBeInTheDocument();
  });

  it('calls onPurchase when Purchase is clicked', async () => {
    const props = handlers();
    render(<VehicleCard vehicle={vehicle} {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(props.onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it('disables the purchase button when quantity is zero', () => {
    render(<VehicleCard vehicle={{ ...vehicle, quantity: 0 }} {...handlers()} />);
    expect(screen.getByRole('button', { name: /unavailable/i })).toBeDisabled();
    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });

  it('only shows edit, restock and delete controls to admins', async () => {
    const { rerender } = render(<VehicleCard vehicle={vehicle} {...handlers()} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    const props = handlers();
    rerender(<VehicleCard vehicle={vehicle} isAdmin {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /restock/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(props.onRestock).toHaveBeenCalledWith(vehicle);
    expect(props.onDelete).toHaveBeenCalledWith(vehicle);
    expect(props.onEdit).toHaveBeenCalledWith(vehicle);
  });
});
