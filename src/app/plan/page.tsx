'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  Percent, 
  Coins, 
  Sparkles, 
  HelpCircle,
  FileText,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { calculateFutureValue, calculateTaxEstimate, generateScenarios } from '@/lib/finance/calculator';
import { formatINR } from '@/lib/formatters';

export default function PlannerPage() {
  const [currentSavings, setCurrentSavings] = useState(200000);
  const [monthlyContribution, setMonthlyContribution] = useState(25000);
  const [horizonYears, setHorizonYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12.0);
  const [inflationRate, setInflationRate] = useState(6.0);
  const [expenseRatio, setExpenseRatio] = useState(0.20); // 0.20% index fund TER
  const [timing, setTiming] = useState<'BEGINNING_OF_PERIOD' | 'END_OF_PERIOD'>('BEGINNING_OF_PERIOD');
  const [selectedAssetTax, setSelectedAssetTax] = useState<'EQUITY' | 'DEBT' | 'SGB' | 'PPF'>('EQUITY');

  // Compute live deterministic multi-scenarios
  const result = calculateFutureValue({
    currentSavings,
    monthlyContribution,
    horizonYears,
    expectedAnnualReturn: expectedReturn,
    inflationRate,
    expenseRatio,
    timing,
  });

  const scenarios = generateScenarios({
    currentSavings,
    monthlyContribution,
    horizonYears,
    expectedAnnualReturn: expectedReturn,
    inflationRate,
    expenseRatio,
    timing,
  });

  // Calculate Indian Union Budget 2024 capital gains tax estimate
  const estimatedGain = parseFloat(result.summary.estimatedGrowthEarned);
  const taxEstimate = calculateTaxEstimate({
    assetCategory: selectedAssetTax,
    gainAmount: estimatedGain,
    holdingPeriodYears: horizonYears,
    userIncomeTaxSlabPct: 30,
  });

  const nominalFv = parseFloat(result.summary.nominalFutureValue);
  const totalPrincipal = parseFloat(result.summary.totalPrincipalContributed);
  const realFv = parseFloat(result.summary.inflationAdjustedFutureValue);
  const estTaxAmt = parseFloat(taxEstimate.estimatedTax);
  const postTaxNominalFv = Math.max(0, nominalFv - estTaxAmt);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Calculator className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Deterministic Scenario Simulator</h1>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Explore sensitivity across expected returns, Indian inflation rates, fund expense ratios, and Union Budget 2024 capital gains taxes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Planning Inputs</span>
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
              Arbitrary Decimal Precision
            </span>
          </div>

          {/* Current Savings (Lump Sum) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <label>Initial Savings / Existing Capital</label>
              <span className="font-mono text-emerald-700 font-bold">{formatINR(currentSavings)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="25000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Monthly SIP */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <label>Monthly Contribution (SIP)</label>
              <span className="font-mono text-emerald-700 font-bold">{formatINR(monthlyContribution)}/mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="2500"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex gap-2 pt-1">
              {[10000, 25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setMonthlyContribution(amt)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition ${
                    monthlyContribution === amt
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {formatINR(amt, { compact: true })}
                </button>
              ))}
            </div>
          </div>

          {/* Time Horizon */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <label>Investment Horizon (Years)</label>
              <span className="font-mono text-slate-900 font-bold">{horizonYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={horizonYears}
              onChange={(e) => setHorizonYears(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Return & Inflation Assumptions */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Return (%)</label>
              <input
                type="number"
                min="1"
                max="30"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Equity ~12%, Debt ~7%</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Inflation Assumption (%)</label>
              <input
                type="number"
                min="0"
                max="15"
                step="0.5"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">RBI Target Baseline ~6%</span>
            </div>
          </div>

          {/* Expense Ratio & Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Ratio (TER %)</label>
              <input
                type="number"
                min="0"
                max="3.0"
                step="0.05"
                value={expenseRatio}
                onChange={(e) => setExpenseRatio(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Index ~0.2%, Active ~1.5%</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">SIP Timing</label>
              <select
                value={timing}
                onChange={(e: any) => setTiming(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              >
                <option value="BEGINNING_OF_PERIOD">Beginning of Month (Annuity Due)</option>
                <option value="END_OF_PERIOD">End of Month (Ordinary)</option>
              </select>
            </div>
          </div>

          {/* Tax Modeling Selector */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Union Budget 2024 Tax Category
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'EQUITY', label: 'Equity (12.5% LTCG)' },
                { id: 'DEBT', label: 'Debt (Slab)' },
                { id: 'SGB', label: 'SGB (Exempt)' },
                { id: 'PPF', label: 'PPF (EEE)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedAssetTax(t.id as any)}
                  className={`text-[10px] py-1.5 px-1 rounded border text-center transition font-semibold ${
                    selectedAssetTax === t.id
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Projection Highlight Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Projected Nominal Wealth (Before Tax)
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono mt-1">
                  {formatINR(nominalFv, { compact: true })}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">({formatINR(nominalFv)})</div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Inflation-Adjusted Purchasing Power
                </span>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1">
                  {formatINR(realFv, { compact: true })}
                </div>
                <div className="text-xs text-slate-500">In today purchasing power</div>
              </div>
            </div>

            {/* Split Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Capital Contributed</span>
                <div className="text-lg font-bold text-slate-800 font-mono">{formatINR(totalPrincipal)}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {((totalPrincipal / nominalFv) * 100).toFixed(1)}% of total outcome
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-800 block">Estimated Compound Gains</span>
                <div className="text-lg font-bold text-emerald-700 font-mono">+{formatINR(estimatedGain)}</div>
                <div className="text-[11px] text-emerald-700 mt-1">
                  {((estimatedGain / nominalFv) * 100).toFixed(1)}% compound multiplier
                </div>
              </div>
            </div>

            {/* Indian Budget 2024 Tax Estimate Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Indian Budget 2024 Tax Estimate ({selectedAssetTax})</span>
                </span>
                <span className="font-mono text-rose-700 font-bold">
                  {estTaxAmt > 0 ? `-${formatINR(estTaxAmt)}` : '₹ 0 (Exempt)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Statute:</strong> {taxEstimate.applicableLaw}
              </p>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-xs">
                <span className="font-medium text-slate-700">Estimated Post-Tax In-Hand:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{formatINR(postTaxNominalFv)}</span>
              </div>
            </div>

            {/* Sensitivity Grid */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Sensitivity Stress Test (Variance vs Baseline)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">
                    Adverse (-3%)
                  </span>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatINR(scenarios.conservative.summary.nominalFutureValue, { compact: true })}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {scenarios.metadata.conservativeReturnRate}% return
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-center space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Baseline
                  </span>
                  <div className="text-sm font-bold text-emerald-700 font-mono">
                    {formatINR(scenarios.baseline.summary.nominalFutureValue, { compact: true })}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    {scenarios.metadata.baselineReturnRate}% return
                  </span>
                </div>

                <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-800 block">
                    Favorable (+2%)
                  </span>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatINR(scenarios.favorable.summary.nominalFutureValue, { compact: true })}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {scenarios.metadata.favorableReturnRate}% return
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
