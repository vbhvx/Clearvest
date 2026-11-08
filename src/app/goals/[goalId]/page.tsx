'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  Target, 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Percent, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';

export default function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const resolvedParams = use(params);
  const goalId = resolvedParams.goalId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'scenarios' | 'yearByYear' | 'history'>('scenarios');

  useEffect(() => {
    async function loadGoal() {
      try {
        const res = await fetch(`/api/v1/goals/${goalId}`);
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error?.message || 'Failed to load goal');
        }
      } catch (err) {
        setError('Connection failed');
      } finally {
        setLoading(false);
      }
    }
    loadGoal();
  }, [goalId]);

  if (loading) {
    return <div className="py-24 text-center text-slate-500 text-sm">Loading goal scenario details...</div>;
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="text-rose-600 font-bold">{error || 'Goal not found'}</div>
        <a href="/goals" className="inline-flex items-center space-x-1 text-sm text-emerald-600 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Goals</span>
        </a>
      </div>
    );
  }

  const { goal, scenariosComparison, savedScenarios } = data;
  const baseline = scenariosComparison.baseline;
  const favorable = scenariosComparison.favorable;
  const conservative = scenariosComparison.conservative;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <a
          href="/goals"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Goals</span>
        </a>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-mono">
            Formula Version: {baseline.formulaVersion}
          </span>
        </div>
      </div>

      {/* Goal Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded">
                {goal.goalType.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Target Date: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{goal.name}</h1>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Target Amount</span>
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {formatINR(goal.targetAmount, { compact: true })}
            </span>
            <span className="text-xs text-slate-500 block font-mono">({formatINR(goal.targetAmount)})</span>
          </div>
        </div>

        {/* Progress & Breakdown KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="text-xs text-slate-500 block">Current Amount Saved</span>
            <div className="text-xl font-bold text-slate-900 font-mono">{formatINR(goal.currentAmount)}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">{goal.progressPct}% of target reached</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="text-xs text-slate-500 block">Planned Monthly SIP</span>
            <div className="text-xl font-bold text-slate-900 font-mono">{formatINR(goal.plannedContribution)}</div>
            <div className="text-[11px] text-slate-500">Every month</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="text-xs text-slate-500 block">Required Monthly SIP</span>
            <div className="text-xl font-bold text-emerald-700 font-mono">{formatINR(goal.requiredMonthlyContribution)}</div>
            <div className="text-[11px] text-emerald-600 font-medium">To hit target on time</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="text-xs text-slate-500 block">Assumed Return & Inflation</span>
            <div className="text-xl font-bold text-slate-900">{goal.expectedReturnRate}% / {goal.inflationAssumption}%</div>
            <div className="text-[11px] text-slate-500">Nominal / Inflation p.a.</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'scenarios' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Scenario Sensitivity Comparison
        </button>
        <button
          onClick={() => setActiveTab('yearByYear')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'yearByYear' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Year-by-Year Growth Table
        </button>
      </div>

      {/* Tab 1: Scenarios Sensitivity Comparison */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conservative */}
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Conservative Case
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {scenariosComparison.metadata.conservativeReturnRate}% return
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Projected Future Wealth:</span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  {formatINR(conservative.summary.nominalFutureValue, { compact: true })}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Your Total Contribution:</span>
                  <span className="font-mono">{formatINR(conservative.summary.totalPrincipalContributed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Growth:</span>
                  <span className="font-mono text-emerald-600">+{formatINR(conservative.summary.estimatedGrowthEarned)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-100">
                  <span>Real Purchasing Power:</span>
                  <span className="font-mono">{formatINR(conservative.summary.inflationAdjustedFutureValue, { compact: true })}</span>
                </div>
              </div>
            </div>

            {/* Baseline */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-md space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Primary Goal Baseline
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Expected Baseline
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {scenariosComparison.metadata.baselineReturnRate}% return
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Projected Future Wealth:</span>
                <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                  {formatINR(baseline.summary.nominalFutureValue, { compact: true })}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Your Total Contribution:</span>
                  <span className="font-mono">{formatINR(baseline.summary.totalPrincipalContributed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Growth:</span>
                  <span className="font-mono text-emerald-600">+{formatINR(baseline.summary.estimatedGrowthEarned)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-100">
                  <span>Real Purchasing Power:</span>
                  <span className="font-mono">{formatINR(baseline.summary.inflationAdjustedFutureValue, { compact: true })}</span>
                </div>
              </div>
            </div>

            {/* Favorable */}
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  Favorable Case (+2%)
                </span>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {scenariosComparison.metadata.favorableReturnRate}% return
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Projected Future Wealth:</span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  {formatINR(favorable.summary.nominalFutureValue, { compact: true })}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Your Total Contribution:</span>
                  <span className="font-mono">{formatINR(favorable.summary.totalPrincipalContributed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Growth:</span>
                  <span className="font-mono text-emerald-600">+{formatINR(favorable.summary.estimatedGrowthEarned)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-100">
                  <span>Real Purchasing Power:</span>
                  <span className="font-mono">{formatINR(favorable.summary.inflationAdjustedFutureValue, { compact: true })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Assumption Disclosure */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800">Calculation Transparency Disclosure:</span>
            <p>
              • Compounding Convention: Nominal annual return compounded monthly ($i = r / 12$).
            </p>
            <p>
              • Real Purchasing Power: Computed using annual compound inflation discount factor (1 + inflation)^n.
            </p>
            <p>
              • Disclaimer: Projections are mathematical simulations and not guarantees. Market prices fluctuate.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Year by Year Growth Table */}
      {activeTab === 'yearByYear' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Total Money Contributed</th>
                  <th className="py-3 px-4">Estimated Growth Earned</th>
                  <th className="py-3 px-4">Nominal Wealth</th>
                  <th className="py-3 px-4">Real Purchasing Power ({goal.inflationAssumption}% Infl.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {baseline.yearByYear.map((row: any) => (
                  <tr key={row.year} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">Year {row.year}</td>
                    <td className="py-3 px-4 text-slate-600">{formatINR(row.totalContributed)}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">+{formatINR(row.growthEarned)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(row.nominalWealth)}</td>
                    <td className="py-3 px-4 text-slate-700">{formatINR(row.inflationAdjustedWealth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
