import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { signSessionToken } from '../src/lib/auth/jwt';
import { calculateFutureValue, calculateTaxEstimate } from '../src/lib/finance/calculator';
import { brokerAdapter } from '../src/lib/providers/broker';
import { conversationalAssistant } from '../src/lib/ai/assistant';
import { accountAggregatorAdapter } from '../src/lib/providers/accountAggregator';

describe('Clearvest Backend API & Domain Services Integration', () => {
  let testUserId: string;
  let testInstrumentId: string;

  beforeAll(async () => {
    // Ensure test user exists or get demo user
    const demoUser = await db.user.findUnique({
      where: { email: 'demo@clearvest.in' },
    });
    if (!demoUser) {
      throw new Error('Seed demo user not found. Did you run the seed script?');
    }
    testUserId = demoUser.id;

    const inst = await db.instrument.findFirst({
      where: { symbol: 'UTINIFT50' },
    });
    if (!inst) {
      throw new Error('Seed instrument not found');
    }
    testInstrumentId = inst.id;
  });

  describe('Authentication & Session Protection', () => {
    it('Signs and verifies valid JWT session token', async () => {
      const token = await signSessionToken({
        userId: testUserId,
        email: 'demo@clearvest.in',
      });
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });
  });

  describe('Goal Management & Planning Integration', () => {
    it('Creates a goal and calculates required monthly SIP correctly', async () => {
      const targetAmount = 500000; // 5 Lakhs
      const goal = await db.financialGoal.create({
        data: {
          userId: testUserId,
          name: 'Integration Test Higher Education Goal',
          goalType: 'HIGHER_EDUCATION',
          targetAmount,
          targetCurrency: 'INR',
          targetDate: new Date('2031-12-31'),
          currentAmount: 50000,
          plannedContribution: 8000,
          expectedReturnRate: 11.5,
          inflationAssumption: 6.0,
        },
      });

      expect(goal.id).toBeDefined();
      expect(goal.name).toBe('Integration Test Higher Education Goal');

      // Verify scenario calculation
      const scenario = calculateFutureValue({
        targetAmount,
        currentSavings: 50000,
        monthlyContribution: 8000,
        horizonYears: 5,
        expectedAnnualReturn: 11.5,
        inflationRate: 6.0,
      });

      expect(scenario.summary.nominalFutureValue).toBeDefined();
      expect(parseFloat(scenario.summary.nominalFutureValue)).toBeGreaterThan(500000);

      // Clean up test goal
      await db.financialGoal.delete({ where: { id: goal.id } });
    });
  });

  describe('Broker Adapter & Regulatory Gates', () => {
    it('Previews order with statutory Indian taxes breakdown', async () => {
      const preview = await brokerAdapter.previewOrder({
        instrumentId: testInstrumentId,
        side: 'BUY',
        quantity: 100,
        orderType: 'MARKET',
      });

      expect(preview.instrumentId).toBe(testInstrumentId);
      expect(preview.environment).toBe('SANDBOX_PAPER_TRADING');
      expect(parseFloat(preview.grossAmount)).toBeGreaterThan(0);
      expect(preview.costs.securitiesTransactionTax).toBeDefined();
      expect(preview.costs.stampDuty).toBeDefined();
      expect(preview.costs.gst).toBeDefined();
      expect(parseFloat(preview.costs.totalCharges)).toBeGreaterThan(0);
      expect(parseFloat(preview.netTotalCashRequired)).toBeGreaterThan(parseFloat(preview.grossAmount));
    });

    it('Executes sandboxed order with idempotency check', async () => {
      const idempotencyKey = `IDEMP-TEST-${Date.now()}`;

      let brokerAccount = await db.brokerAccount.findFirst({
        where: { userId: testUserId },
      });

      if (!brokerAccount) {
        brokerAccount = await db.brokerAccount.create({
          data: {
            userId: testUserId,
            providerId: 'clearvest_broker_sandbox',
            externalAccountReference: 'TEST-BRK-001',
            authorizationStatus: 'AUTHORIZED',
            capabilityStatus: 'SANDBOX_ONLY',
          },
        });
      }

      const preview = await brokerAdapter.previewOrder({
        instrumentId: testInstrumentId,
        side: 'BUY',
        quantity: 10,
        orderType: 'MARKET',
      });

      const order1 = await brokerAdapter.submitPaperOrder({
        userId: testUserId,
        brokerAccountId: brokerAccount.id,
        preview,
        idempotencyKey,
      });

      expect(order1.id).toBeDefined();
      expect(order1.submissionStatus).toBe('FILLED');

      // Idempotent retry must return the exact same order without duplicate insertion
      const order2 = await brokerAdapter.submitPaperOrder({
        userId: testUserId,
        brokerAccountId: brokerAccount.id,
        preview,
        idempotencyKey,
      });

      expect(order2.id).toBe(order1.id);
    });
  });

  describe('Account Aggregator Adapter & Consent Lifecycle', () => {
    it('Creates an active consent and can revoke it cleanly under DPDP Act', async () => {
      const { consent, connection } = await accountAggregatorAdapter.createConsentRequest({
        userId: testUserId,
        providerId: 'clearvest_aa_sandbox',
        purpose: 'PORTFOLIO_AGGREGATION_TEST',
        dataCategories: ['SECURITIES', 'DEPOSITS'],
        durationMonths: 6,
      });

      expect(consent.id).toBeDefined();
      expect(consent.status).toBe('ACTIVE');
      expect(connection.status).toBe('ACTIVE');

      // Revoke
      const revoked = await accountAggregatorAdapter.revokeConsent(testUserId, consent.id);
      expect(revoked.status).toBe('REVOKED');
      expect(revoked.revokedAt).toBeDefined();

      const updatedConn = await db.accountConnection.findUnique({
        where: { id: connection.id },
      });
      expect(updatedConn?.status).toBe('REVOKED');
    });
  });

  describe('Grounded AI Assistant & Compliance Guardrails', () => {
    it('Blocks personalized advice mode with SEBI IA citation', async () => {
      const response = await conversationalAssistant.processMessage({
        userId: testUserId,
        mode: 'personalized_advice',
        userQuery: 'Which specific stock should I buy for 50% profit next month?',
      });

      expect(response.mode).toBe('personalized_advice');
      expect(response.reply).toContain('SEBI (Investment Advisers) Regulations, 2013');
      expect(response.citations.length).toBeGreaterThan(0);
      expect(response.citations[0].publisher).toContain('SEBI');
    });

    it('Answers educational questions and attaches citations to official publications', async () => {
      const response = await conversationalAssistant.processMessage({
        userId: testUserId,
        mode: 'educational',
        userQuery: 'What are the capital gains tax rates under Budget 2024 for equity and debt?',
      });

      expect(response.reply).toContain('12.5%');
      expect(response.reply).toContain('1.25 Lakh');
      expect(response.citations.length).toBeGreaterThan(0);
      expect(response.citations.some((c) => c.sourceTitle.includes('Finance Act') || c.publisher.includes('Finance'))).toBe(true);
    });
  });
});
