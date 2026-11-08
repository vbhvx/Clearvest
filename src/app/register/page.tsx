'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle, HelpCircle } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lossTolerance, setLossTolerance] = useState('MODERATE');
  const [investmentKnowledge, setInvestmentKnowledge] = useState('BEGINNER');
  const [approximateMonthlyIncome, setApproximateMonthlyIncome] = useState(100000);
  const [essentialMonthlyExpenses, setEssentialMonthlyExpenses] = useState(45000);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          lossTolerance,
          investmentKnowledge,
          approximateMonthlyIncome: Number(approximateMonthlyIncome),
          essentialMonthlyExpenses: Number(essentialMonthlyExpenses),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Registration failed');
        setLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Connection failed. Please check backend server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your Clearvest Account</h1>
          <p className="text-slate-500 text-sm">
            Start planning with deterministic math and source-grounded clarity.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Investment Experience</label>
              <select
                value={investmentKnowledge}
                onChange={(e) => setInvestmentKnowledge(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="BEGINNER">Beginner (First-Time)</option>
                <option value="INTERMEDIATE">Intermediate (Has SIP/FD)</option>
                <option value="ADVANCED">Advanced (Self-Directed)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Loss Tolerance</label>
              <select
                value={lossTolerance}
                onChange={(e) => setLossTolerance(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="LOW">Low (Capital Preservation)</option>
                <option value="MODERATE">Moderate (Balanced Growth)</option>
                <option value="HIGH">High (Long-Term Equities)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Approx. Monthly Income (INR)</label>
              <input
                type="number"
                min="0"
                value={approximateMonthlyIncome}
                onChange={(e) => setApproximateMonthlyIncome(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Essential Monthly Expenses (INR)</label>
              <input
                type="number"
                min="0"
                value={essentialMonthlyExpenses}
                onChange={(e) => setEssentialMonthlyExpenses(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
            By creating an account, you acknowledge that financial data is collected solely for planning purposes under the Digital Personal Data Protection Act, 2023.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Onboarding'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-700 font-semibold hover:underline">
            Sign In here
          </a>
        </div>
      </div>
    </div>
  );
}
