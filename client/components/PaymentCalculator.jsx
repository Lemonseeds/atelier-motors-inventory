import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, DollarSign, HelpCircle, Info, ShieldCheck } from 'lucide-react';
import {
  CREDIT_TIERS,
  LEASE_TERMS,
  LOAN_TERMS,
  calculateLeasePayment,
  calculateLoanPayment,
} from '../lib/financing.js';
import { formatPrice } from '../lib/catalog.js';

export function PaymentCalculator({ vehiclePrice, className = '' }) {
  const price = Math.max(0, Number(vehiclePrice) || 0);
  const [tab, setTab] = useState('loan'); // 'loan' | 'lease'
  const [downPayment, setDownPayment] = useState(() => Math.round(price * 0.15));
  const [tradeIn, setTradeIn] = useState(0);
  const [term, setTerm] = useState(tab === 'loan' ? 48 : 36);
  const [tierIndex, setTierIndex] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const activeTier = CREDIT_TIERS[tierIndex] || CREDIT_TIERS[0];
  const maxDown = Math.max(0, Math.round(price * 0.6));

  const loanResult = calculateLoanPayment({
    vehiclePrice: price,
    downPayment,
    tradeIn,
    apr: activeTier.apr,
    termMonths: term,
  });

  const leaseResult = calculateLeasePayment({
    vehiclePrice: price,
    downPayment,
    tradeIn,
    moneyFactor: activeTier.moneyFactor,
    termMonths: Math.min(48, Math.max(24, term)),
  });

  const isLoan = tab === 'loan';
  const monthly = isLoan ? loanResult.monthlyPayment : leaseResult.monthlyPayment;

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    if (nextTab === 'lease' && !LEASE_TERMS.includes(term)) {
      setTerm(36);
    } else if (nextTab === 'loan' && !LOAN_TERMS.includes(term)) {
      setTerm(48);
    }
  };

  return (
    <div className={`border border-[#dfe4ec] bg-[#f8f9fc] p-5 sm:p-6 text-ink ${className}`}>
      {/* Header and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e7ef]">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-royal" />
          <h4 className="font-display text-sm sm:text-base font-bold tracking-tight text-ink uppercase">
            Payment Estimator
          </h4>
        </div>
        <div className="inline-flex rounded-xs bg-[#e9edf4] p-1 text-xs font-bold" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={isLoan}
            onClick={() => handleTabChange('loan')}
            className={`px-4 py-1.5 transition rounded-2xs ${
              isLoan ? 'bg-white text-ink shadow-xs' : 'text-[#627084] hover:text-ink'
            }`}
          >
            Finance (Loan)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLoan}
            onClick={() => handleTabChange('lease')}
            className={`px-4 py-1.5 transition rounded-2xs ${
              !isLoan ? 'bg-white text-ink shadow-xs' : 'text-[#627084] hover:text-ink'
            }`}
          >
            Lease
          </button>
        </div>
      </div>

      {/* Main Monthly Payment Feature Banner */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between bg-white p-4 sm:p-5 border border-[#e2e7ef] rounded-xs shadow-xs">
        <div>
          <span className="text-[10px] font-extrabold tracking-wider text-[#79889d] uppercase">
            Estimated Monthly Payment
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              {formatPrice(monthly)}
            </span>
            <span className="text-xs font-semibold text-muted">/ month</span>
          </div>
        </div>
        <div className="mt-2 sm:mt-0 text-left sm:text-right text-xs text-[#5a6a81]">
          <span className="font-semibold block text-ink">
            {term} Mo · {isLoan ? `${activeTier.apr}% Est. APR` : 'Closed-End Lease'}
          </span>
          <span>{formatPrice(price)} Total Value</span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mt-5 space-y-4 text-xs">
        {/* Down Payment Control */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="down-payment-range" className="field-label mb-0">Down Payment</label>
            <span className="font-mono font-bold text-ink">{formatPrice(downPayment)}</span>
          </div>
          <input
            id="down-payment-range"
            type="range"
            min="0"
            max={maxDown}
            step="500"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-royal h-1.5 bg-[#dbe1ea] rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>$0</span>
            <span>20% ({formatPrice(Math.round(price * 0.2))})</span>
            <span>{formatPrice(maxDown)}</span>
          </div>
        </div>

        {/* Trade-in Credit Control */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="trade-in-range" className="field-label mb-0">Trade-In Allowance (Optional)</label>
            <span className="font-mono font-bold text-ink">{formatPrice(tradeIn)}</span>
          </div>
          <input
            id="trade-in-range"
            type="range"
            min="0"
            max="40000"
            step="1000"
            value={tradeIn}
            onChange={(e) => setTradeIn(Number(e.target.value))}
            className="w-full accent-royal h-1.5 bg-[#dbe1ea] rounded cursor-pointer"
          />
        </div>

        {/* Term Selector */}
        <div>
          <label className="field-label mb-1.5">Term Length</label>
          <div className="grid grid-cols-5 gap-1.5">
            {(isLoan ? LOAN_TERMS : LEASE_TERMS).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                className={`py-2 text-center text-xs font-bold border transition ${
                  term === t
                    ? 'border-ink bg-ink text-white shadow-xs'
                    : 'border-[#dfe4ec] bg-white text-ink hover:bg-[#edf2f7]'
                }`}
              >
                {t} Mo
              </button>
            ))}
          </div>
        </div>

        {/* Credit Tier Selector */}
        <div>
          <label className="field-label mb-1.5">Credit Profile & APR</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CREDIT_TIERS.map((tier, idx) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setTierIndex(idx)}
                className={`p-2 text-left border transition text-xs ${
                  tierIndex === idx
                    ? 'border-royal bg-royal/5 font-bold text-ink'
                    : 'border-[#dfe4ec] bg-white text-muted hover:bg-[#edf2f7]'
                }`}
              >
                <div className="text-[11px] font-bold text-ink">{tier.label}</div>
                <div className="text-[10px] text-royal font-semibold mt-0.5">{tier.apr}% APR</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Breakdown Details */}
      <div className="mt-4 pt-3 border-t border-[#e2e7ef]">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center justify-between w-full text-xs font-bold text-steel hover:text-ink transition"
          aria-expanded={showBreakdown}
        >
          <span>Financial Breakdown Details</span>
          {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showBreakdown && (
          <div className="mt-3 space-y-1.5 text-xs p-3 bg-white border border-[#e5ebf3] rounded-xs animate-fade">
            <div className="flex justify-between text-[#5f6f85]">
              <span>Agreed Vehicle Value</span>
              <strong className="text-ink">{formatPrice(price)}</strong>
            </div>
            <div className="flex justify-between text-[#5f6f85]">
              <span>Down Payment & Trade-In</span>
              <strong className="text-ink">-{formatPrice(downPayment + tradeIn)}</strong>
            </div>
            {isLoan ? (
              <>
                <div className="flex justify-between text-[#5f6f85]">
                  <span>Net Amount Financed (Principal)</span>
                  <strong className="text-ink">{formatPrice(loanResult.principal)}</strong>
                </div>
                <div className="flex justify-between text-[#5f6f85]">
                  <span>Estimated Total Finance Charge</span>
                  <strong className="text-ink">{formatPrice(loanResult.totalInterest)}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#edf2f7] font-bold text-ink">
                  <span>Total Loan Cost</span>
                  <span>{formatPrice(loanResult.totalCost)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-[#5f6f85]">
                  <span>Estimated Residual Value</span>
                  <strong className="text-ink">{formatPrice(leaseResult.residualValue)}</strong>
                </div>
                <div className="flex justify-between text-[#5f6f85]">
                  <span>Monthly Depreciation</span>
                  <strong className="text-ink">{formatPrice(leaseResult.depreciationMonthly)}/mo</strong>
                </div>
                <div className="flex justify-between text-[#5f6f85]">
                  <span>Monthly Rent Charge</span>
                  <strong className="text-ink">{formatPrice(leaseResult.rentChargeMonthly)}/mo</strong>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-[#8695a7] leading-relaxed">
        Estimated payments are for illustration only and exclude taxes, title, and registration. Final terms and lease underwriting subject to approved credit with Atelier Financial Services.
      </p>
    </div>
  );
}
