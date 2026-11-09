'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle,
  FileText,
  User,
  Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    sourceTitle: string;
    publisher: string;
    canonicalUrl: string;
    section: string;
  }>;
  assumptionsUsed?: string[];
  uncertaintyDisclosures?: string[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your **Grounded Finance Explainer** on Clearvest.\n\nI can explain financial concepts, break down deterministic math formulas (SIP, compounding, inflation), read your saved goals, and explain the Union Budget 2024 capital gains tax rules.\n\nEvery response cites verified primary sources like **SEBI, RBI, and AMFI**. How can I help you plan today?',
      citations: [
        {
          sourceTitle: 'Investor Charter in Securities Market',
          publisher: 'Securities and Exchange Board of India (SEBI)',
          canonicalUrl: 'https://investor.sebi.gov.in/investor-charter.html',
          section: 'Investor Rights & Transparency',
        },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [activeMode, setActiveMode] = useState<string>('educational');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const samplePrompts = [
    'How do my active goals look and what is my monthly SIP requirement?',
    'What are the new capital gains tax rates under Budget 2024 for equity and debt?',
    'How does Rupee Cost Averaging work in a mutual fund SIP?',
    'What stock should I buy for a guaranteed 40% return next month? (Test Advisory Guardrail)',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/assistant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          mode: activeMode,
          message: text,
        }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const json = await res.json();
      if (json.success) {
        setConversationId(json.data.conversationId);
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: json.data.reply,
          citations: json.data.citations,
          assumptionsUsed: json.data.assumptionsUsed,
          uncertaintyDisclosures: json.data.uncertaintyDisclosures,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${json.error?.message || 'Could not process query.'}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        role: 'assistant',
        content: 'Connection error while communicating with Clearvest assistant.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
            <Bot className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Grounded Financial Explainer</h1>
            <p className="text-slate-500 text-xs">
              Deterministic tool-assisted explainer strictly grounded in SEBI, RBI, and AMFI publications.
            </p>
          </div>
        </div>

        {/* Operating Modes Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'educational', label: '🎓 Educational' },
            { id: 'planning', label: '🎯 Planning' },
            { id: 'personalized_advice', label: '⚖️ Advice (Gated)' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMode === mode.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-xs px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition text-left"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm min-h-[460px] flex flex-col justify-between space-y-4">
        <div className="space-y-6 flex-1 overflow-y-auto max-h-[560px] pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 text-sm leading-relaxed max-w-2xl space-y-3 ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line prose prose-sm">{m.content}</div>

                {/* Citations Box */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                      Grounding Citations & Sources:
                    </span>
                    <div className="space-y-1">
                      {m.citations.map((c, i) => (
                        <a
                          key={i}
                          href={c.canonicalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 text-emerald-700 hover:underline font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>{c.sourceTitle} — {c.publisher} ({c.section})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uncertainty & Assumptions Notice */}
                {m.assumptionsUsed && m.assumptionsUsed.length > 0 && (
                  <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                    <strong>Model Assumptions:</strong> {m.assumptionsUsed.join(' • ')}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-11">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span>Grounding response in regulatory corpus and running calculations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-3 border-t border-slate-100 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about goals, compounding, inflation, or Indian tax rules..."
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center space-x-1 shadow-sm"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
