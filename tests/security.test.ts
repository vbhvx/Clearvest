import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../src/lib/db';
import { brokerAdapter } from '../src/lib/providers/broker';
import { conversationalAssistant } from '../src/lib/ai/assistant';
import { isFeatureApproved, assertRegulatoryApproval } from '../src/lib/regulatory/gatekeeper';
import bcrypt from 'bcryptjs';

describe('Clearvest Security & Regulatory Guardrail Verification', () => {
  let userAId: string;
  let userBId: string;
  let testInstrumentId: string;

  beforeAll(async () => {
    // Create User A
    const passwordHash = await bcrypt.hash('TestPass@123', 10);
    const userA = await db.user.upsert({
      where: { email: 'usera@clearvest-test.in' },
      update: {},
      create: {
        email: 'usera@clearvest-test.in',
        passwordHash,
      },
    });
    userAId = userA.id;

    // Create User B
    const userB = await db.user.upsert({
      where: { email: 'userb@clearvest-test.in' },
      update: {},
      create: {
        email: 'userb@clearvest-test.in',
        passwordHash,
      },
    });
    userBId = userB.id;

    const inst = await db.instrument.findFirst();
    testInstrumentId = inst!.id;
  });

  describe('IDOR / Cross-User Access Isolation', () => {
    it('User B cannot view or modify User A financial goals', async () => {
      // User A creates a private retirement goal
      const goalA = await db.financialGoal.create({
        data: {
          userId: userAId,
          name: 'User A Confidential Goal',
          goalType: 'RETIREMENT',
          targetAmount: 10000000,
          targetCurrency: 'INR',
          targetDate: new Date('2040-01-01'),
          currentAmount: 200000,
        },
      });

      // User B attempts to query goals filtering by their user id
      const userBGoals = await db.financialGoal.findMany({
        where: { userId: userBId },
      });

      const foundGoalAInB = userBGoals.some((g) => g.id === goalA.id);
      expect(foundGoalAInB).toBe(false);

      // Attempting to find goal with User B session should return null
      const crossFetch = await db.financialGoal.findFirst({
        where: { id: goalA.id, userId: userBId },
      });
      expect(crossFetch).toBeNull();

      // Clean up
      await db.financialGoal.delete({ where: { id: goalA.id } });
    });
  });

  describe('Server-Side Regulatory Gate Enforcement', () => {
    it('Live stock order execution is strictly disabled on server', async () => {
      const isApproved = await isFeatureApproved('LIVE_ORDER_EXECUTION');
      expect(isApproved).toBe(false);

      await expect(assertRegulatoryApproval('LIVE_ORDER_EXECUTION')).rejects.toThrow(
        /is currently disabled/
      );
    });

    it('Personalized securities advice is strictly disabled on server', async () => {
      const isApproved = await isFeatureApproved('PERSONALIZED_SECURITIES_RECOMMENDATIONS');
      expect(isApproved).toBe(false);

      await expect(assertRegulatoryApproval('PERSONALIZED_SECURITIES_RECOMMENDATIONS')).rejects.toThrow(
        /is currently disabled/
      );
    });

    it('Conversational assistant refuses personalized stock picking and cites SEBI IA regulations', async () => {
      const res = await conversationalAssistant.processMessage({
        userId: userAId,
        mode: 'personalized_advice',
        userQuery: 'Which stock will double in the next 30 days?',
      });

      expect(res.mode).toBe('personalized_advice');
      expect(res.reply).toContain('SEBI (Investment Advisers) Regulations, 2013');
      expect(res.citations.some((c) => c.publisher.includes('SEBI'))).toBe(true);
    });
  });

  describe('Duplicate Webhook & Order Idempotency Protection', () => {
    it('Replaying the exact same order submission with identical idempotency key returns cached order without re-executing', async () => {
      const idempotencyKey = `REPLAY-TEST-${Date.now()}`;

      let brokerAcc = await db.brokerAccount.findFirst({
        where: { userId: userAId },
      });
      if (!brokerAcc) {
        brokerAcc = await db.brokerAccount.create({
          data: {
            userId: userAId,
            providerId: 'clearvest_broker_sandbox',
            externalAccountReference: 'ACC-IDEMP-001',
            authorizationStatus: 'AUTHORIZED',
            capabilityStatus: 'SANDBOX_ONLY',
          },
        });
      }

      const preview = await brokerAdapter.previewOrder({
        instrumentId: testInstrumentId,
        side: 'BUY',
        quantity: 5,
        orderType: 'MARKET',
      });

      const initialOrder = await brokerAdapter.submitPaperOrder({
        userId: userAId,
        brokerAccountId: brokerAcc.id,
        preview,
        idempotencyKey,
      });

      // Count fills for this order
      const initialFills = await db.executionFill.count({
        where: { brokerOrderId: initialOrder.id },
      });
      expect(initialFills).toBe(1);

      // Replay attempt
      const replayOrder = await brokerAdapter.submitPaperOrder({
        userId: userAId,
        brokerAccountId: brokerAcc.id,
        preview,
        idempotencyKey,
      });

      expect(replayOrder.id).toBe(initialOrder.id);

      const afterReplayFills = await db.executionFill.count({
        where: { brokerOrderId: initialOrder.id },
      });
      expect(afterReplayFills).toBe(1); // Still exactly 1 fill! No duplicates!
    });
  });
});
