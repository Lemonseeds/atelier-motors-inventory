import { describe, expect, it } from 'vitest';
import {
  calculateLoanPayment,
  calculateLeasePayment,
  CREDIT_TIERS,
} from './financing.js';

describe('Financing Calculations', () => {
  it('calculates monthly amortized loan payment correctly for 48 months', () => {
    // $80,000 car, $10,000 down, $0 trade-in = $70,000 principal at 4.9% APR for 48 months
    const loan = calculateLoanPayment({
      vehiclePrice: 80000,
      downPayment: 10000,
      tradeIn: 0,
      apr: 4.9,
      termMonths: 48,
    });

    expect(loan.principal).toBe(70000);
    // Standard PMT for $70k @ 4.9% / 48mo is ~$1,608
    expect(loan.monthlyPayment).toBeGreaterThan(1590);
    expect(loan.monthlyPayment).toBeLessThan(1630);
    expect(loan.totalInterest).toBeGreaterThan(0);
  });

  it('handles 0% APR or full down payment cleanly without NaN or division by zero', () => {
    const zeroApr = calculateLoanPayment({
      vehiclePrice: 60000,
      downPayment: 12000,
      tradeIn: 0,
      apr: 0,
      termMonths: 48,
    });
    expect(zeroApr.principal).toBe(48000);
    expect(zeroApr.monthlyPayment).toBe(1000);
    expect(zeroApr.totalInterest).toBe(0);

    const paidInFull = calculateLoanPayment({
      vehiclePrice: 60000,
      downPayment: 60000,
      tradeIn: 0,
      apr: 5,
      termMonths: 48,
    });
    expect(paidInFull.principal).toBe(0);
    expect(paidInFull.monthlyPayment).toBe(0);
  });

  it('calculates closed-end lease payment with depreciation and rent charge', () => {
    // $90,000 car, $5,000 cap reduction, 36 months
    const lease = calculateLeasePayment({
      vehiclePrice: 90000,
      downPayment: 5000,
      tradeIn: 0,
      moneyFactor: CREDIT_TIERS[0].moneyFactor,
      termMonths: 36,
    });

    expect(lease.residualValue).toBe(90000 * 0.53);
    expect(lease.monthlyPayment).toBeGreaterThan(1200);
    expect(lease.monthlyPayment).toBeLessThan(1400);
    expect(lease.depreciationMonthly).toBeGreaterThan(0);
    expect(lease.rentChargeMonthly).toBeGreaterThan(0);
  });
});
