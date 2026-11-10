'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  Clock
} from 'lucide-react';

export default function PrivacyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const loadConsents = async () => {
    try {
      const res = await fetch('/api/v1/consents');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const handleRevokeConsent = async (consentId: string) => {
    if (!confirm('Are you sure you want to revoke this consent? All provider sync and data access will be stopped immediately.')) {
      return;
    }
    setRevokingId(consentId);
    try {
      const res = await fetch(`/api/v1/consents/${consentId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setNotice('Consent revoked successfully. Linked provider connections have been terminated.');
        await loadConsents();
      } else {
        alert(json.error?.message || 'Failed to revoke');
      }
    } catch {
      alert('Error during revocation');
    } finally {
      setRevokingId(null);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/v1/privacy/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'DATA_EXPORT' }),
      });
      const json = await res.json();
      if (json.success) {
        // Download as a JSON file
        const blob = new Blob([JSON.stringify(json.data.userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clearvest-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setNotice('Your personal data archive was exported successfully in machine-readable JSON format.');
        await loadConsents();
      }
    } catch {
      alert('Failed to generate export');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!confirm('Submit a formal Right to Erasure / Deletion request under Section 12 of the DPDP Act 2023? This request will be logged in the compliance audit trail.')) {
      return;
    }
    try {
      const res = await fetch('/api/v1/privacy/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'DATA_DELETION' }),
      });
      const json = await res.json();
      if (json.success) {
        setNotice('Right to Erasure request submitted. Audit Reference: ' + json.data.auditReference);
        await loadConsents();
      }
    } catch {
      alert('Error submitting deletion request');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading DPDP Act privacy portal...</div>;
  }

  const consents = data?.consents || [];
  const privacyRequests = data?.privacyRequests || [];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Lock className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Privacy, Consents & DPDP Act Rights</h1>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Full user control over personal data under India Digital Personal Data Protection Act, 2023.
        </p>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* DPDP Act 2023 Information Banner */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl space-y-3">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2>Digital Personal Data Protection Act, 2023 Compliance</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Under the DPDP Act 2023, personal financial data may only be processed for specific, informed, and unbundled purposes. You have the right to withdraw consent at any time, export your full data records in a standard portable format, and request complete erasure of non-statutory records.
        </p>
      </div>

      {/* User Actions: Export & Erase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-base">
            <Download className="w-5 h-5 text-emerald-600" />
            <h3>Export Personal Financial Data</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download a portable, machine-readable JSON copy of your profile, goals, planning scenarios, and portfolio history.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating JSON Export...' : 'Download My Data Archive'}</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-base">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h3>Right to Erasure / Deletion</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Submit a formal deletion request pursuant to Section 12 of the DPDP Act. Revokes all active consents and purges non-audited records.
          </p>
          <button
            onClick={handleDeleteRequest}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Request Account & Data Erasure</span>
          </button>
        </div>
      </div>

      {/* Active Consents Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Granted Consents & Third-Party Permissions</h2>
          <span className="text-xs text-slate-500">{consents.length} Consents Recorded</span>
        </div>

        {consents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active third-party or account aggregator consents are currently granted.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Data Categories</th>
                  <th className="py-3 px-4">Granted Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consents.map((c: any) => {
                  const isActive = c.status === 'ACTIVE';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {c.purpose.replace(/_/g, ' ')}
                        <span className="block text-[10px] text-slate-400 font-mono">{c.providerReference}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.dataCategories.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {new Date(c.grantedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {new Date(c.expiresAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isActive ? (
                          <button
                            onClick={() => handleRevokeConsent(c.id)}
                            disabled={revokingId === c.id}
                            className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition disabled:opacity-50"
                          >
                            {revokingId === c.id ? 'Revoking...' : 'Revoke'}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Revoked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Privacy Requests Table */}
      {privacyRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Privacy & Erasure Audit Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-sans">
                <tr>
                  <th className="py-3 px-4">Audit Reference</th>
                  <th className="py-3 px-4">Request Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {privacyRequests.map((r: any) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{r.auditReference || r.id}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-700">{r.requestType}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {new Date(r.requestedAt).toLocaleString('en-IN')}
                    </td>
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
