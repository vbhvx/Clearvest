import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Clearvest</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India-first, goal-driven financial intelligence platform. Designed to eliminate retail investor intimidation through transparent planning and verified education.
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Core Modules</h4>
            <ul className="space-y-2">
              <li><a href="/goals" className="hover:text-emerald-400 transition">Goal-Based Planning</a></li>
              <li><a href="/plan" className="hover:text-emerald-400 transition">Scenario Simulator</a></li>
              <li><a href="/explore" className="hover:text-emerald-400 transition">Investment Discovery</a></li>
              <li><a href="/portfolio" className="hover:text-emerald-400 transition">Portfolio Visibility</a></li>
              <li><a href="/assistant" className="hover:text-emerald-400 transition">Grounded AI Explainer</a></li>
            </ul>
          </div>

          {/* Regulatory & Privacy */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Governance & Privacy</h4>
            <ul className="space-y-2">
              <li><a href="/privacy" className="hover:text-emerald-400 transition">DPDP Act Privacy Rights</a></li>
              <li><a href="/admin/gates" className="hover:text-emerald-400 transition">Regulatory Decision Register</a></li>
              <li><a href="/privacy" className="hover:text-emerald-400 transition">Consent Revocation & Export</a></li>
              <li><a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-emerald-400 transition">
                <span>SEBI SCORES Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a></li>
            </ul>
          </div>

          {/* Official Indian Sources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Regulatory Corpus</h4>
            <ul className="space-y-2">
              <li><a href="https://investor.sebi.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-emerald-400 transition">
                <span>SEBI Investor Education</span>
                <ExternalLink className="w-3 h-3" />
              </a></li>
              <li><a href="https://rbiretaildirect.org.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-emerald-400 transition">
                <span>RBI Retail Direct (G-Sec/SGB)</span>
                <ExternalLink className="w-3 h-3" />
              </a></li>
              <li><a href="https://www.amfiindia.com" target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-emerald-400 transition">
                <span>AMFI Mutual Fund Knowledge</span>
                <ExternalLink className="w-3 h-3" />
              </a></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimers as required by SEBI and Indian Law */}
        <div className="pt-8 border-t border-slate-800 text-slate-500 text-[11px] leading-relaxed space-y-2">
          <p>
            <strong className="text-slate-400">Statutory Disclosure & Notice:</strong> Clearvest is an educational technology and financial calculation platform. Clearvest is NOT a SEBI-registered Investment Adviser (RIA), Research Analyst (RA), Portfolio Manager, or Stock Broker. This application does not provide personalized investment advice, stock recommendations, or live order execution.
          </p>
          <p>
            All mathematical calculations, future values, and scenario projections are deterministic estimates based on user-entered inputs and explicit assumptions. They are NOT guarantees of future performance. Mutual fund investments and equity securities are subject to market risks; please read all scheme-related documents carefully.
          </p>
          <p className="pt-2 text-slate-600">
            © {new Date().getFullYear()} Clearvest Technologies India. Aligned with the Digital Personal Data Protection Act, 2023 (DPDP Act).
          </p>
        </div>
      </div>
    </footer>
  );
}
