/**
 * Financial calculation engine for luxury vehicle loans and leases.
 */

export const CREDIT_TIERS = [
  { id: 'tier1', label: 'Tier 1 (740+)', apr: 4.9, moneyFactor: 0.00204 },
  { id: 'tier2', label: 'Tier 2 (680–739)', apr: 6.4, moneyFactor: 0.00267 },
  { id: 'tier3', label: 'Tier 3 (620–679)', apr: 7.9, moneyFactor: 0.00329 },
];

export const LOAN_TERMS = [24, 36, 48, 60, 72];
export const LEASE_TERMS = [24, 36, 48];

// Estimated residual percentage of MSRP at end of lease
export const RESIDUAL_PERCENTAGES = {
  24: 0.60,
  36: 0.53,
  48: 0.46,
};

/**
 * Calculates standard monthly amortized loan payment.
 * @param {Object} options
 * @param {number} options.vehiclePrice Total purchase price
 * @param {number} options.downPayment Cash down payment
 * @param {number} options.tradeIn Estimated trade-in credit
 * @param {number} options.apr Annual percentage rate in percent (e.g. 4.9)
 * @param {number} options.termMonths Loan term in months (e.g. 48)
 */
export function calculateLoanPayment({
  vehiclePrice,
  downPayment = 0,
  tradeIn = 0,
  apr = 4.9,
  termMonths = 48,
}) {
  const safePrice = Math.max(0, Number(vehiclePrice) || 0);
  const safeDown = Math.max(0, Number(downPayment) || 0);
  const safeTrade = Math.max(0, Number(tradeIn) || 0);
  const principal = Math.max(0, safePrice - safeDown - safeTrade);

  if (principal === 0 || termMonths <= 0) {
    return {
      monthlyPayment: 0,
      principal: 0,
      totalInterest: 0,
      totalCost: safeDown + safeTrade,
    };
  }

  const monthlyRate = (apr / 100) / 12;

  if (monthlyRate === 0) {
    const monthly = principal / termMonths;
    return {
      monthlyPayment: Math.round(monthly),
      principal: Math.round(principal),
      totalInterest: 0,
      totalCost: Math.round(principal + safeDown + safeTrade),
    };
  }

  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  const monthly = principal * (numerator / denominator);
  const totalLoanPaid = monthly * termMonths;
  const totalInterest = Math.max(0, totalLoanPaid - principal);

  return {
    monthlyPayment: Math.round(monthly),
    principal: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalLoanPaid + safeDown + safeTrade),
  };
}

/**
 * Calculates closed-end luxury lease monthly payment.
 * @param {Object} options
 * @param {number} options.vehiclePrice Total MSRP/agreed value
 * @param {number} options.downPayment Cap reduction down payment
 * @param {number} options.tradeIn Trade-in credit
 * @param {number} options.moneyFactor Money factor (e.g. 0.00204)
 * @param {number} options.termMonths Lease term in months (24, 36, 48)
 */
export function calculateLeasePayment({
  vehiclePrice,
  downPayment = 0,
  tradeIn = 0,
  moneyFactor = 0.00204,
  termMonths = 36,
}) {
  const safePrice = Math.max(0, Number(vehiclePrice) || 0);
  const safeDown = Math.max(0, Number(downPayment) || 0);
  const safeTrade = Math.max(0, Number(tradeIn) || 0);
  const residualRate = RESIDUAL_PERCENTAGES[termMonths] || 0.50;
  const residualValue = safePrice * residualRate;

  const capReduction = safeDown + safeTrade;
  const adjustedCapCost = Math.max(0, safePrice - capReduction);

  if (adjustedCapCost <= residualValue) {
    return {
      monthlyPayment: Math.round((adjustedCapCost * moneyFactor) * 2),
      depreciationMonthly: 0,
      rentChargeMonthly: Math.round((adjustedCapCost + residualValue) * moneyFactor),
      residualValue: Math.round(residualValue),
      totalPayments: Math.round(safeDown + safeTrade),
    };
  }

  const depreciationMonthly = (adjustedCapCost - residualValue) / termMonths;
  const rentChargeMonthly = (adjustedCapCost + residualValue) * moneyFactor;
  const totalMonthly = depreciationMonthly + rentChargeMonthly;

  return {
    monthlyPayment: Math.round(totalMonthly),
    depreciationMonthly: Math.round(depreciationMonthly),
    rentChargeMonthly: Math.round(rentChargeMonthly),
    residualValue: Math.round(residualValue),
    totalPayments: Math.round(totalMonthly * termMonths + safeDown + safeTrade),
  };
}
