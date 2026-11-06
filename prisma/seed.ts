import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Clearvest deterministic database seed...');

  // 1. Regulatory Approvals Register
  console.log('Seeding Regulatory Approvals...');
  const regulatoryFeatures = [
    {
      featureKey: 'GOAL_PLANNING_CALCULATOR',
      jurisdiction: 'IN',
      applicableRegulation: 'SEBI Investor Education Guidelines & Non-Advisory Planning',
      status: 'approved',
      officialSource: 'https://investor.sebi.gov.in',
      reviewedBy: 'Chief Compliance Officer',
      reviewDate: new Date('2026-01-15'),
      notes: 'Deterministic mathematical calculation of future values and target contributions with transparent assumptions.',
    },
    {
      featureKey: 'FINANCIAL_EDUCATION_GLOSSARY',
      jurisdiction: 'IN',
      applicableRegulation: 'SEBI / AMFI Investor Education Disclosures',
      status: 'approved',
      officialSource: 'https://www.amfiindia.com/investor-corner/knowledge-center',
      reviewedBy: 'Chief Compliance Officer',
      reviewDate: new Date('2026-01-15'),
      notes: 'General educational content explaining asset classes, liquidity, and compounding concepts.',
    },
    {
      featureKey: 'SIMULATED_PORTFOLIO_TRACKING',
      jurisdiction: 'IN',
      applicableRegulation: 'Non-Custodial Investment Tracking Software Guidelines',
      status: 'approved',
      officialSource: 'SEBI General Circulars on Non-Custodial Software Platforms',
      reviewedBy: 'Compliance & Legal Counsel',
      reviewDate: new Date('2026-01-20'),
      notes: 'Permitted when explicitly labeled with data provenance (User-Entered, Simulated Demo).',
    },
    {
      featureKey: 'GROUNDED_AI_EXPLAINER',
      jurisdiction: 'IN',
      applicableRegulation: 'Safe Harbor / Digital Personal Data Protection Act 2023',
      status: 'approved',
      officialSource: 'Ministry of Law and Justice, Act No. 22 of 2023',
      reviewedBy: 'Legal & Risk Committee',
      reviewDate: new Date('2026-01-25'),
      notes: 'Assistant operates as a read-only explainer citing primary sources. Advice tools strictly excluded.',
    },
    {
      featureKey: 'VERIFIED_MARKET_DATA',
      jurisdiction: 'IN',
      applicableRegulation: 'NSE / BSE Market Data Vendor Agreement',
      status: 'partner_required',
      officialSource: 'https://www.nseindia.com/market-data/real-time-data',
      reviewedBy: 'Head of Market Data',
      reviewDate: new Date('2026-02-01'),
      notes: 'Requires executed commercial distribution license with NSE Data & Analytics Ltd.',
    },
    {
      featureKey: 'ACCOUNT_AGGREGATOR_READ',
      jurisdiction: 'IN',
      applicableRegulation: 'RBI Master Direction - Non-Banking Financial Company - Account Aggregator (NBFC-AA)',
      status: 'partner_required',
      officialSource: 'RBI/DNBR/2016-17/46 Master Direction DNBR.PD.009/03.10.119/2016-17',
      reviewedBy: 'Chief Compliance Officer',
      reviewDate: new Date('2026-02-01'),
      notes: 'Requires formal FIU integration agreement with an RBI-licensed Account Aggregator entity.',
    },
    {
      featureKey: 'PERSONALIZED_SECURITIES_RECOMMENDATIONS',
      jurisdiction: 'IN',
      applicableRegulation: 'SEBI (Investment Advisers) Regulations, 2013 [SEBI/LAD-NRO/GN/2012-13/31/4014]',
      status: 'disabled',
      officialSource: 'https://www.sebi.gov.in/legal/regulations/jan-2013/sebi-investment-advisers-regulations-2013_24419.html',
      reviewedBy: 'Legal Counsel',
      reviewDate: new Date('2026-02-05'),
      notes: 'STRICTLY DISABLED. Clearvest is an educational platform and not a SEBI-registered Investment Adviser (RIA).',
    },
    {
      featureKey: 'LIVE_ORDER_EXECUTION',
      jurisdiction: 'IN',
      applicableRegulation: 'SEBI Stock Broker Regulations & Exchange API Guidelines',
      status: 'disabled',
      officialSource: 'SEBI Circular SEBI/HO/MRD/DP/CIR/P/2018/62',
      reviewedBy: 'Chief Compliance Officer',
      reviewDate: new Date('2026-02-05'),
      notes: 'Real-money orders are disabled. Only a clearly labeled Sandbox / Paper Trading environment is accessible.',
    },
  ];

  for (const reg of regulatoryFeatures) {
    await prisma.regulatoryApproval.upsert({
      where: { featureKey: reg.featureKey },
      update: reg,
      create: reg,
    });
  }

  // 2. Providers Registry
  console.log('Seeding Providers Registry...');
  const providers = [
    {
      id: 'simulated_feed',
      providerType: 'MARKET_DATA',
      displayName: 'Clearvest Deterministic Market Feed (Simulated)',
      countryCode: 'IN',
      officialDocsUrl: 'https://clearvest.in/docs/market-data-sandbox',
      status: 'approved',
      capabilities: { quotes: true, history: true, delayedMinutes: 0, isSimulated: true },
      licensingMetadata: { license: 'Internal Simulation Fixture', terms: 'Not for live exchange trade execution' },
      configurationMetadata: { updateFrequencySeconds: 60 },
    },
    {
      id: 'rbi_retail_direct',
      providerType: 'MARKET_DATA',
      displayName: 'Reserve Bank of India (RBI) Retail Direct',
      countryCode: 'IN',
      officialDocsUrl: 'https://rbiretaildirect.org.in',
      status: 'approved',
      capabilities: { governmentSecurities: true, treasuryBills: true, sovereignGoldBonds: true },
      licensingMetadata: { license: 'Official Public Sovereign Issuance Rates' },
      configurationMetadata: { issuer: 'Reserve Bank of India' },
    },
    {
      id: 'amfi_india',
      providerType: 'MARKET_DATA',
      displayName: 'Association of Mutual Funds in India (AMFI)',
      countryCode: 'IN',
      officialDocsUrl: 'https://www.amfiindia.com',
      status: 'approved',
      capabilities: { endOfDayNav: true, mutualFundRegistry: true },
      licensingMetadata: { license: 'Official Public NAV Portal' },
      configurationMetadata: { delayStatus: 'End of Day (9:00 PM IST)' },
    },
    {
      id: 'clearvest_aa_sandbox',
      providerType: 'ACCOUNT_AGGREGATOR',
      displayName: 'Clearvest Account Aggregator Sandbox (RBI AA Compliant)',
      countryCode: 'IN',
      officialDocsUrl: 'https://sahamati.org.in/account-aggregator-framework',
      status: 'approved',
      capabilities: { consentFlow: true, fiuFetch: true, mockBanks: ['HDFC', 'SBI', 'ICICI'] },
      licensingMetadata: { license: 'Sahamati Sandbox Specifications' },
      configurationMetadata: { environment: 'sandbox' },
    },
    {
      id: 'clearvest_broker_sandbox',
      providerType: 'BROKER',
      displayName: 'Clearvest Paper Trading Broker Sandbox',
      countryCode: 'IN',
      officialDocsUrl: 'https://clearvest.in/docs/broker-sandbox',
      status: 'approved',
      capabilities: { orderPreview: true, paperExecution: true, feeCalculation: true },
      licensingMetadata: { license: 'Simulated Order Routing Engine' },
      configurationMetadata: { environment: 'sandbox', maxOrderValueINR: 1000000 },
    },
  ];

  for (const prov of providers) {
    await prisma.provider.upsert({
      where: { id: prov.id },
      update: prov,
      create: prov,
    });
  }

  // 3. Investment Instruments Master Registry
  console.log('Seeding Investment Instruments Master...');
  const instruments = [
    {
      id: 'inst_nifty50_index',
      providerId: 'simulated_feed',
      providerInstrumentId: 'UTI_NIFTY50_DIR',
      symbol: 'UTINIFT50',
      name: 'UTI Nifty 50 Index Mutual Fund (Direct - Growth)',
      instrumentType: 'MUTUAL_FUND',
      exchange: 'AMFI',
      countryCode: 'IN',
      tradingCurrency: 'INR',
      quantityPrecision: 3,
      pricePrecision: 4,
      status: 'ACTIVE',
      metadata: {
        category: 'Large Cap Index Mutual Fund',
        benchmark: 'Nifty 50 TRI',
        expenseRatio: 0.18,
        exitLoad: 'Nil after 0 days',
        lockInMonths: 0,
        riskLevel: 'Very High (Market Equities)',
        taxCategory: 'EQUITY',
        description: 'Passive fund tracking India top 50 blue-chip companies by market capitalization.',
        officialUrl: 'https://www.utimf.com',
      },
    },
    {
      id: 'inst_parag_parikh_flexi',
      providerId: 'simulated_feed',
      providerInstrumentId: 'PPFAS_FLEXI_DIR',
      symbol: 'PPFASFLX',
      name: 'Parag Parikh Flexi Cap Fund (Direct - Growth)',
      instrumentType: 'MUTUAL_FUND',
      exchange: 'AMFI',
      countryCode: 'IN',
      tradingCurrency: 'INR',
      quantityPrecision: 3,
      pricePrecision: 4,
      status: 'ACTIVE',
      metadata: {
        category: 'Flexi Cap Fund',
        benchmark: 'Nifty 500 TRI',
        expenseRatio: 0.58,
        exitLoad: '2% if redeemed within 365 days; 1% between 366-730 days',
        lockInMonths: 0,
        riskLevel: 'Very High',
        taxCategory: 'EQUITY',
        description: 'Value-oriented diversified equity fund investing across large, mid, and small cap Indian and global stocks.',
        officialUrl: 'https://amc.ppfas.com',
      },
    },
    {
      id: 'inst_hdfc_nifty_etf',
      providerId: 'simulated_feed',
      providerInstrumentId: 'HDFCNIFTY',
      symbol: 'HDFCNIFTY',
      name: 'HDFC Nifty 50 ETF',
      instrumentType: 'ETF',
      exchange: 'NSE',
      countryCode: 'IN',
      tradingCurrency: 'INR',
      quantityPrecision: 0,
      pricePrecision: 2,
      status: 'ACTIVE',
      metadata: {
        category: 'Equity ETF',
        benchmark: 'Nifty 50',
        expenseRatio: 0.05,
        exitLoad: 'Nil (Traded on NSE)',
        lockInMonths: 0,
        riskLevel: 'Very High',
        taxCategory: 'EQUITY',
        description: 'Exchange-traded fund offering low-cost liquid exposure to Nifty 50 index.',
        officialUrl: 'https://www.hdfcfund.com',
      },
    },
    {
      id: 'inst_sgb_2024',
      providerId: 'rbi_retail_direct',
      providerInstrumentId: 'SGB_2024_SERIES_II',
      symbol: 'SGB2425II',
      name: 'Sovereign Gold Bond 2024-25 Series II (RBI)',
      instrumentType: 'GOLD_SGB',
      exchange: 'RBI',
      countryCode: 'IN',
      tradingCurrency: 'INR',
      quantityPrecision: 0,
      pricePrecision: 2,
      status: 'ACTIVE',
      metadata: {
        category: 'Sovereign Gold Bond',
        couponRatePct: 2.50,
        couponFrequency: 'Semi-Annually',
        tenorYears: 8,
        earlyExitYears: 5,
        lockInMonths: 60,
        riskLevel: 'Moderate (Tracks 999 purity gold price)',
        taxCategory: 'SGB',
        taxBenefit: '100% Capital Gains Tax Exemption on 8-year maturity redemption under Section 47(viic)',
        description: 'Government of India backed gold bonds providing 2.5% annual interest payout plus gold price appreciation.',
        officialUrl: 'https://rbiretaildirect.org.in',
      },
    },
    {
      id: 'inst_gsec_718_2033',
      providerId: 'rbi_retail_direct',
      providerInstrumentId: 'GS_718_2033',
      symbol: '718GS2033',
      name: '7.18% Government of India Security 2033',
      instrumentType: 'GOVERNMENT_SECURITY',
      exchange: 'RBI',
      countryCode: 'IN',
      tradingCurrency: 'INR',
      quantityPrecision: 0,
      pricePrecision: 2,
      status: 'ACTIVE',
      metadata: {
        category: 'Sovereign Fixed Income (G-Sec)',
        couponRatePct: 7.18,
        maturityYear: 2033,
        lockInMonths: 0,
        riskLevel: 'Sovereign Risk-Free (Zero default risk)',
        taxCategory: 'DEBT',
        description: 'Direct sovereign paper issued by Government of India with guaranteed coupon payments.',
        officialUrl: 'https://rbiretaildirect.org.in',
      },
    },
    {
      id: 'inst_sbi_fd_1yr',
      providerId: 'simulated_feed',
      providerInstrumentId: 'SBI_TERM_DEPOSIT_1Y',
      symbol: 'SBIFD1Y',
      name: 'State Bank of India 1-Year Term Deposit',
      instrumentType: 'FIXED_INCOME',
      exchange: 'BSE',
      countryCode: 'IN',
      tradingCurrency: 'INR',
      quantityPrecision: 0,
      pricePrecision: 2,
      status: 'ACTIVE',
      metadata: {
        category: 'Bank Fixed Deposit',
        interestRatePct: 6.80,
        seniorCitizenRatePct: 7.30,
        compounding: 'Quarterly',
        lockInMonths: 12,
        riskLevel: 'Low (DICGC insured up to ₹5 Lakh)',
        taxCategory: 'FD',
        description: 'Guaranteed capital preservation deposit with India largest public sector bank.',
        officialUrl: 'https://sbi.co.in',
      },
    },
  ];

  for (const inst of instruments) {
    await prisma.instrument.upsert({
      where: { id: inst.id },
      update: inst,
      create: inst,
    });
  }

  // 4. Market Observations (Simulated & Verified Quotes)
  console.log('Seeding Market Observations...');
  const quotes = [
    {
      instrumentId: 'inst_nifty50_index',
      providerId: 'simulated_feed',
      observationType: 'NAV',
      priceOrValue: 184.5241,
      currency: 'INR',
      sourceTimestamp: new Date(),
      isDelayed: false,
      isSimulated: true,
      validityStatus: 'VALID',
      metadata: { dayChangePct: 0.42, previousClose: 183.75 },
    },
    {
      instrumentId: 'inst_parag_parikh_flexi',
      providerId: 'simulated_feed',
      observationType: 'NAV',
      priceOrValue: 82.1450,
      currency: 'INR',
      sourceTimestamp: new Date(),
      isDelayed: false,
      isSimulated: true,
      validityStatus: 'VALID',
      metadata: { dayChangePct: 0.28, previousClose: 81.91 },
    },
    {
      instrumentId: 'inst_hdfc_nifty_etf',
      providerId: 'simulated_feed',
      observationType: 'LAST_PRICE',
      priceOrValue: 268.40,
      currency: 'INR',
      sourceTimestamp: new Date(),
      isDelayed: false,
      isSimulated: true,
      validityStatus: 'VALID',
      metadata: { dayChangePct: 0.35, previousClose: 267.45 },
    },
    {
      instrumentId: 'inst_sgb_2024',
      providerId: 'rbi_retail_direct',
      observationType: 'LAST_PRICE',
      priceOrValue: 7260.00,
      currency: 'INR',
      sourceTimestamp: new Date(),
      isDelayed: true,
      isSimulated: false,
      validityStatus: 'VALID',
      metadata: { denomination: '1 gram of gold (999 purity)' },
    },
    {
      instrumentId: 'inst_gsec_718_2033',
      providerId: 'rbi_retail_direct',
      observationType: 'LAST_PRICE',
      priceOrValue: 100.45,
      currency: 'INR',
      sourceTimestamp: new Date(),
      isDelayed: true,
      isSimulated: false,
      validityStatus: 'VALID',
      metadata: { yieldToMaturityPct: 7.12 },
    },
    {
      instrumentId: 'inst_sbi_fd_1yr',
      providerId: 'simulated_feed',
      observationType: 'LAST_PRICE',
      priceOrValue: 100.00,
      currency: 'INR',
      sourceTimestamp: new Date(),
      isDelayed: false,
      isSimulated: true,
      validityStatus: 'VALID',
      metadata: { interestYield: '6.80% p.a.' },
    },
  ];

  for (const q of quotes) {
    await prisma.marketObservation.create({
      data: q,
    });
  }

  // 5. Official Knowledge Sources (SEBI, RBI, AMFI, NSE)
  console.log('Seeding Knowledge Sources and Chunks...');
  const sebiCharter = await prisma.knowledgeSource.upsert({
    where: { id: 'ks_sebi_investor_charter' },
    update: {},
    create: {
      id: 'ks_sebi_investor_charter',
      sourceType: 'SEBI_REGULATION',
      title: 'Investor Charter in Securities Market',
      canonicalUrl: 'https://investor.sebi.gov.in/investor-charter.html',
      publisher: 'Securities and Exchange Board of India (SEBI)',
      publishedAt: new Date('2021-11-17'),
      licenseStatus: 'OFFICIAL_PUBLIC',
      reviewStatus: 'VERIFIED',
      contentVersion: '2024-v1',
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        knowledgeSourceId: sebiCharter.id,
        chunkIndex: 0,
        topic: 'Rights of Retail Investors',
        content: 'Investors have the right to get fair and transparent treatment, prompt redressal of grievances via SCORES portal, and true disclosures regarding risk, past performance, and fee structures from all registered market participants.',
      },
      {
        knowledgeSourceId: sebiCharter.id,
        chunkIndex: 1,
        topic: 'Risk Awareness & Responsibilities',
        content: 'Investors must assess their risk tolerance and financial goals before choosing an investment. Past performance does not guarantee future results. Investors must never share OTPs, passwords, or Demat credentials with unauthorized parties.',
      },
    ],
  });

  const amfiGuide = await prisma.knowledgeSource.upsert({
    where: { id: 'ks_amfi_sip_guide' },
    update: {},
    create: {
      id: 'ks_amfi_sip_guide',
      sourceType: 'AMFI_GUIDE',
      title: 'Systematic Investment Plan (SIP) Compounding Guide',
      canonicalUrl: 'https://www.amfiindia.com/investor-corner/knowledge-center/systematic-investment-plan.html',
      publisher: 'Association of Mutual Funds in India (AMFI)',
      publishedAt: new Date('2023-05-10'),
      licenseStatus: 'OFFICIAL_PUBLIC',
      reviewStatus: 'VERIFIED',
      contentVersion: '2024-v2',
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        knowledgeSourceId: amfiGuide.id,
        chunkIndex: 0,
        topic: 'Rupee Cost Averaging and Disciplined Investing',
        content: 'A Systematic Investment Plan (SIP) enables investing a fixed sum periodically. It harnesses Rupee Cost Averaging by buying more units when market prices drop and fewer units when prices rise, mitigating timing risk over long horizons.',
      },
      {
        knowledgeSourceId: amfiGuide.id,
        chunkIndex: 1,
        topic: 'Compounding & Inflation Impact',
        content: 'Starting early allows compound interest to exponentialize returns. However, investors must factor in inflation, as real purchasing power is determined by the net nominal return minus the inflation rate.',
      },
    ],
  });

  const taxLaw = await prisma.knowledgeSource.upsert({
    where: { id: 'ks_budget_2024_tax' },
    update: {},
    create: {
      id: 'ks_budget_2024_tax',
      sourceType: 'TAX_PROVISION',
      title: 'Indian Finance Act (No. 2) 2024 — Capital Gains Tax Framework',
      canonicalUrl: 'https://incometaxindia.gov.in/Pages/acts/finance-acts.aspx',
      publisher: 'Ministry of Finance, Government of India',
      publishedAt: new Date('2024-07-23'),
      licenseStatus: 'OFFICIAL_PUBLIC',
      reviewStatus: 'VERIFIED',
      contentVersion: 'Budget-2024-FA2',
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        knowledgeSourceId: taxLaw.id,
        chunkIndex: 0,
        topic: 'Equity LTCG and STCG Rates',
        content: 'Under Section 112A, Long-Term Capital Gains on listed equities and equity mutual funds held for more than 12 months are taxed at 12.5% for gains in excess of ₹1,25,000 per financial year. Under Section 111A, Short-Term Capital Gains (holding <= 12 months) are taxed at 20%.',
      },
      {
        knowledgeSourceId: taxLaw.id,
        chunkIndex: 1,
        topic: 'Debt Mutual Funds and SGB Tax Rules',
        content: 'Under Section 50AA, debt mutual funds acquired after April 1, 2023 are taxed at the investor applicable income tax slab rate. Sovereign Gold Bonds held till maturity (8 years) are completely exempt from Capital Gains Tax under Section 47(viic).',
      },
    ],
  });

  // 6. Seed Demo User Profile with Clear Labeling
  console.log('Seeding Demo User...');
  const passwordHash = await bcrypt.hash('Clearvest@2026', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@clearvest.in' },
    update: {},
    create: {
      id: 'usr_demo_2026',
      email: 'demo@clearvest.in',
      passwordHash,
      emailVerifiedAt: new Date(),
      status: 'ACTIVE',
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      fullName: 'Aarav Sharma',
      countryCode: 'IN',
      preferredCurrency: 'INR',
      preferredLocale: 'en-IN',
      timezone: 'Asia/Kolkata',
      investmentKnowledge: 'INTERMEDIATE',
      lossTolerance: 'MODERATE',
      approximateMonthlyIncome: 125000.00,
      essentialMonthlyExpenses: 55000.00,
      emergencyFundMonths: 6,
    },
  });

  // 7. Seed Demo User Goals
  console.log('Seeding Demo Goals...');
  const emergencyGoal = await prisma.financialGoal.create({
    data: {
      userId: demoUser.id,
      name: 'Emergency Safety Net (6 Months Expenses)',
      goalType: 'EMERGENCY_SAVINGS',
      targetAmount: 330000.00,
      targetCurrency: 'INR',
      targetDate: new Date('2027-06-30'),
      currentAmount: 220000.00,
      plannedContribution: 15000.00,
      contributionFrequency: 'MONTHLY',
      inflationAssumption: 6.00,
      expectedReturnRate: 7.00,
      status: 'ACTIVE',
    },
  });

  const retirementGoal = await prisma.financialGoal.create({
    data: {
      userId: demoUser.id,
      name: 'Financial Independence & Retirement',
      goalType: 'RETIREMENT',
      targetAmount: 30000000.00, // 3 Crores
      targetCurrency: 'INR',
      targetDate: new Date('2045-12-31'),
      currentAmount: 850000.00,
      plannedContribution: 25000.00,
      contributionFrequency: 'MONTHLY',
      inflationAssumption: 6.00,
      expectedReturnRate: 12.00,
      status: 'ACTIVE',
    },
  });

  const homeGoal = await prisma.financialGoal.create({
    data: {
      userId: demoUser.id,
      name: 'Home Down Payment (Bangalore)',
      goalType: 'HOME_PURCHASE',
      targetAmount: 2500000.00, // 25 Lakhs
      targetCurrency: 'INR',
      targetDate: new Date('2030-03-31'),
      currentAmount: 450000.00,
      plannedContribution: 20000.00,
      contributionFrequency: 'MONTHLY',
      inflationAssumption: 6.00,
      expectedReturnRate: 10.00,
      status: 'ACTIVE',
    },
  });

  // 8. Seed Demo Financial Account & Holdings (Explicitly labeled SIMULATED_DEMO)
  console.log('Seeding Demo Holdings with SIMULATED_DEMO Provenance...');
  const demoAccount = await prisma.financialAccount.create({
    data: {
      userId: demoUser.id,
      providerId: 'clearvest_aa_sandbox',
      externalAccountReference: 'DEMAT-SIM-98214',
      accountType: 'SIMULATED_DEMAT',
      baseCurrency: 'INR',
      connectionStatus: 'SIMULATED',
      sourceType: 'SIMULATED_DEMO',
      lastSyncedAt: new Date(),
    },
  });

  await prisma.holdingsSnapshot.createMany({
    data: [
      {
        financialAccountId: demoAccount.id,
        instrumentId: 'inst_nifty50_index',
        providerTimestamp: new Date(),
        quantity: 2500.500,
        averageBuyPrice: 162.20,
        marketValue: 461402.51,
        currency: 'INR',
        sourceType: 'SIMULATED_DEMO',
        qualityStatus: 'CONFIRMED',
      },
      {
        financialAccountId: demoAccount.id,
        instrumentId: 'inst_parag_parikh_flexi',
        providerTimestamp: new Date(),
        quantity: 3500.000,
        averageBuyPrice: 70.15,
        marketValue: 287507.50,
        currency: 'INR',
        sourceType: 'SIMULATED_DEMO',
        qualityStatus: 'CONFIRMED',
      },
      {
        financialAccountId: demoAccount.id,
        instrumentId: 'inst_sgb_2024',
        providerTimestamp: new Date(),
        quantity: 25,
        averageBuyPrice: 6200.00,
        marketValue: 181500.00,
        currency: 'INR',
        sourceType: 'SIMULATED_DEMO',
        qualityStatus: 'CONFIRMED',
      },
    ],
  });

  // Seed demo transactions
  await prisma.investmentTransaction.createMany({
    data: [
      {
        financialAccountId: demoAccount.id,
        externalTransactionId: 'TXN-SIM-001',
        idempotencyKey: 'IDEMP-SIM-001',
        instrumentId: 'inst_nifty50_index',
        transactionType: 'BUY',
        quantity: 500,
        unitPrice: 160.00,
        fees: 0,
        currency: 'INR',
        tradeDate: new Date('2025-06-01'),
        sourceType: 'SIMULATED_DEMO',
        reconciliationStatus: 'RECONCILED',
      },
      {
        financialAccountId: demoAccount.id,
        externalTransactionId: 'TXN-SIM-002',
        idempotencyKey: 'IDEMP-SIM-002',
        instrumentId: 'inst_parag_parikh_flexi',
        transactionType: 'BUY',
        quantity: 1000,
        unitPrice: 69.50,
        fees: 0,
        currency: 'INR',
        tradeDate: new Date('2025-07-05'),
        sourceType: 'SIMULATED_DEMO',
        reconciliationStatus: 'RECONCILED',
      },
    ],
  });

  console.log('✅ Clearvest database seed completed successfully!');
  console.log('Demo Login credentials: demo@clearvest.in / Clearvest@2026');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
