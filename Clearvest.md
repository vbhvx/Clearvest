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

