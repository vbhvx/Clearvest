'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  X,
  CheckCircle2,
  TrendingUp,
  Percent
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';
import { calculateTargetMonthlyContribution } from '@/lib/finance/calculator';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState('RETIREMENT');
  const [targetAmount, setTargetAmount] = useState(2500000);
  const [currentAmount, setCurrentAmount] = useState(100000);
  const [targetDate, setTargetDate] = useState('2032-12-31');
  const [plannedContribution, setPlannedContribution] = useState(15000);
  const [inflationAssumption, setInflationAssumption] = useState(6.0);
  const [expectedReturnRate, setExpectedReturnRate] = useState(10.0);

  const loadGoals = async () => {
    try {
      const res = await fetch('/api/v1/goals');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (data.success) {
        setGoals(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // Compute live estimated required contribution in modal
  const years = Math.max(0.5, (new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  const estimatedRequired = calculateTargetMonthlyContribution({
    targetAmount,
    currentSavings: currentAmount,
    horizonYears: years,
    expectedAnnualReturn: expectedReturnRate,
  });

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/v1/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          goalType,
          targetAmount: Number(targetAmount),
          targetCurrency: 'INR',
          targetDate,
          currentAmount: Number(currentAmount),
          plannedContribution: Number(plannedContribution),
          inflationAssumption: Number(inflationAssumption),
          expectedReturnRate: Number(expectedReturnRate),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Failed to create goal');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      resetForm();
      await loadGoals();
    } catch {
      setError('Connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setGoalType('RETIREMENT');
    setTargetAmount(2500000);
    setCurrentAmount(100000);
    setPlannedContribution(15000);
    setError('');
  };

  const applyTemplate = (type: string) => {
    setGoalType(type);
    if (type === 'EMERGENCY_SAVINGS') {
      setName('Emergency Safety Net (6 Months)');
      setTargetAmount(350000);
      setCurrentAmount(50000);
      setTargetDate('2027-12-31');
      setExpectedReturnRate(7.0);
    } else if (type === 'HOME_PURCHASE') {
      setName('Home Down Payment');
      setTargetAmount(3000000);
      setCurrentAmount(300000);
      setTargetDate('2030-06-30');
      setExpectedReturnRate(10.0);
    } else if (type === 'HIGHER_EDUCATION') {
      setName('Child Higher Education Fund');
      setTargetAmount(4000000);
      setCurrentAmount(200000);
      setTargetDate('2035-05-31');
      setExpectedReturnRate(11.5);
    } else if (type === 'RETIREMENT') {
      setName('Long-Term Financial Independence');
      setTargetAmount(30000000);
      setCurrentAmount(500000);
      setTargetDate('2045-12-31');
      setExpectedReturnRate(12.0);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Target className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Personal Financial Goals</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Goal-driven planning organizes your money by purpose, time horizon, and risk tolerance rather than speculation.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading your financial goals...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Goals Created Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Start by defining what you want to achieve financially—like an Emergency Fund or Home Purchase.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = goal.progressPct;
            const target = goal.targetAmount;
            const current = goal.currentAmount;
            const reqMonthly = goal.requiredMonthlyContribution;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      {goal.goalType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {progress}% Achieved
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{goal.name}</h3>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                      {formatINR(target, { compact: true })}
                      <span className="text-xs font-normal text-slate-500 ml-1">target</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progress}%` }}
                        className="bg-emerald-600 h-full rounded-full transition-all"
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>Saved: {formatINR(current, { compact: true })}</span>
                      <span>Remaining: {formatINR(Math.max(0, target - current), { compact: true })}</span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Planned Monthly:</span>
                      <span className="font-semibold text-slate-800 font-mono">{formatINR(goal.plannedContribution)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Required Monthly:</span>
                      <span className="font-semibold text-emerald-700 font-mono">{formatINR(reqMonthly)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Expected Return:</span>
                      <span className="font-semibold text-slate-800">{goal.expectedReturnRate}% p.a.</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Target Horizon:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <a
                    href={`/goals/${goal.id}`}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                  >
                    <span>View Scenarios & Projections</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Define a Financial Goal</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">Quick Goal Templates:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Emergency Fund', type: 'EMERGENCY_SAVINGS' },
                  { label: 'Home Purchase', type: 'HOME_PURCHASE' },
                  { label: 'Child Education', type: 'HIGHER_EDUCATION' },
                  { label: 'Retirement', type: 'RETIREMENT' },
                ].map((tpl) => (
                  <button
                    key={tpl.type}
                    type="button"
                    onClick={() => applyTemplate(tpl.type)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 transition"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dream Apartment Down Payment"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{formatINR(targetAmount)}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Current Saved (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{formatINR(currentAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Planned Monthly SIP (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={plannedContribution}
                    onChange={(e) => setPlannedContribution(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{formatINR(plannedContribution)}/mo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Return (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    value={expectedReturnRate}
                    onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Inflation Assumption (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={inflationAssumption}
                    onChange={(e) => setInflationAssumption(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              {/* Real-time Math Feedback */}
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Deterministic Math Projection
                </span>
                <div className="flex justify-between items-baseline text-xs text-emerald-900">
                  <span>Required Monthly Contribution:</span>
                  <span className="text-sm font-bold font-mono text-emerald-700">
                    {formatINR(estimatedRequired)} / month
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Calculated using nominal monthly compounding at {expectedReturnRate}% p.a. over {years.toFixed(1)} years.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Financial Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
