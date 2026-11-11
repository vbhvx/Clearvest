# Clearvest — Regulatory Decision Register & Compliance Framework

As a financial intelligence platform operating in India, Clearvest enforces regulatory compliance as a server-side runtime dependency. The application fails closed for any capability lacking verified approvals.

| Capability / Feature Key | Jurisdiction | Applicable Regulation | Official Source / Standard | Review Status | Enforcement Action on Server |
|---|---|---|---|---|---|
| `GOAL_PLANNING_CALCULATOR` | India | Educational / Self-Directed Tools | SEBI Investor Education Resources | **approved** | Deterministic calculations enabled; assumptions clearly shown. |
| `FINANCIAL_EDUCATION_GLOSSARY` | India | Investor Financial Education | SEBI / AMFI / NSE Investor Education Guidelines | **approved** | Educational content enabled with publisher citations. |
| `SIMULATED_PORTFOLIO_TRACKING` | India | Software tracking (Non-Custodial) | SEBI Circulars on Investment Tracking | **approved** | User-entered and simulated holdings tracked with explicit provenance. |
| `GROUNDED_AI_EXPLAINER` | India | AI / Educational RAG | SEBI / DPDP Act / Safe Harbor | **approved** | Read-only explainer over vetted public corpus; advisory tools disabled. |
| `VERIFIED_MARKET_DATA` | India | Exchange Data Redistribution Rules | NSE / BSE Market Data Agreement | **partner_required** | Fails over to clearly marked deterministic simulated feed until licensed feed active. |
| `ACCOUNT_AGGREGATOR_READ` | India | RBI Non-Banking Financial Company - Account Aggregator (NBFC-AA) Master Directions, 2016 | RBI/DNBR/2016-17/46 | **partner_required** | RBI-registered FIP/FIU partner required. Sandboxed adapter active; no live bank credential scraping. |
| `PERSONALIZED_SECURITIES_RECOMMENDATIONS` | India | SEBI (Investment Advisers) Regulations, 2013 | SEBI/LAD-NRO/GN/2012-13/31/4014 | **disabled** | **STRICTLY BLOCKED**. Advice endpoints return HTTP 403 Forbidden. |
| `LIVE_ORDER_EXECUTION` | India | SEBI Broker API & Algorithmic Trading Rules | SEBI Circular SEBI/HO/MRD/DP/CIR/P/2018/62 | **disabled** | Live orders blocked. Only sandboxed paper-trading orders allowed with multi-step preview. |
| `DATA_PROTECTION_AND_PRIVACY` | India | Digital Personal Data Protection Act, 2023 (DPDP Act) | Ministry of Law & Justice, Act No. 22 of 2023 | **approved** | Granular purpose-based consent, revocation, and export/deletion workflows active. |
