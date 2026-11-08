'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldAlert,
  X,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';

export default function ExplorePage() {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  // Paper Order Sandbox State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedInstForOrder, setSelectedInstForOrder] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState(10);
  const [orderPreview, setOrderPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    async function loadInstruments() {
      try {
        const res = await fetch('/api/v1/instruments');
        const json = await res.json();
        if (json.success) {
          setInstruments(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInstruments();
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Instruments' },
    { id: 'MUTUAL_FUND', label: 'Mutual Funds' },
    { id: 'ETF', label: 'ETFs' },
    { id: 'GOLD_SGB', label: 'Sovereign Gold Bonds' },
    { id: 'GOVERNMENT_SECURITY', label: 'Government Securities (G-Sec)' },
    { id: 'FIXED_INCOME', label: 'Fixed Deposits' },
  ];

  const filtered = instruments.filter((inst) => {
    const matchesCategory = selectedCategory === 'ALL' || inst.instrumentType === selectedCategory;
    const matchesQuery = 
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare a maximum of 4 instruments simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const runComparison = async () => {
    setComparing(true);
    setCompareModalOpen(true);
    try {
      const res = await fetch('/api/v1/investments/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrumentIds: selectedForCompare }),
      });
      const json = await res.json();
      if (json.success) {
        setComparisonData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setComparing(false);
    }
  };

  const handleOpenOrder = async (inst: any) => {
    setSelectedInstForOrder(inst);
    setOrderQuantity(inst.instrumentType === 'MUTUAL_FUND' ? 50 : 10);
    setOrderModalOpen(true);
    setOrderConfirmed(false);
    setOrderSuccess(null);
    await fetchPreview(inst.id, inst.instrumentType === 'MUTUAL_FUND' ? 50 : 10);
  };

  const fetchPreview = async (instrumentId: string, quantity: number) => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/v1/orders/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentId,
          side: 'BUY',
          quantity,
          orderType: 'MARKET',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOrderPreview(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecutePaperOrder = async () => {
    if (!orderConfirmed) {
      alert('You must explicitly confirm the order preview.');
      return;
    }
    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentId: selectedInstForOrder.id,
          side: 'BUY',
          quantity: orderQuantity,
          orderType: 'MARKET',
          idempotencyKey: `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userConfirmed: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOrderSuccess(json.data);
      } else {
        alert(json.error?.message || 'Order failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Compass className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Investment Discovery & Comparison</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Discover verified instruments mapped to your time horizon, liquidity needs, and statutory tax treatments.
          </p>
        </div>

        {selectedForCompare.length >= 2 && (
          <button
            onClick={runComparison}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Layers className="w-4 h-4" />
            <span>Compare {selectedForCompare.length} Selected</span>
          </button>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  selectedCategory === c.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Instrument Catalog Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading instrument catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No instruments found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inst) => {
            const quote = inst.quote;
            const meta = inst.metadata || {};
            const isComparing = selectedForCompare.includes(inst.id);

            return (
              <div
                key={inst.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm transition flex flex-col justify-between ${
                  isComparing ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {inst.exchange}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                          {meta.category || inst.instrumentType}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug">{inst.name}</h3>
                      <span className="text-xs font-mono font-semibold text-slate-500">{inst.symbol}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Price / NAV</span>
                      <div className="text-xl font-extrabold text-slate-900 font-mono">
                        {quote ? formatINR(quote.priceOrValue, { showDecimals: true }) : 'N/A'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {quote?.isSimulated ? 'Simulated Feed' : 'Verified EOD'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {meta.description}
                  </p>

                  {/* Attributes Badges */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Expense Ratio / TER:</span>
                      <span className="font-semibold text-slate-800">
                        {meta.expenseRatio !== undefined ? `${meta.expenseRatio}%` : 'Nil'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Lock-in Period:</span>
                      <span className="font-semibold text-slate-800">
                        {meta.lockInMonths ? `${meta.lockInMonths} Months` : 'Liquid / None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Risk Profile:</span>
                      <span className="font-semibold text-slate-800">{meta.riskLevel || 'Moderate'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tax Category:</span>
                      <span className="font-semibold text-emerald-700">{meta.taxCategory}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleCompare(inst.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                      isComparing
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isComparing ? '✓ Comparing' : '+ Compare'}
                  </button>

                  <button
                    onClick={() => handleOpenOrder(inst)}
                    className="inline-flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Paper Sandbox Trade</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Side-by-Side Objective Comparison</h3>
              </div>
              <button onClick={() => setCompareModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {comparing ? (
              <div className="py-12 text-center text-slate-500 text-sm">Comparing instruments...</div>
            ) : comparisonData ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 border-b border-r border-slate-200 w-44">Attribute</th>
                        {comparisonData.comparison.map((item: any) => (
                          <th key={item.id} className="py-3 px-4 border-b border-r border-slate-200 min-w-[180px]">
                            {item.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-200">Category</td>
                        {comparisonData.comparison.map((item: any) => (
                          <td key={item.id} className="py-2.5 px-4 border-r border-slate-200 font-semibold text-slate-800">{item.category}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-200">Price / NAV</td>
                        {comparisonData.comparison.map((item: any) => (
                          <td key={item.id} className="py-2.5 px-4 border-r border-slate-200 font-mono font-bold text-slate-900">{formatINR(item.currentPriceOrNAV)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-200">Expense Ratio</td>
                        {comparisonData.comparison.map((item: any) => (
                          <td key={item.id} className="py-2.5 px-4 border-r border-slate-200 font-semibold text-slate-800">{item.expenseRatio}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-200">Lock-in Period</td>
                        {comparisonData.comparison.map((item: any) => (
                          <td key={item.id} className="py-2.5 px-4 border-r border-slate-200 text-slate-700">{item.lockInPeriod}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-200">Risk Profile</td>
                        {comparisonData.comparison.map((item: any) => (
                          <td key={item.id} className="py-2.5 px-4 border-r border-slate-200 text-slate-700">{item.riskProfile}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-200">Tax Treatment</td>
                        {comparisonData.comparison.map((item: any) => (
                          <td key={item.id} className="py-2.5 px-4 border-r border-slate-200 text-emerald-800 font-medium">{item.taxExplanation}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                  {comparisonData.disclaimer}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Paper Trading Sandbox Order Modal */}
      {orderModalOpen && selectedInstForOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Paper Trading Order Preview</h3>
              </div>
              <button onClick={() => setOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Paper Order Executed in Sandbox!</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {orderSuccess.message}
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-left space-y-1">
                  <div><strong>Provider Order ID:</strong> {orderSuccess.order.providerOrderId}</div>
                  <div><strong>Status:</strong> {orderSuccess.order.submissionStatus}</div>
                  <div><strong>Executed Price:</strong> {formatINR(orderSuccess.preview.executionPrice)}</div>
                  <div><strong>Total Costs & Taxes:</strong> {formatINR(orderSuccess.preview.costs.totalCharges)}</div>
                </div>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wider block">Sandbox Mode Notice</span>
                  <p>
                    Live real-money order routing is disabled pursuant to SEBI Broker API regulations. This preview demonstrates the exact Indian fee structure and execution lifecycle in a safe paper environment.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Instrument:</span>
                  <div className="text-base font-bold text-slate-900">{selectedInstForOrder.name}</div>
                  <div className="text-xs font-mono text-slate-600">{selectedInstForOrder.symbol} ({selectedInstForOrder.exchange})</div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Order Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => {
                      const q = Math.max(1, Number(e.target.value));
                      setOrderQuantity(q);
                      fetchPreview(selectedInstForOrder.id, q);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>

                {/* Costs breakdown */}
                {previewLoading ? (
                  <div className="py-6 text-center text-xs text-slate-500">Calculating statutory taxes...</div>
                ) : orderPreview ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">Indian Statutory Charges Breakdown</span>
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Value ({orderPreview.quantity} × {formatINR(orderPreview.executionPrice)}):</span>
                      <span className="font-mono font-semibold text-slate-900">{formatINR(orderPreview.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Securities Transaction Tax (STT 0.1%):</span>
                      <span className="font-mono">{formatINR(orderPreview.costs.securitiesTransactionTax)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Exchange Charges + SEBI Fee:</span>
                      <span className="font-mono">
                        {formatINR(Number(orderPreview.costs.exchangeTurnoverCharges) + Number(orderPreview.costs.sebiTurnoverCharges))}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Stamp Duty (0.015% BUY):</span>
                      <span className="font-mono">{formatINR(orderPreview.costs.stampDuty)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18% on charges):</span>
                      <span className="font-mono">{formatINR(orderPreview.costs.gst)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-slate-900 text-sm">
                      <span>Total Cash Required:</span>
                      <span className="font-mono text-emerald-700">{formatINR(orderPreview.netTotalCashRequired)}</span>
                    </div>
                  </div>
                ) : null}

                {/* Explicit User Confirmation */}
                <div className="flex items-start space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="confirmOrderCheck"
                    checked={orderConfirmed}
                    onChange={(e) => setOrderConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-emerald-600"
                  />
                  <label htmlFor="confirmOrderCheck" className="text-xs text-slate-700 font-medium">
                    I explicitly confirm this order simulation in the Clearvest Paper Trading Sandbox. I acknowledge this is not a live order on NSE/BSE.
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!orderConfirmed || submittingOrder || previewLoading}
                    onClick={handleExecutePaperOrder}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
                  >
                    {submittingOrder ? 'Executing in Sandbox...' : 'Confirm Paper Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
