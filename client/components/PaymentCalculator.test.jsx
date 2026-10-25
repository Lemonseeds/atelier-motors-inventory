import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentCalculator } from './PaymentCalculator.jsx';

describe('PaymentCalculator Component', () => {
  it('renders monthly payment estimate and allows toggling between loan and lease', async () => {
    render(<PaymentCalculator vehiclePrice={80000} />);

    expect(screen.getByText(/Payment Estimator/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Monthly Payment/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Finance \(Loan\)/i })).toHaveAttribute('aria-selected', 'true');

    // Switch to lease
    const leaseTab = screen.getByRole('tab', { name: /Lease/i });
    await userEvent.click(leaseTab);
    expect(leaseTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Closed-End Lease/i)).toBeInTheDocument();
  });

  it('allows toggling financial breakdown details', async () => {
    render(<PaymentCalculator vehiclePrice={95000} />);

    const detailsToggle = screen.getByRole('button', { name: /Financial Breakdown Details/i });
    expect(screen.queryByText(/Agreed Vehicle Value/i)).not.toBeInTheDocument();

    await userEvent.click(detailsToggle);
    expect(screen.getByText(/Agreed Vehicle Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Loan Cost/i)).toBeInTheDocument();
  });

  it('updates term when term buttons are clicked', async () => {
    render(<PaymentCalculator vehiclePrice={75000} />);

    const term60 = screen.getByRole('button', { name: '60 Mo' });
    await userEvent.click(term60);
    expect(screen.getAllByText(/60 Mo/)[0]).toBeInTheDocument();
  });
});
