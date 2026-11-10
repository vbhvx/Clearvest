'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  ExternalLink, 
  Server,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function RegulatoryGatesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGates() {
      try {
        const res = await fetch('/api/v1/admin/gates');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGates();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading regulatory compliance register...</div>;
  }

  const gates = data?.regulatoryGates || [];
  const providers = data?.registeredProviders || [];
  const envModes = data?.environmentModes || {};

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
            <FileCheck2 className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Regulatory Decision Register & System Health</h1>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Server-enforced compliance boundaries across SEBI, RBI, and DPDP Act 2023 regulations.
        </p>
      </div>

      {/* System Health & Mode Badges */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Active Server Environment Configuration</span>
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
            <span>All Systems Healthy</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-400 font-sans block text-[11px]">Brokerage Mode:</span>
            <span className="font-bold text-amber-700">{envModes.brokerageMode?.toUpperCase()}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-400 font-sans block text-[11px]">Personalized Advice Mode:</span>
            <span className="font-bold text-rose-700">{envModes.personalizedAdviceMode?.toUpperCase()}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-400 font-sans block text-[11px]">Market Data Feed:</span>
            <span className="font-bold text-slate-800">{envModes.marketDataMode?.toUpperCase()}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-400 font-sans block text-[11px]">Demo Fixtures Mode:</span>
            <span className="font-bold text-emerald-700">{envModes.demoMode ? 'ENABLED (LABELED)' : 'DISABLED'}</span>
          </div>
        </div>
      </div>

      {/* Regulatory Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Regulatory Approval Matrix (SEBI & RBI)</h2>
          <span className="text-xs text-slate-500 font-mono">Fail-Closed Server Enforcement</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Feature Key</th>
                <th className="py-3 px-4">Applicable Regulation</th>
                <th className="py-3 px-4">Server Status</th>
                <th className="py-3 px-4">Official Authority / Source</th>
                <th className="py-3 px-4">Enforcement Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gates.map((g: any) => {
                const isApproved = g.status === 'approved';
                const isPartnerReq = g.status === 'partner_required';
                const isDisabled = g.status === 'disabled';

                return (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {g.featureKey}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {g.applicableRegulation}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isPartnerReq
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {g.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {g.officialSource.startsWith('http') ? (
                        <a
                          href={g.officialSource}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline flex items-center space-x-1"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span>{g.officialSource}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                      {g.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Registered External Provider Adapters</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-sans">
              <tr>
                <th className="py-3 px-4">Provider ID</th>
                <th className="py-3 px-4">Provider Type</th>
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Documentation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {providers.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-2.5 px-4 font-bold text-slate-800">{p.id}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-sans">{p.providerType}</td>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{p.displayName}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans">
                    {p.officialDocsUrl && (
                      <a href={p.officialDocsUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center space-x-1">
                        <span>Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
