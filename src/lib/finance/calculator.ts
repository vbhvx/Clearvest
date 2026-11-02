import Decimal from 'decimal.js';

// Configure Decimal precision for financial accuracy (30 decimal digits of working precision)
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });

export const FORMULA_VERSION = '1.0.0';

export type ContributionTiming = 'BEGINNING_OF_PERIOD' | 'END_OF_PERIOD';
export type Frequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'ONE_TIME';
export type AssetClassTaxCategory = 'EQUITY' | 'DEBT' | 'SGB' | 'PPF' | 'FD';

export interface CalculationInputs {
  targetAmount?: string | number;
  currentSavings?: string | number;
  monthlyContribution?: string | number;
  horizonYears: number;
  expectedAnnualReturn: string | number; // percentage (e.g. 12 for 12%)
  inflationRate?: string | number;      // percentage (e.g. 6 for 6%)
  timing?: ContributionTiming;
  expenseRatio?: string | number;       // percentage (e.g. 0.5 for 0.5%)
}

export interface YearProjection {
  year: number;
  totalContributed: string;
  nominalWealth: string;
  inflationAdjustedWealth: string;
  growthEarned: string;
}

export interface FinancialProjectionResult {
  formulaVersion: string;
  calculatedAt: string;
  currency: string;
  inputs: {
    initialAmount: string;
    monthlyContribution: string;
    horizonYears: number;
    expectedAnnualReturn: string;
    inflationRate: string;
    timing: ContributionTiming;
    effectiveNetReturn: string;
  };
  summary: {
    totalPrincipalContributed: string;
    estimatedGrowthEarned: string;
    nominalFutureValue: string;
    inflationAdjustedFutureValue: string;
    realRateOfReturn: string;
    requiredMonthlyContributionForTarget?: string;
  };
  yearByYear: YearProjection[];
  assumptions: {
    compoundingConvention: string;
    timingConvention: string;
    inflationModel: string;
    uncertaintyNotice: string;
  };
}

export interface TaxEstimateResult {
  assetCategory: AssetClassTaxCategory;
  holdingPeriodYears: number;
  gainAmount: string;
  taxableGain: string;
  estimatedTax: string;
  effectiveTaxRate: string;
  applicableLaw: string;
  disclaimer: string;
}

/**
 * Calculates compound future value with optional recurring periodic contributions.
 * Implements standard actuarial compound interest formulas with arbitrary precision.
 */
export function calculateFutureValue(inputs: CalculationInputs): FinancialProjectionResult {
  const initial = new Decimal(inputs.currentSavings || 0);
  const monthlyPmt = new Decimal(inputs.monthlyContribution || 0);
  const annualReturnPct = new Decimal(inputs.expectedAnnualReturn || 0);
  const expenseRatioPct = new Decimal(inputs.expenseRatio || 0);
  const inflationPct = new Decimal(inputs.inflationRate || 0);
  const years = new Decimal(inputs.horizonYears || 0);
  const timing: ContributionTiming = inputs.timing || 'BEGINNING_OF_PERIOD';

  // Net annual return after expense ratio
  const netAnnualReturnPct = Decimal.max(0, annualReturnPct.minus(expenseRatioPct));
  const r = netAnnualReturnPct.dividedBy(100);
  const i = r.dividedBy(12); // Monthly nominal rate
  const inflRate = inflationPct.dividedBy(100);

  const totalMonths = years.times(12).toNumber();

  const yearByYear: YearProjection[] = [];

  let currentWealth = initial;
  let totalContributed = initial;

  for (let m = 1; m <= totalMonths; m++) {
    if (timing === 'BEGINNING_OF_PERIOD') {
      currentWealth = currentWealth.plus(monthlyPmt);
      totalContributed = totalContributed.plus(monthlyPmt);
      currentWealth = currentWealth.times(new Decimal(1).plus(i));
    } else {
      currentWealth = currentWealth.times(new Decimal(1).plus(i));
      currentWealth = currentWealth.plus(monthlyPmt);
      totalContributed = totalContributed.plus(monthlyPmt);
    }

    if (m % 12 === 0) {
      const yearIndex = m / 12;
      // Inflation adjustment factor = (1 + inflation)^yearIndex
      const inflDiscountFactor = new Decimal(1).plus(inflRate).pow(yearIndex);
      const realWealth = currentWealth.dividedBy(inflDiscountFactor);
      const growth = currentWealth.minus(totalContributed);

      yearByYear.push({
        year: yearIndex,
        totalContributed: totalContributed.toFixed(2),
        nominalWealth: currentWealth.toFixed(2),
        inflationAdjustedWealth: realWealth.toFixed(2),
        growthEarned: growth.toFixed(2),
      });
    }
  }

  // Final summary
  const finalNominalWealth = currentWealth;
  const finalDiscountFactor = new Decimal(1).plus(inflRate).pow(years);
  const finalRealWealth = finalNominalWealth.dividedBy(finalDiscountFactor);
  const totalGrowth = finalNominalWealth.minus(totalContributed);

  // Real rate of return via Fisher Equation: (1 + r) / (1 + infl) - 1
  const realRate = new Decimal(1).plus(r).dividedBy(new Decimal(1).plus(inflRate)).minus(1).times(100);

  // If a target amount was provided, calculate required monthly contribution to reach that target
  let requiredMonthlyPmt: string | undefined = undefined;
  if (inputs.targetAmount) {
    requiredMonthlyPmt = calculateTargetMonthlyContribution({
      targetAmount: inputs.targetAmount,
      currentSavings: inputs.currentSavings || 0,
      horizonYears: inputs.horizonYears,
      expectedAnnualReturn: inputs.expectedAnnualReturn,
      timing,
    });
  }

  return {
    formulaVersion: FORMULA_VERSION,
    calculatedAt: new Date().toISOString(),
    currency: 'INR',
    inputs: {
      initialAmount: initial.toFixed(2),
      monthlyContribution: monthlyPmt.toFixed(2),
      horizonYears: inputs.horizonYears,
      expectedAnnualReturn: annualReturnPct.toFixed(2),
      inflationRate: inflationPct.toFixed(2),
      timing,
      effectiveNetReturn: netAnnualReturnPct.toFixed(2),
    },
    summary: {
      totalPrincipalContributed: totalContributed.toFixed(2),
      estimatedGrowthEarned: totalGrowth.toFixed(2),
      nominalFutureValue: finalNominalWealth.toFixed(2),
      inflationAdjustedFutureValue: finalRealWealth.toFixed(2),
      realRateOfReturn: realRate.toFixed(2),
      requiredMonthlyContributionForTarget: requiredMonthlyPmt,
    },
    yearByYear,
    assumptions: {
      compoundingConvention: 'Monthly compounding using nominal periodic rate (annual rate / 12)',
      timingConvention: timing === 'BEGINNING_OF_PERIOD' ? 'Annuity Due (Contributed at start of month)' : 'Ordinary Annuity (Contributed at end of month)',
      inflationModel: 'Annual compound inflation discount factor (1 + inflation)^years',
      uncertaintyNotice: 'Simulated projections are illustrative estimates based on specified assumptions. Market returns are volatile and not guaranteed.',
    },
  };
}

/**
 * Calculates the exact monthly contribution required to hit a target amount.
 * Solves: Target = Initial * (1+i)^n + PMT * [ ((1+i)^n - 1) / i ] * (1+i) [if annuity due]
 */
export function calculateTargetMonthlyContribution(params: {
  targetAmount: string | number;
  currentSavings?: string | number;
  horizonYears: number;
  expectedAnnualReturn: string | number;
  timing?: ContributionTiming;
}): string {
  const target = new Decimal(params.targetAmount);
  const initial = new Decimal(params.currentSavings || 0);
  const years = new Decimal(params.horizonYears);
  const timing = params.timing || 'BEGINNING_OF_PERIOD';
  const n = years.times(12);

  const annualReturnPct = new Decimal(params.expectedAnnualReturn);
  const r = annualReturnPct.dividedBy(100);
  const i = r.dividedBy(12);

  // Future value of initial lump sum
  const compoundFactor = new Decimal(1).plus(i).pow(n);
  const fvOfInitial = initial.times(compoundFactor);

  const remainingTarget = target.minus(fvOfInitial);
  if (remainingTarget.lessThanOrEqualTo(0)) {
    return '0.00';
  }

  // If return rate is 0%, simple linear division
  if (i.isZero()) {
    return remainingTarget.dividedBy(n).toFixed(2);
  }

  // Annuity factor: ((1+i)^n - 1) / i
  let annuityFactor = compoundFactor.minus(1).dividedBy(i);
  if (timing === 'BEGINNING_OF_PERIOD') {
    annuityFactor = annuityFactor.times(new Decimal(1).plus(i));
  }

  const pmt = remainingTarget.dividedBy(annuityFactor);
  return Decimal.max(0, pmt).toFixed(2);
}

/**
 * Calculates the inflation-adjusted target amount needed in the future to match today's purchasing power.
 */
export function calculateInflationAdjustedTarget(
  targetInTodaysRupees: string | number,
  horizonYears: number,
  inflationRatePct: string | number
): string {
  const target = new Decimal(targetInTodaysRupees);
  const years = new Decimal(horizonYears);
  const infl = new Decimal(inflationRatePct).dividedBy(100);

  const factor = new Decimal(1).plus(infl).pow(years);
  return target.times(factor).toFixed(2);
}

/**
 * Generates Baseline, Favorable (+2%), and Adverse/Conservative (-3%) planning scenarios.
 */
export function generateScenarios(inputs: CalculationInputs) {
  const baseReturn = new Decimal(inputs.expectedAnnualReturn || 10);
  const favorableReturn = baseReturn.plus(2);
  const conservativeReturn = Decimal.max(1, baseReturn.minus(3));

  const baseline = calculateFutureValue(inputs);
  const favorable = calculateFutureValue({
    ...inputs,
    expectedAnnualReturn: favorableReturn.toString(),
  });
  const conservative = calculateFutureValue({
    ...inputs,
    expectedAnnualReturn: conservativeReturn.toString(),
  });

  return {
    baseline,
    favorable,
    conservative,
    metadata: {
      baselineReturnRate: baseReturn.toFixed(2),
      favorableReturnRate: favorableReturn.toFixed(2),
      conservativeReturnRate: conservativeReturn.toFixed(2),
      assumptionsDescription: 'Scenarios demonstrate sensitivity to market variance (+2% favorable, -3% conservative).',
    },
  };
}

/**
 * Tax estimation engine based on Indian Union Budget 2024 rules.
 */
export function calculateTaxEstimate(params: {
  assetCategory: AssetClassTaxCategory;
  gainAmount: string | number;
  holdingPeriodYears: number;
  userIncomeTaxSlabPct?: number; // default 30% for highest slab baseline
}): TaxEstimateResult {
  const gain = new Decimal(params.gainAmount);
  const slabRate = new Decimal(params.userIncomeTaxSlabPct || 30).dividedBy(100);
  const years = params.holdingPeriodYears;

  if (gain.lessThanOrEqualTo(0)) {
    return {
      assetCategory: params.assetCategory,
      holdingPeriodYears: years,
      gainAmount: gain.toFixed(2),
      taxableGain: '0.00',
      estimatedTax: '0.00',
      effectiveTaxRate: '0.00%',
      applicableLaw: 'Income Tax Act, 1961',
      disclaimer: 'No capital gains tax applicable on nil or negative returns.',
    };
  }

  let taxableGain = new Decimal(0);
  let estimatedTax = new Decimal(0);
  let lawCitation = '';

  switch (params.assetCategory) {
    case 'EQUITY':
      if (years >= 1) {
        // Long-Term Capital Gains (LTCG) post Budget 2024:
        // Exemption threshold is ₹1,25,000 per financial year; excess taxed at 12.5%
        const exemption = new Decimal(125000);
        taxableGain = Decimal.max(0, gain.minus(exemption));
        estimatedTax = taxableGain.times(0.125); // 12.5%
        lawCitation = 'Section 112A (Finance Act No. 2, 2024: LTCG at 12.5% above ₹1.25 Lakh exemption)';
      } else {
        // Short-Term Capital Gains (STCG) post Budget 2024:
        // Flat 20% on gains
        taxableGain = gain;
        estimatedTax = gain.times(0.20);
        lawCitation = 'Section 111A (Finance Act No. 2, 2024: STCG at 20%)';
      }
      break;

    case 'DEBT':
    case 'FD':
      // Taxed at investor's slab rate as per Section 50AA (for debt mutual funds acquired on/after April 1, 2023)
      taxableGain = gain;
      // Include 4% health & education cess on slab tax
      estimatedTax = gain.times(slabRate).times(1.04);
      lawCitation = 'Section 50AA (Taxed as Short Term Capital Gains at applicable income tax slab rate + 4% cess)';
      break;

    case 'SGB':
      // Sovereign Gold Bonds held to maturity (8 years) are 100% exempt from capital gains tax
      if (years >= 8) {
        taxableGain = new Decimal(0);
        estimatedTax = new Decimal(0);
        lawCitation = 'Section 47(viic) (Redemption of SGB by an individual is fully exempt from Capital Gains Tax)';
      } else {
        // If sold in secondary market after 1 year: 12.5% LTCG without indexation post Budget 2024
        taxableGain = gain;
        estimatedTax = gain.times(0.125);
        lawCitation = 'Section 112 (Secondary market transfer of SGB held > 1 year taxed at 12.5% LTCG)';
      }
      break;

    case 'PPF':
      // Public Provident Fund is EEE exempt
      taxableGain = new Decimal(0);
      estimatedTax = new Decimal(0);
      lawCitation = 'Section 10(11) (Exempt-Exempt-Exempt: Interest and maturity withdrawals are 100% tax exempt)';
      break;
  }

  const effectiveRate = estimatedTax.dividedBy(gain).times(100);

  return {
    assetCategory: params.assetCategory,
    holdingPeriodYears: years,
    gainAmount: gain.toFixed(2),
    taxableGain: taxableGain.toFixed(2),
    estimatedTax: estimatedTax.toFixed(2),
    effectiveTaxRate: `${effectiveRate.toFixed(2)}%`,
    applicableLaw: lawCitation,
    disclaimer: 'Tax estimates are illustrative per Indian Finance Act 2024. Actual tax depends on individual deductions, surcharge, and tax regime (Old vs New). Consult a Chartered Accountant for professional filing.',
  };
}
