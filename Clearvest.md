# Master Prompt: Build an India-First, Goal-Driven Investing and Financial Intelligence Platform

## 1. Your role and mission

Act as a principal fintech software architect, senior full-stack engineer, financial systems engineer, product designer, application-security engineer, QA engineer, and AI systems engineer.

Your task is to design and implement a production-oriented, responsive web application that helps ordinary people understand their finances, plan for personal goals, explore investments, evaluate risk, and eventually invest through authorized financial partners.

The platform must be designed for **India first, with an architecture that supports international expansion**.

The core problem is:

> Retail investors avoid financial markets because investment platforms focus on products, trading interfaces, and complex terminology rather than personal goals. Users must educate themselves through scattered and sometimes conflicting online resources, leaving them confused, under-confident, and intimidated by financial risk.

Build a goal-first financial platform that helps users understand their options, see how financial decisions relate to their circumstances, compare meaningful alternatives, and make informed decisions.

This is not simply a stock-tracking dashboard, financial calculator, educational blog, or chatbot. It is a coherent financial intelligence platform that connects personal goals, financial planning, verified market information, portfolio visibility, understandable explanations, and authorized investing workflows.

**Do not stop at generating a plan, UI mockup, or list of recommendations.** Inspect the existing repository, establish a practical implementation plan, and build a working application with actual persistence, validated calculations, functioning workflows, automated tests, and deployment instructions.

If a requested feature depends on a missing credential, unavailable API, commercial agreement, legal approval, or regulated partner, implement the correct integration boundary and a clearly labeled sandbox where possible. Never fabricate the missing dependency.

---

## 2. Product principles

Every architectural, financial, and interface decision must follow these principles.

### 2.1 Goals before products

The primary user journey starts with questions such as:

- What am I trying to achieve financially?
- When do I need the money?
- How much have I saved already?
- How much can I realistically contribute?
- How much uncertainty or loss can I withstand?
- Which financial concepts should I understand before choosing an investment?

Do not start with an overwhelming list of stocks, funds, market indicators, trading features, or financial jargon.

### 2.2 Explain before recommending

Every financial concept, projection, comparison, or permitted recommendation must explain the reasoning behind it in plain language.

For example, do not merely display an expected future amount. Show the current amount, recurring contribution, timeframe, assumed growth rate, inflation assumption, fees, applicable taxes where reliably modeled, and uncertainty.

Never imply that a projection is a guaranteed outcome.

### 2.3 Confidence through transparency

The platform should increase user confidence through understanding, not persuasion.

It must make potential losses, liquidity restrictions, market volatility, uncertainty, opportunity costs, fees, and assumptions visible.

Do not use fear-based messaging, artificial urgency, gamification that encourages excessive trading, misleading performance charts, or manipulative notifications.

### 2.4 Data integrity before artificial intelligence

Deterministic financial services must calculate financial values.

The AI assistant may explain calculations and help users explore options, but it must not invent prices, balances, product attributes, historical returns, source citations, regulatory status, or personal financial facts.

### 2.5 User control

Users must control their goals, financial data, account connections, consent, notifications, and any actions involving their money.

The platform must never place an investment order simply because an AI conversation suggests it.

---

## 3. Scope and launch strategy

Build toward the complete product, but deliver it in independently testable phases.

### Phase A: Working planning and education platform

Implement:

- Secure user authentication and profile management.
- Goal-based financial onboarding.
- Personal financial planning tools.
- Financial literacy and plain-language explanations.
- Investment-category education.
- Investment comparisons using verified or explicitly simulated data.
- Scenario analysis and projection calculators.
- A source-grounded conversational finance assistant.
- A responsive dashboard.
- User-entered financial information.
- Clearly labeled simulated accounts, holdings, instruments, prices, and performance.
- Privacy controls, testing, and deployment documentation.

This phase must work without brokerage credentials or paid financial-data access.

### Phase B: Verified market-data integrations

Add real market-data providers only after confirming their official documentation, commercial availability, supported instruments, pricing, permitted uses, and display or redistribution rights.

Implement a provider adapter, quote freshness tracking, historical data where licensed, instrument metadata, corporate-action handling where applicable, and failure recovery.

### Phase C: Authorized financial-account connectivity

Add account connections only through verified and authorized interfaces. Depending on eligibility, product design, and partner approval, these may include suitable Account Aggregator ecosystem integrations or authorized broker integrations.

Begin with read-only access wherever possible. Implement explicit consent, token protection, connection status, permission revocation, synchronization, reconciliation, and clear source attribution.

Never request a user's bank password, broker password, OTP, or TOTP through the application's own forms to imitate a provider login.

### Phase D: Personalized investment guidance

Enable regulated personalized investment recommendations only after the applicable Indian regulatory requirements, operating model, required registration, disclosures, and any qualified partner arrangements have been reviewed and approved.

Do not assume that calling something “educational,” “AI-generated,” or “not financial advice” exempts it from applicable requirements.

### Phase E: Authorized investing and brokerage workflows

Support broker-connected portfolio management and trade execution only after confirming the selected provider's official capabilities, commercial permissions, user authorization flow, and applicable legal and regulatory requirements.

Until then, trading must remain disabled, not simulated as a successful real order. Use a separate, clearly labeled paper-trading environment when demonstrating an order lifecycle.

The application must work correctly when Phases B through E are unavailable.

---

## 4. Regulatory, legal, and operating constraints

This is a financial application. Treat regulatory compliance as an explicit launch dependency rather than assuming that code alone makes a feature permissible.

Before implementing or activating a regulated workflow, research the latest official material available at implementation time. Do not rely solely on old tutorials, third-party summaries, or model memory.

At minimum, investigate the applicability of:

- SEBI Investment Advisers Regulations.
- SEBI Research Analysts Regulations.
- Applicable stock-broker and exchange requirements, including current order-execution and API-related rules.
- Applicable algorithmic-trading requirements if any automation or strategy execution is contemplated.
- RBI requirements relevant to the selected Account Aggregator operating model.
- India's Digital Personal Data Protection Act and Rules, including the applicable phased enforcement timeline.
- Applicable KYC, AML, cybersecurity, consumer protection, recordkeeping, grievance handling, disclosure, and tax requirements.
- Data and content licensing conditions associated with the selected market-data and financial-information providers.

Maintain a regulatory decision register containing the feature, jurisdiction, applicable rule or question, official source, review date, accountable reviewer, required approval, implementation status, and evidence of approval.

For every regulated or externally dependent feature, use an explicit state such as:

`not_reviewed`, `review_required`, `partner_required`, `approval_pending`, `approved`, `disabled`.

These states must have real enforcement effects on the server. Hiding a button in the frontend is not sufficient.

### Mandatory restrictions

1. Do not offer personalized securities advice, specific buy/sell recommendations, regulated research, discretionary portfolio management, or similar services before the applicable operating model has been reviewed and authorized.
2. Do not represent this software as a registered investment adviser, broker, distributor, or other regulated entity unless that status is verified for the actual operating entity.
3. Do not assume that an Account Aggregator integration is automatically available to any software company. Verify eligibility, consent requirements, partner agreements, and the intended financial-information-user role.
4. Do not treat an Account Aggregator connection as a payment or transaction-execution mechanism.
5. Do not assume broker API credentials permit a third party to offer brokerage services to retail customers. Verify the specific partner permissions and use restrictions.
6. Do not scrape exchange websites or republish financial market data unless the source and permitted use have been established.
7. Do not claim that a free or delayed-data endpoint may be used commercially merely because it is technically accessible.
8. Do not hold, pool, transfer, or custody user funds as part of the initial application.
9. Do not implement autonomous live trading, investment execution from AI conversations, or unattended trading strategies.
10. Do not use a general disclaimer as a substitute for the required legal, licensing, registration, or partner approval.

Create a feature-eligibility matrix that identifies what can be shipped immediately, what requires an external provider, and what requires formal approval.

The application must fail closed for any capability that has not satisfied its required gates.

---

## 5. Target users and product outcomes

Design for Indian retail investors with different levels of financial knowledge.

### Primary persona: the first-time investor

This user wants to start investing but does not understand the terminology, products, processes, or risks.

They need a straightforward introduction, goal-based planning, transparent examples, and confidence to ask basic questions without feeling judged.

### Secondary persona: the emerging investor

This user already has savings or investments but struggles to connect them to personal goals, understand allocation, compare costs and risks, or see their overall financial position.

### Advanced persona: the self-directed investor

This user wants reliable market information, portfolio visibility, investment comparisons, detailed scenarios, and eventually broker-connected workflows.

Do not force every user through the same level of complexity. Use progressive disclosure so beginners see a simple explanation first and experienced users can access more detailed information.

### Core success measures

Track product outcomes such as:

- Users who successfully create a meaningful financial goal.
- Users who complete a planning scenario.
- Users who can correctly explain key trade-offs in usability tests.
- Users who return to review progress.
- Reliability and correctness of financial calculations.
- Quote freshness and provider error rates.
- Successful reconciliation of connected financial information.
- User understanding of risks and assumptions.

Do not optimize solely for trading frequency, order volume, or the amount of money users invest.

---

## 6. Functional requirements

### 6.1 Authentication and onboarding

Implement secure account creation, sign-in, sign-out, password recovery, session management, and appropriate protection for financial functions.

Support stronger authentication controls for connected accounts and sensitive actions, including MFA or passkeys where appropriate.

Onboarding should collect only data needed for the stated feature.

The user should be able to provide:

- Country and residence jurisdiction where relevant.
- Preferred language and currency.
- Financial goals and target dates.
- Current savings, assets, liabilities, and recurring contributions, when relevant.
- Existing investments, optionally entered manually.
- Approximate income and essential expenses, when needed for a planning calculation.
- Investment knowledge, time horizon, and loss tolerance where relevant.

Explain why financial information is requested and how it will be used.

Allow users to skip optional fields. If a calculation requires missing inputs, ask for them or clearly state which assumptions are being used.

Do not equate a simple risk questionnaire with a professionally validated or legally sufficient risk-profiling process.

### 6.2 Goal management

Support creation, editing, archiving, and tracking of user-defined goals.

Provide useful goal templates, including:

- Emergency savings.
- Higher education.
- Home purchase.
- Retirement.
- A major planned expense.
- Long-term wealth building.
- A custom goal.

Each goal should store the target amount, currency, creation date, target date, current allocated amount, planned recurring contribution, assumptions, status, and calculation version where applicable.

Support inflation-adjusted targets when the user elects to use an inflation assumption.

Display a breakdown of what is known, what is assumed, and what remains uncertain.

Users must be able to update their goals without losing historical scenario results.

### 6.3 Financial planning engine

Build a deterministic planning engine that answers questions such as:

- How much would I need to save each month to reach my goal?
- How much might I accumulate under different return assumptions?
- What happens if I contribute less for the next six months?
- How does inflation change the future cost of a goal?
- What happens if the goal date changes?
- What contribution would be required under a more conservative scenario?
- How much of the projected amount comes from my own contributions versus assumed growth?

Support baseline, favorable, and adverse scenarios, but explain that these are illustrative scenarios rather than probabilities or guarantees unless a separate, validated statistical model supports that interpretation.

Make assumptions editable. Never hide the return or inflation assumptions behind a single opaque number.

Use tested formulas for future value, present value, periodic contributions, target contributions, annual-to-periodic rate conversion, and date-sensitive projections.

Document the formulas and calculation conventions. Handle the first and last contribution periods consistently.

Do not silently treat an annual rate as a monthly rate or assume that an annual nominal rate is equivalent to an annual effective rate.

For any estimate that cannot be supported by available information, return an explicit uncertainty or insufficient-data status.

### 6.4 Investment discovery and education

Provide an educational discovery experience organized around user goals, investment concepts, and product characteristics rather than hype.

Potential investment categories include equities, mutual funds, ETFs, fixed-income instruments, and government securities, but only show actual instruments or products when their attributes and availability have been verified for the supported market.

The system must not imply that every product is available to every user.

Each instrument or product detail page should support relevant fields such as:

- Name, identifier, issuer, and category.
- Market and currency.
- Official documentation or source.
- Current or most recent verified value, if available.
- Price timestamp and whether the data is real-time, delayed, historical, or simulated.
- Liquidity considerations.
- Relevant expenses, charges, or fees where verified.
- Relevant risks and limitations.
- Source and last-updated time.

Do not hardcode a list of instruments and pretend it is a live security master.

### 6.5 Investment comparison

Implement a comparison workflow that explains meaningful differences between available alternatives.

Compare relevant characteristics, including costs, liquidity, diversification, volatility, time horizon, complexity, and downside scenarios when reliable information exists.

Do not rank products using unexplained scores or promote a product because a provider pays the platform.

If data is missing or definitions differ, display that limitation instead of manufacturing a comparable value.

Security-specific comparisons and personalized rankings must respect the regulatory approval gates established earlier.

### 6.6 Scenario simulator

Create an interactive calculator that lets users change assumptions and immediately see how a scenario changes.

Support variables such as:

- Initial contribution.
- Recurring contribution.
- Contribution frequency.
- Time horizon.
- Assumed nominal return.
- Inflation.
- Applicable fee assumptions.
- Optional taxes when a reviewed and versioned model is available.

Show an understandable calculation breakdown.

Use charts for scenario comparisons, but accompany each chart with clear labels and accessible text. Avoid misleading axes or visually exaggerating small differences.

Mark modeled outputs as estimates. Distinguish future nominal values from inflation-adjusted values.

### 6.7 Portfolio visibility

Provide a consolidated view of investments that the user has added manually, imported, or obtained through an authorized connection.

Show provenance for each item:

- User-entered.
- Imported from a file.
- Reported by a financial provider.
- Derived by the application's calculation engine.
- Simulated demonstration data.

Track the timestamp of the source data.

Separate confirmed facts from estimated values and derived metrics. For example, portfolio value based on the latest quote is not the same as cash that is currently available to withdraw.

Where holdings, cost basis, corporate actions, fees, dividends, settlement, or transaction histories are incomplete, disclose the limitation. Do not claim exact profit, return, tax liability, or holdings accuracy when the underlying data cannot support it.

### 6.8 Financial account connections

Build a provider-adapter framework rather than embedding the application's core logic around one institution.

For each provider, define:

- Supported accounts, data types, and instruments.
- Consent and authorization flow.
- Authentication requirements.
- Data retrieval and update mechanisms.
- Rate limits and provider errors.
- Data timestamp and freshness rules.
- Token lifecycle and revocation behavior.
- Retention, caching, and storage restrictions.
- Contract tests and sandbox availability.

A connected account must be traceable to a valid user authorization and provider identity.

Users must be able to see which connections are active, what permissions they granted, when data was last synchronized, and how to revoke access.

Never claim an account is connected because a demo response was returned.

### 6.9 Brokerage integration

Create a separate broker adapter with capabilities that may include account information, holdings, positions, order previews, order placement, order status, modifications, cancellations, and execution reports — but implement only capabilities that the selected provider officially supports and has authorized for the actual use case.

The architecture must support the complete order lifecycle:

`draft → validated → previewed → submitted → acknowledged → partially_filled → filled`

Other valid states include `rejected`, `cancel_pending`, `cancelled`, `expired`, `unknown`, and `reconciliation_required`.

The integration must account for asynchronous status changes, provider timeouts, duplicate webhooks, partial fills, rejected orders, cancellation races, stale quotes, and reconciliation mismatches.

Before a real order is submitted:

1. Confirm that all regulatory, provider, user-authorization, and operational gates are enabled.
2. Validate the account, instrument, permitted quantity, order parameters, and applicable restrictions.
3. Show an order preview and relevant fees or warnings that are supported by data.
4. Require an explicit user confirmation for that specific order.
5. Send the request from the secure backend, never directly from the browser with an embedded provider secret.
6. Use idempotency controls or an equivalent documented mechanism to prevent accidental duplicate submissions.
7. Record the provider request reference and lifecycle events.
8. Reconcile the resulting order state against authoritative provider data.

**Never blindly retry an order submission after an ambiguous timeout.** First determine whether the original request reached the provider. If the state cannot be established, mark it as unknown and require reconciliation before another submission.

The AI assistant must not possess a tool that can silently bypass this workflow.

Until the real integration is approved and configured, display a sandbox mode or disabled state. Never imply that a paper order was sent to a real exchange.

### 6.10 Recurring contributions and reminders

Support user-configured saving or contribution reminders, goal reviews, and important dates.

Do not automatically initiate a recurring payment, bank transfer, investment order, or SIP merely because the user enabled a reminder.

Any future payment or investment automation requires separate review, explicit authorization, valid provider capabilities, and the applicable controls.

---

## 7. Data-source strategy and source of truth

The product must support all three financial-data modes through explicit configuration.

### Mode A: Simulated data

Create deterministic, realistic demo fixtures.

Every simulated account, balance, instrument, quote, holding, portfolio event, and transaction must carry a source marker and a visible demo label.

Seeded data must never be mixed silently into a user's live portfolio.

Provide an easy way to reset the demo dataset without damaging real user data.

### Mode B: Verified live market data

Use a registered provider adapter.

Before enabling it, verify the actual provider, documentation, supported instruments, timestamp semantics, data freshness, commercial permissions, redistribution rights, historical coverage, and pricing.

Store the source, provider timestamp, ingestion timestamp, session status, and delay status for market observations.

Never turn an expired quote into a fresh-looking real-time quote. Display stale or unavailable status prominently.

### Mode C: Authorized financial-account connections

Connect through approved integration flows that use the appropriate consent, authorization, access controls, and partner configuration.

Do not use browser automation, screen scraping, credential collection, or unofficial interfaces to imitate an authorized connection.

Where the integration provides only periodic snapshots, do not represent them as live updates.

### Provider registry

Create a provider registry with fields such as:

`provider_id`, `provider_type`, `display_name`, `jurisdiction`, `supported_products`, `supported_data_types`, `authorization_status`, `license_status`, `official_docs_url`, `enabled_capabilities`, `freshness_policy`, `rate_limits`, `data_retention_policy`, `last_health_check_at`, and `disabled_reason`.

A provider must not be activated in production unless its required fields, credentials, permissions, and tests are complete.

### Data-provenance contract

Each externally obtained financial value must carry enough metadata to establish:

- The source.
- The subject or instrument.
- The observation time, if provided.
- The ingestion time.
- The currency and unit.
- Any known delay.
- Whether the value is raw, adjusted, calculated, or estimated.
- The validity or freshness status.

If an upstream provider changes its response format or stops providing a field, fail validation rather than silently substituting a fabricated value.

---

## 8. Financial calculation correctness

Financial correctness is a core system requirement, not a presentation detail.

### Numeric precision

- Never use JavaScript floating-point arithmetic for money, quantities, prices, costs, fees, or percentage calculations requiring financial precision.
- Use PostgreSQL `NUMERIC` columns or another deliberate decimal representation.
- Use a decimal arithmetic library such as `decimal.js` in application calculations.
- Centralize money, quantity, price, rate, and rounding operations in tested domain services.
- Use currency metadata and instrument-specific precision rules.
- Apply rounding only at documented boundaries.
- Keep unrounded calculation values internally where needed to avoid compounding rounding error.

Do not assume every currency has two minor-unit digits or that every instrument quantity is an integer.

### Currency handling

Represent every monetary value with an explicit ISO currency code.

Never add amounts in different currencies without an explicit conversion operation.

FX conversions must identify the exchange-rate source, quote convention, timestamp, conversion direction, and any fees or spread assumptions.

Separate the currency in which the user is planning a goal, the instrument's trading currency, and the currency in which a portfolio is displayed.

### Calculation provenance

Every projection should record its inputs, formula version, assumption set, currency, calculation timestamp, and output.

Calculation results must be reproducible from their saved inputs.

### Returns and performance

Distinguish concepts such as:

- Price return.
- Total return where relevant data is available.
- Unrealized gain or loss.
- Realized gain or loss.
- Cash flow.
- Portfolio valuation.
- Time-weighted return.
- Money-weighted return.

Implement a metric only when the required data and methodology are available. Clearly label estimates and incomplete results.

Do not present an account balance as total net worth or an unverified portfolio valuation as a guaranteed liquidation value.

### Tax-related outputs

Do not make tax calculations that depend on missing jurisdiction, product classification, purchase lots, holding periods, fees, or tax-rule versions.

Any supported tax computation must be based on reviewed jurisdiction-specific rules, effective dates, tested cases, and explicit assumptions.

Do not make unsupported claims that a product is tax-free, tax-efficient, or suitable for a particular tax situation.

---

## 9. Recommended technical architecture

Inspect the repository before choosing or changing frameworks. Preserve viable existing infrastructure. If the repository is empty, use the following default architecture.

### Frontend

- Next.js using the App Router.
- React and TypeScript with strict type checking.
- Tailwind CSS.
- Accessible, reusable UI components.
- Validated forms and clear error states.
- Responsive layouts for mobile, tablet, and desktop.
- Lightweight charts that represent financial information accurately.
- A shared typed client for backend APIs.

### Backend

Use a TypeScript-based modular backend with well-defined APIs and domain boundaries.

A practical starting point is either a well-structured Next.js backend or a separate Node.js API service using a framework such as Fastify. Choose one primary request-handling architecture based on the existing codebase; avoid duplicating business logic across both.

Separate financial calculations, investment domain logic, AI services, external providers, and order execution from UI components.

Use:

- PostgreSQL as the primary persistent database.
- A migration-based schema workflow.
- A tested ORM or query layer.
- Server-side runtime validation, using Zod or an equivalent schema validator.
- OpenAPI documentation for public API contracts.
- A background worker and queue where long-running synchronization or ingestion requires it.
- Redis only for justified caching, job queues, or rate-limiting requirements.
- Encrypted object storage for files where needed and permitted.
- Centralized error handling and structured application logging.

Keep the initial architecture a modular monolith unless measured needs justify additional services.

### AI infrastructure

Build the AI layer as an isolated module with an interchangeable model provider, structured responses, retrieval and citation handling, evaluation tests, and strict tool permissions.

Do not couple core money movement, financial calculations, authentication, or order-state changes to an LLM provider.

### Architectural modules

Organize the application around the following domains:

1. Identity and user profiles.
2. Goals and personal financial planning.
3. Financial calculation engine.
4. Instrument and market-data registry.
5. Investment education and content.
6. Portfolio and holdings.
7. Financial-account connections.
8. Brokerage and order lifecycle.
9. AI finance assistant.
10. Notifications.
11. Consent, privacy, and audit.
12. Provider administration and system health.

Keep modules independently testable and define clear interfaces between them.

---

## 10. Database schema

Design and implement normalized PostgreSQL migrations with appropriate constraints, indexes, foreign keys, and ownership checks.

The following table groups define the minimum conceptual schema. Add supporting tables where necessary, but document every important extension.

### Identity and privacy

**`users`**

`id`, `email`, `email_verified_at`, `status`, `created_at`, `updated_at`.

**`user_profiles`**

`user_id`, `country_code`, `preferred_currency`, `preferred_locale`, `timezone`, optional planning-profile fields, `created_at`, `updated_at`.

Keep sensitive profiling information separate from public account details.

**`consents`**

`id`, `user_id`, `provider_id`, `purpose`, `data_categories`, `consent_version`, `granted_at`, `expires_at`, `revoked_at`, `status`, `provider_reference`.

**`privacy_requests`**

`id`, `user_id`, `request_type`, `status`, `requested_at`, `completed_at`, `audit_reference`.

