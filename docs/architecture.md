# Clearvest — Architecture & Technical Specifications

## 1. System Overview
Clearvest is an India-first, goal-driven investing and financial intelligence platform designed to empower retail investors through transparent, educational, and deterministic planning rather than speculative trading, dark patterns, or opaque advice.

The platform is designed around 6 core principles:
1. **Goals Before Products**: Every user journey starts with their objectives (Emergency, Retirement, Home, Higher Education, Wealth Building).
2. **Explain Before Recommending**: Every financial calculation exposes its formula, inflation adjustments, fees, and assumptions.
3. **Confidence Through Transparency**: Downside risks, liquidity constraints, volatility, and uncertainty are front and center.
4. **Data Integrity Before AI**: Deterministic math with arbitrary decimal precision (`decimal.js`). The AI assistant is an explainer with strict citations over vetted regulatory sources (SEBI, RBI, AMFI, NSE), not a calculation engine.
5. **User Control**: No autonomous order execution; multi-step previews, explicit confirmations, granular DPDP Act consent management.
6. **Regulatory Fail-Closed Architecture**: All regulated capabilities (personalized advice, live broker execution) are server-enforced and fail-closed if required licenses or provider approvals are missing.

---

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (Next.js 15)                   │
│   Dashboard │ Goals │ Planner │ Learn │ Explore │ Assistant │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Validated by Zod)
┌──────────────────────────────▼──────────────────────────────┐
│                    API Layer (App Router)                   │
│  /api/v1/auth   /api/v1/goals     /api/v1/scenarios         │
│  /api/v1/market /api/v1/portfolio /api/v1/assistant         │
│  /api/v1/orders /api/v1/consents  /api/v1/admin/gates       │
└──────┬───────────────────────┬──────────────────────────────┘
       │                       │
┌──────▼────────────────┐ ┌────▼──────────────────────────────┐
│ Deterministic Engine  │ │ Server-Side Feature Gates         │
│ - Decimal.js Math     │ │ - SEBI IA / RA Guardrails         │
│ - FV, PV, PMT, Target │ │ - DPDP Act Consent Engine         │
│ - Compounding & Dates │ │ - Broker Sandbox Enforcement      │
│ - Indian Tax Rules    │ │ - Audit Logging                   │
└──────┬────────────────┘ └────┬──────────────────────────────┘
       │                       │
┌──────▼───────────────────────▼──────────────────────────────┐
│                 Data & Provider Adapter Layer               │
│ - PostgreSQL 16 (Normalized Schemas, Decimal columns)       │
│ - Market Data Provider (Simulated / Verified Live)          │
│ - Account Aggregator Provider (RBI AA Sandbox / Live)       │
│ - Broker Adapter (SEBI Broker API Sandbox / Live)           │
│ - Knowledge Base (SEBI, RBI, AMFI, NSE official corpus)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Integrity & Financial Correctness Conventions
1. **Decimal Arithmetic**: All monetary quantities, prices, returns, taxes, and percentages are computed with `decimal.js` (16 decimal places of working precision, rounded only at documented presentation boundaries).
2. **Currency Rules**: Default `INR`. Strict ISO currency codes. Adding amounts across currencies is prohibited without explicit FX conversion records.
3. **Compounding Conventions**: Nominal annual rates are converted to effective monthly rates:
   $$r_{monthly} = \frac{r_{annual}}{12}$$
   or effective compound rate:
   $$r_{effective\_monthly} = (1 + r_{annual})^{1/12} - 1$$
   Clearvest documents and tests both conventions. Default standard is monthly compounding matching Indian banking and mutual fund SIP standards.
4. **Inflation Adjustment**:
   $$Real\,Return = \frac{1 + Nominal\,Return}{1 + Inflation} - 1$$
   $$Future\,Target = Target \times (1 + Inflation)^n$$
5. **Indian Taxation Modeling (Budget 2024 Rules)**:
   - Equity LTCG: 12.5% on gains exceeding ₹1,25,000 per financial year (holding > 12 months).
   - Equity STCG: 20% (holding <= 12 months).
   - Debt Funds & FDs: Taxed at user's applicable income tax slab rate.
   - SGB: Tax-free on maturity (8 years).
   - PPF: EEE (Exempt-Exempt-Exempt).
