# Clearvest — Feature Eligibility Matrix

This matrix details the operational status of every product feature, identifying what is shippable immediately, what requires an authorized external partner, and what remains legally blocked.

| Feature Area | Current Status | Operating Mode | Server Enforcement | User Notice Displayed |
|---|---|---|---|---|
| **User Authentication & Profiles** | Active | Production Ready | JWT / Bcrypt hash / HTTP-only cookies | "Data protected under DPDP Act 2023" |
| **Goal Management** | Active | Production Ready | CRUD validated with Zod, PostgreSQL persistence | "Goals are personal planning benchmarks" |
| **Deterministic Planning Engine** | Active | Production Ready | Decimal.js, validated formulas, versioned snapshots | "Projections are illustrative estimates, not guarantees" |
| **Financial Literacy & Glossary** | Active | Production Ready | Curated SEBI/RBI/AMFI investor education corpus | "Source: Official Indian Regulatory Publications" |
| **Simulated Market Data** | Active | Deterministic Sandbox | Tagged `is_simulated: true`, explicit timestamps | "Simulated Demonstration Data — Not Real-Time Exchange Quotes" |
| **Live Verified Market Data** | Pending Partner | Requires Commercial License | Provider adapter contract ready | "Requires NSE/BSE licensed feed" |
| **Manual Holdings & Portfolio** | Active | Production Ready | Provenance tracked per holding | "User-entered and simulated holdings" |
| **Account Aggregator (AA)** | Sandbox Mode | RBI AA Sandbox Adapter | Simulated FIU consent & fetch lifecycle | "Sandbox Account Aggregator Environment" |
| **Personalized Stock Advice** | Disabled | Blocked by SEBI IA Regulations | Route returns 403 `ADVICE_DISABLED` | "Clearvest is an educational platform and not a SEBI-registered Investment Adviser" |
| **Broker Order Placement** | Sandbox Mode | Paper Trading Sandbox | Order intent -> Preview -> User Confirmation -> Fill | "Paper Trading Sandbox — No real money or exchange order" |
| **Data Privacy & Consents** | Active | DPDP Act 2023 Compliant | Consent revocation & privacy requests | "Full user control over personal financial data" |
