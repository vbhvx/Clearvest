'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Target, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  Lock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { calculateFutureValue } from '@/lib/finance/calculator';
import { formatINR } from '@/lib/formatters';

export default function LandingPage() {
  // Quick Planner State right on the home page
  const [monthlySip, setMonthlySip] = useState(15000);
  const [horizonYears, setHorizonYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);

  const quickCalc = calculateFutureValue({
    monthlyContribution: monthlySip,
    horizonYears: horizonYears,
    expectedAnnualReturn: expectedReturn,
    inflationRate: inflationRate,
    timing: 'BEGINNING_OF_PERIOD',
  });

  const nominalFv = parseFloat(quickCalc.summary.nominalFutureValue);
  const principal = parseFloat(quickCalc.summary.totalPrincipalContributed);
  const growth = parseFloat(quickCalc.summary.estimatedGrowthEarned);
  const realFv = parseFloat(quickCalc.summary.inflationAdjustedFutureValue);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-4 space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>India-First • Goal-Driven • Source-Grounded</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Invest with <span className="text-emerald-600">clarity</span>, <br className="hidden sm:block" />
          not market intimidation.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Avoid the trading casino. Clearvest replaces noisy stock tickers and gamified speculation with personal financial goals, deterministic math, and plain-language transparency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 transition"
          >
            <span>Explore Demo Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/plan"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Launch Full Scenario Simulator</span>
          </a>
        </div>
      </section>

      {/* Interactive Quick Planner Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Target className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Interactive Goal & Wealth Simulator
              </h2>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Test how monthly contributions compound over time with realistic Indian inflation adjustments.
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-mono px-3 py-1 rounded-full self-start md:self-auto">
            Formula: v1.0.0 (Nominal Compound Monthly)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700">Monthly Contribution (SIP)</label>
                <span className="text-base font-bold text-emerald-700 font-mono">{formatINR(monthlySip)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[5000, 15000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMonthlySip(amt)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition ${
                      monthlySip === amt ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {formatINR(amt, { compact: true })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700">Time Horizon (Years)</label>
                <span className="text-base font-bold text-slate-900 font-mono">{horizonYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[3, 5, 10, 15, 20].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setHorizonYears(yr)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition ${
                      horizonYears === yr ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Return (%)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                  <span className="text-xs text-slate-500 font-medium">p.a.</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Inflation Assumption (%)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                  <span className="text-xs text-slate-500 font-medium">p.a.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary & Visualization */}
          <div className="lg:col-span-6 bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Estimated Nominal Wealth</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                  {formatINR(nominalFv, { compact: true })}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Money You Contribute:</span>
                  <span className="font-semibold text-slate-900 font-mono">{formatINR(principal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Estimated Compound Growth:</span>
                  <span className="font-semibold text-emerald-600 font-mono">+{formatINR(growth)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-medium flex items-center space-x-1">
                    <span>Inflation-Adjusted Purchasing Power:</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono">{formatINR(realFv, { compact: true })}</span>
                </div>
              </div>

              {/* Progress bar visualizer */}
              <div className="pt-2">
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(principal / nominalFv) * 100}%` }}
                    className="bg-slate-400 h-full"
                    title={`Principal: ${formatINR(principal)}`}
                  ></div>
                  <div
                    style={{ width: `${(growth / nominalFv) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Growth: ${formatINR(growth)}`}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                    <span>Principal ({((principal / nominalFv) * 100).toFixed(0)}%)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Growth ({((growth / nominalFv) * 100).toFixed(0)}%)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 text-[11px] text-slate-500">
              <p>
                * Fisher Real Rate of Return: <strong>{quickCalc.summary.realRateOfReturn}%</strong>. Projections assume consistent monthly contributions and constant nominal compounding. Market returns fluctuate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: The Chaos of Traditional Platforms vs Clearvest */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            A radically transparent investing paradigm
          </h2>
          <p className="text-slate-600 text-sm">
            Retail platforms optimize for trade volume and app addiction. Clearvest optimizes for investor understanding and goal achievement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Way */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-rose-700 font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3>Traditional Trading Apps</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Bombards beginners with 5,000 stocks, complex candlesticks, and derivatives.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Encourages frequent speculative trading through gamified notifications.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Hides inflation, lock-in periods, and downside volatility behind opaque returns.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Treats your bank login as a data harvesting opportunity.</span>
              </li>
            </ul>
          </div>

          {/* Clearvest Way */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3>The Clearvest Platform</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Goals First:</strong> Starts with what you need—emergency fund, retirement, or home purchase.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Deterministic Math:</strong> Exact decimal precision calculations with explicit formulas and inflation discounts.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Source-Grounded AI:</strong> Explainer citing official SEBI, RBI, and AMFI publications with canonical links.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>DPDP Act Privacy:</strong> Granular consent, one-click revocation, and complete data export.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Personal Goal Management</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Create structured milestones for Retirement, Child Education, or Emergency Funds. Track exact required monthly contributions.
          </p>
          <a href="/goals" className="inline-flex items-center space-x-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            <span>Explore Goals</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verified Investment Discovery</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Side-by-side comparison of Index Funds, SGBs, G-Secs, and FDs across expense ratios, liquidity, and Budget 2024 taxation.
          </p>
          <a href="/explore" className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <span>Discover Investments</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Regulatory Guardrails</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Server-enforced SEBI Investment Adviser and stock-broker compliance boundaries. Regulated capabilities fail closed.
          </p>
          <a href="/admin/gates" className="inline-flex items-center space-x-1 text-sm font-semibold text-purple-600 hover:text-purple-700">
            <span>View Regulatory Register</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
