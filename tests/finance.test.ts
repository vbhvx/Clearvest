import { describe, it, expect } from 'vitest';
import {
  calculateFutureValue,
  calculateTargetMonthlyContribution,
  calculateInflationAdjustedTarget,
  calculateTaxEstimate,
  generateScenarios,
} from '../src/lib/finance/calculator';
import { formatINR, formatPercentage } from '../src/lib/formatters';

describe('Financial Calculation Engine — Accuracy & Invariants', () => {
  describe('Future Value Calculations', () => {
    it('known-answer test: Zero return scenario must not manufacture investment gains', () => {
      const result = calculateFutureValue({
        currentSavings: 50000,
        monthlyContribution: 5000,
        horizonYears: 5,
        expectedAnnualReturn: 0,
        inflationRate: 0,
      });

      // Total contributed: 50,000 + (5,000 * 60) = 3,50,000
      expect(result.summary.totalPrincipalContributed).toBe('350000.00');
      expect(result.summary.estimatedGrowthEarned).toBe('0.00');
      expect(result.summary.nominalFutureValue).toBe('350000.00');
    });

    it('known-answer test: Zero contribution with lump sum compounding', () => {
      const result = calculateFutureValue({
        currentSavings: 100000,
        monthlyContribution: 0,
        horizonYears: 1,
        expectedAnnualReturn: 12, // 1% per month compound
        inflationRate: 0,
        timing: 'END_OF_PERIOD',
      });

      // 100000 * (1 + 0.01)^12 = 112682.503...
      const fv = parseFloat(result.summary.nominalFutureValue);
      expect(fv).toBeCloseTo(112682.50, 1);
      expect(result.summary.totalPrincipalContributed).toBe('100000.00');
    });

    it('SIP known-answer test: Monthly SIP of 10,000 for 10 years at 12%', () => {
      const result = calculateFutureValue({
        currentSavings: 0,
        monthlyContribution: 10000,
        horizonYears: 10,
        expectedAnnualReturn: 12,
        inflationRate: 6,
        timing: 'BEGINNING_OF_PERIOD',
      });

      // 120 months of 10k: Total principal = 12,00,000
      expect(result.summary.totalPrincipalContributed).toBe('1200000.00');

      const nominalWealth = parseFloat(result.summary.nominalFutureValue);
      // Future value of 10k SIP for 10 yrs @ 12% is ~23.23 Lakhs
      expect(nominalWealth).toBeGreaterThan(2300000);
      expect(nominalWealth).toBeLessThan(2350000);

      // Inflation-adjusted wealth must be less than nominal wealth
      const realWealth = parseFloat(result.summary.inflationAdjustedFutureValue);
      expect(realWealth).toBeLessThan(nominalWealth);

      // Invariant check: realWealth * (1 + 0.06)^10 ~= nominalWealth
      const expectedReal = nominalWealth / Math.pow(1.06, 10);
      expect(realWealth).toBeCloseTo(expectedReal, 0);
    });

    it('Target contribution solves accurately to hit goal', () => {
      const target = 1000000; // 10 Lakhs
      const horizonYears = 5;
      const expectedReturn = 12;

      const requiredPmt = calculateTargetMonthlyContribution({
        targetAmount: target,
        currentSavings: 0,
        horizonYears,
        expectedAnnualReturn: expectedReturn,
        timing: 'BEGINNING_OF_PERIOD',
      });

      // Now verify that contributing this amount results in the target
      const fvResult = calculateFutureValue({
        currentSavings: 0,
        monthlyContribution: requiredPmt,
        horizonYears,
        expectedAnnualReturn: expectedReturn,
        timing: 'BEGINNING_OF_PERIOD',
      });

      const finalFv = parseFloat(fvResult.summary.nominalFutureValue);
      expect(finalFv).toBeCloseTo(target, -1); // within 10 rupees of 10 lakhs
    });

    it('Inflation-adjusted target calculation correctly scales future cost', () => {
      // 50 Lakhs today in 10 years with 6% inflation
      const inflated = calculateInflationAdjustedTarget(5000000, 10, 6);
      const expected = 5000000 * Math.pow(1.06, 10);
      expect(parseFloat(inflated)).toBeCloseTo(expected, 0);
    });

    it('Scenario generation produces baseline, favorable (+2%), and conservative (-3%) values', () => {
      const scenarios = generateScenarios({
        currentSavings: 100000,
        monthlyContribution: 10000,
        horizonYears: 5,
        expectedAnnualReturn: 12,
        inflationRate: 6,
      });

      const consFv = parseFloat(scenarios.conservative.summary.nominalFutureValue);
      const baseFv = parseFloat(scenarios.baseline.summary.nominalFutureValue);
      const favFv = parseFloat(scenarios.favorable.summary.nominalFutureValue);

      expect(consFv).toBeLessThan(baseFv);
      expect(baseFv).toBeLessThan(favFv);
    });
  });

  describe('Indian Union Budget 2024 Tax Calculations', () => {
    it('Equity LTCG: Applies 12.5% tax on gains above ₹1.25 Lakh exemption', () => {
      const tax = calculateTaxEstimate({
        assetCategory: 'EQUITY',
        gainAmount: 200000, // 2 Lakhs gain
        holdingPeriodYears: 2, // LTCG
      });

      // Exemption: 1.25L, Taxable: 75,000, Tax at 12.5% = 9,375
      expect(tax.taxableGain).toBe('75000.00');
      expect(tax.estimatedTax).toBe('9375.00');
      expect(tax.applicableLaw).toContain('Section 112A');
    });

    it('Equity LTCG: Zero tax if gain is under ₹1.25 Lakh threshold', () => {
      const tax = calculateTaxEstimate({
        assetCategory: 'EQUITY',
        gainAmount: 100000,
        holdingPeriodYears: 2,
      });

      expect(tax.taxableGain).toBe('0.00');
      expect(tax.estimatedTax).toBe('0.00');
    });

    it('Equity STCG: Applies flat 20% tax on gains held <= 1 year', () => {
      const tax = calculateTaxEstimate({
        assetCategory: 'EQUITY',
        gainAmount: 50000,
        holdingPeriodYears: 0.5,
      });

      expect(tax.taxableGain).toBe('50000.00');
      expect(tax.estimatedTax).toBe('10000.00'); // 20% of 50,000
      expect(tax.applicableLaw).toContain('Section 111A');
    });

    it('SGB: Exempt from capital gains tax when held to maturity (8 years)', () => {
      const tax = calculateTaxEstimate({
        assetCategory: 'SGB',
        gainAmount: 300000,
        holdingPeriodYears: 8,
      });

      expect(tax.taxableGain).toBe('0.00');
      expect(tax.estimatedTax).toBe('0.00');
      expect(tax.applicableLaw).toContain('Section 47(viic)');
    });

    it('PPF: Fully exempt under Section 10(11)', () => {
      const tax = calculateTaxEstimate({
        assetCategory: 'PPF',
        gainAmount: 150000,
        holdingPeriodYears: 15,
      });

      expect(tax.taxableGain).toBe('0.00');
      expect(tax.estimatedTax).toBe('0.00');
    });

    it('Debt / FD: Taxed at slab rate plus cess', () => {
      const tax = calculateTaxEstimate({
        assetCategory: 'DEBT',
        gainAmount: 100000,
        holdingPeriodYears: 3,
        userIncomeTaxSlabPct: 30,
      });

      // 100,000 * 30% * 1.04 cess = 31,200
      expect(tax.taxableGain).toBe('100000.00');
      expect(tax.estimatedTax).toBe('31200.00');
    });
  });

  describe('Indian Number Formatters', () => {
    it('Formats numbers in standard Indian Lakh and Crore notation', () => {
      expect(formatINR(150000)).toBe('₹ 1,50,000');
      expect(formatINR(10000000)).toBe('₹ 1,00,00,000');
      expect(formatINR(1234567)).toBe('₹ 12,34,567');
      expect(formatINR(500)).toBe('₹ 500');
    });

    it('Formats numbers in compact Indian units (Lakhs & Crores)', () => {
      expect(formatINR(150000, { compact: true })).toBe('₹ 1.50 L');
      expect(formatINR(25000000, { compact: true })).toBe('₹ 2.50 Cr');
      expect(formatINR(75000, { compact: true })).toBe('₹ 75.0 K');
    });

    it('Formats percentages cleanly', () => {
      expect(formatPercentage(12.5)).toBe('12.50%');
      expect(formatPercentage(6.1234, 1)).toBe('6.1%');
    });
  });
});
