'use client';

import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieIcon, 
  Plus, 
  ShieldAlert, 
  Clock, 
  Tag, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';

export default function PortfolioPage() {
  const [summary, setSummary] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Manual Holding Form State
  const [selectedInstId, setSelectedInstId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [averageBuyPrice, setAverageBuyPrice] = useState(100);

  const loadPortfolio = async () => {
    try {
      const [sumRes, holdRes, instRes] = await Promise.all([
        fetch('/api/v1/portfolio/summary'),
        fetch('/api/v1/portfolio/holdings'),
        fetch('/api/v1/instruments'),
      ]);

      if (sumRes.status === 401) {
        window.location.href = '/login';
        return;
      }

      const sumJson = await sumRes.json();
      const holdJson = await holdRes.json();
      const instJson = await instRes.json();

      if (sumJson.success) setSummary(sumJson.data);
      if (holdJson.success) setHoldings(holdJson.data);
      if (instJson.success) {
        setInstruments(instJson.data);
        if (instJson.data.length > 0) setSelectedInstId(instJson.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleAddManualHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/v1/portfolio/manual-holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentId: selectedInstId,
          quantity: Number(quantity),
          averageBuyPrice: Number(averageBuyPrice),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Failed to add manual holding');
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      await loadPortfolio();
    } catch {
      setError('Connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading portfolio holdings & provenance...</div>;
  }

  const isPositiveGain = summary && parseFloat(summary.summary.unrealizedGainLoss) >= 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <PieIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Portfolio & Holdings Visibility</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Consolidated view with explicit data provenance, quality indicators, and distinction between confirmed vs estimated values.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Manual Holding</span>
        </button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Portfolio Valuation</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {formatINR(summary.summary.totalValuation)}
            </div>
            <span className="text-xs text-slate-400">Based on latest observations</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invested Cost Basis</span>
            <div className="text-3xl font-extrabold text-slate-800 font-mono">
              {formatINR(summary.summary.totalCostBasis)}
            </div>
            <span className="text-xs text-slate-400">Net capital injected</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unrealized Capital Gain / Loss</span>
            <div className={`text-3xl font-extrabold font-mono ${isPositiveGain ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isPositiveGain ? '+' : ''}{formatINR(summary.summary.unrealizedGainLoss)}
            </div>
            <div className="flex items-center space-x-1 text-xs font-semibold">
              <span className={isPositiveGain ? 'text-emerald-600' : 'text-rose-600'}>
                {summary.summary.unrealizedGainLossPercentage}
              </span>
              <span className="text-slate-400 font-normal">(Unliquidated)</span>
            </div>
          </div>
        </div>
      )}

      {/* Asset Allocation Breakdown */}
      {summary && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Asset Class Allocation</h2>
            <span className="text-xs text-slate-500">Target Diversification</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary.assetAllocation).map(([cat, info]: any) => (
              <div key={cat} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{cat}</span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">{info.percentage}%</div>
                <div className="text-xs text-slate-600 font-mono">{formatINR(info.value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings Table with Strict Provenance */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Portfolio Holdings & Provenance</h2>
          <span className="text-xs text-slate-500">{holdings.length} Positions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Units</th>
                <th className="py-3 px-4">Avg Buy Price</th>
                <th className="py-3 px-4">Current Value</th>
                <th className="py-3 px-4">Gain / Loss</th>
                <th className="py-3 px-4">Data Provenance</th>
                <th className="py-3 px-4">Account Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {holdings.map((h) => {
                const isGain = h.unrealizedGainLoss >= 0;
                return (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900 text-xs">{h.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{h.symbol} • {h.instrumentType}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{h.quantity}</td>
                    <td className="py-3 px-4 text-slate-600">{formatINR(h.averageBuyPrice)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(h.currentValue)}</td>
                    <td className={`py-3 px-4 font-bold ${isGain ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isGain ? '+' : ''}{formatINR(h.unrealizedGainLoss)}
                      <span className="text-[10px] ml-1 font-normal text-slate-500">({h.gainLossPercentage})</span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          h.sourceType === 'SIMULATED_DEMO'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : h.sourceType === 'USER_ENTERED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {h.sourceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">{h.accountRef}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
          <strong>Notice:</strong> Portfolio values reflect latest recorded prices. Unrealized gains represent hypothetical liquidation values before statutory exit loads, brokerage fees, and Budget 2024 capital gains taxes.
        </div>
      </div>

      {/* Add Manual Holding Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add Manual Investment</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddManualHolding} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Instrument</label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {instruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Units / Quantity</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Average Buy Price (INR)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={averageBuyPrice}
                  onChange={(e) => setAverageBuyPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
