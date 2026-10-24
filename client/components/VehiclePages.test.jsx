import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleDesignPage, VehicleLearnPage } from './VehiclePages.jsx';

const vehicle = { id: 1, make: 'Aurelia', model: 'GT S', category: 'Coupe', year: 2025, price: 89400, quantity: 3, description: 'A sculpted grand tourer.' };

describe('vehicle experiences', () => {
  it('gives each car a learn page with a route to its configurator', async () => {
    const onDesign = vi.fn();
    render(<VehicleLearnPage vehicle={vehicle} onDesign={onDesign} onBack={vi.fn()}/>);
    expect(screen.getByRole('heading', { level: 1, name: /Aurelia GT S/ })).toBeInTheDocument();
    expect(screen.getByText(/Designed to make every road/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Design yours/i }));
    expect(onDesign).toHaveBeenCalledOnce();
  });

  it('switches actual vehicle views and paint color and recalculates the configured price', async () => {
    const onPurchase = vi.fn();
    render(<VehicleDesignPage vehicle={vehicle} onBack={vi.fn()} onLearn={vi.fn()} onPurchase={onPurchase} isAuthenticated/>);
    expect(screen.getByRole('img', { name: /front view/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show Side profile' }));
    expect(screen.getByRole('img', { name: /side view/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show Rear view' }));
    expect(screen.getByRole('img', { name: /rear view/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Carmine Red' }));
    expect(screen.getByRole('button', { name: 'Carmine Red' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('img', { name: /rear view/i }).innerHTML).toContain('#a43134');
    await userEvent.click(screen.getByRole('button', { name: /^Performance/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Ivory/i }));
    expect(screen.getByText('$97,200')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /interior view/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Confirm purchase/i }));
    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });
});
