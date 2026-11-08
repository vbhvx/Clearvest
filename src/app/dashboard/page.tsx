'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  Calculator, 
  Plus, 
  ArrowRight, 
  Compass, 
  Bot, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [meRes, goalsRes, portRes] = await Promise.all([
          fetch('/api/v1/me'),
          fetch('/api/v1/goals'),
          fetch('/api/v1/portfolio/summary'),
        ]);

        if (meRes.status === 401) {
          window.location.href = '/login';
          return;
        }

        const meData = await meRes.json();
        const goalsData = await goalsRes.json();
        const portData = await portRes.json();

        if (meData.success) setUserProfile(meData.data);
        if (goalsData.success) setGoals(goalsData.data);
        if (portData.success) setPortfolio(portData.data);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading your goal intelligence dashboard...</p>
      </div>
    );
  }

  const totalGoalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalGoalAccumulated = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalMonthlyCommitment = goals.reduce((acc, g) => acc + (g.plannedContribution || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {userProfile?.profile?.lossTolerance || 'MODERATE'} Loss Tolerance
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {userProfile?.profile?.investmentKnowledge || 'INTERMEDIATE'} Knowledge
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {userProfile?.profile?.fullName || 'Investor'}
          </h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Your financial intelligence console tracks long-term goals, validated monthly contributions, and asset allocation without speculative noise.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/goals"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Goal</span>
          </a>
          <a
            href="/plan"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Simulate Scenario</span>
          </a>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Financial Goals</span>
          <div className="text-2xl font-bold text-slate-900">{goals.length} Goals</div>
          <p className="text-xs text-slate-500">Target Total: {formatINR(totalGoalTarget, { compact: true })}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly SIP Planned</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{formatINR(totalMonthlyCommitment)}</div>
          <p className="text-xs text-emerald-600 font-medium">Monthly committed contributions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Valuation</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {portfolio ? formatINR(portfolio.summary.totalValuation, { compact: true }) : '₹ 0'}
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-400">Gain:</span>
            <span className="text-emerald-600 font-semibold font-mono">
              {portfolio ? formatINR(portfolio.summary.unrealizedGainLoss) : '0'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Emergency Buffer</span>
          <div className="text-2xl font-bold text-slate-900">
            {userProfile?.profile?.emergencyFundMonths || 6} Months
          </div>
          <p className="text-xs text-slate-500">
            Essential Exp: {formatINR(userProfile?.profile?.essentialMonthlyExpenses || 55000)}/mo
          </p>
        </div>
      </div>

      {/* Primary Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Goals Progress</h2>
          </div>
          <a href="/goals" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
            <span>Manage All Goals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const target = goal.targetAmount;
            const current = goal.currentAmount;
            const progress = goal.progressPct;
            const reqMonthly = goal.requiredMonthlyContribution;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {goal.goalType.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {goal.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                    {progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="bg-emerald-600 h-full rounded-full"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>{formatINR(current, { compact: true })} saved</span>
                    <span>Target: {formatINR(target, { compact: true })}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Planned Monthly SIP:</span>
                    <span className="font-semibold text-slate-900 font-mono">{formatINR(goal.plannedContribution)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required to Hit Target:</span>
                    <span className="font-semibold text-emerald-700 font-mono">{formatINR(reqMonthly)}/mo</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target Date:</span>
                    <span>{new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <a
                  href={`/goals/${goal.id}`}
                  className="block text-center py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                >
                  View Scenario Breakdown
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Portfolio & Asset Allocation Section */}
      {portfolio && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Asset Allocation</h2>
              <p className="text-xs text-slate-500">
                Diversification across broad asset classes mapped to your risk tolerance.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                SIMULATED DEMO HOLDINGS
              </span>
              <a href="/portfolio" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View Full Portfolio →
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(portfolio.assetAllocation).map(([category, val]: any) => (
              <div key={category} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{category}</span>
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  {val.percentage}%
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  {formatINR(val.value, { compact: true })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Launchpad to Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/plan"
          className="p-5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl shadow-sm transition space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition">Multi-Scenario Simulator</h3>
          <p className="text-xs text-slate-500">
            Compare baseline, favorable, and conservative return rates with Union Budget 2024 taxation.
          </p>
        </a>

        <a
          href="/explore"
          className="p-5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl shadow-sm transition space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition">Explore & Compare Products</h3>
          <p className="text-xs text-slate-500">
            Side-by-side comparisons of Index Funds, SGBs, G-Secs, and FDs with zero promotion bias.
          </p>
        </a>

        <a
          href="/assistant"
          className="p-5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl shadow-sm transition space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition">Grounded AI Explainer</h3>
          <p className="text-xs text-slate-500">
            Ask any question regarding compounding, asset allocation, or rules with SEBI and AMFI citations.
          </p>
        </a>
      </div>
    </div>
  );
}
