import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { brokerAdapter } from '@/lib/providers/broker';
import { logAuditEvent } from '@/lib/audit';

const OrderSubmitSchema = z.object({
  instrumentId: z.string().min(1),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  orderType: z.enum(['MARKET', 'LIMIT']).default('MARKET'),
  limitPrice: z.number().positive().optional(),
  idempotencyKey: z.string().min(8, 'Idempotency key required'),
  userConfirmed: z.boolean().refine((v) => v === true, 'Explicit user confirmation required before order placement'),
  isLiveRequested: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const orders = await db.orderIntent.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      instrument: true,
      brokerOrder: {
        include: {
          executionFills: true,
        },
      },
    },
  });

  return jsonSuccess(orders);
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = OrderSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid order parameters', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const { instrumentId, side, quantity, orderType, limitPrice, idempotencyKey, isLiveRequested } = parsed.data;

  // 1. Mandatory Regulatory Gate Check: Live Orders
  if (isLiveRequested) {
    return jsonError(
      'Live stock order execution is disabled on the server pursuant to SEBI Broker API Regulations. Only Paper Trading Sandbox orders are permitted.',
      'LIVE_TRADING_DISABLED',
      403,
      {
        featureKey: 'LIVE_ORDER_EXECUTION',
        status: 'disabled',
        regulatoryAuthority: 'Securities and Exchange Board of India (SEBI)',
      }
    );
  }

  // 2. Generate Preview
  const preview = await brokerAdapter.previewOrder({
    instrumentId,
    side,
    quantity,
    orderType,
    limitPrice,
  });

  // 3. Find or create user broker sandbox account
  let brokerAccount = await db.brokerAccount.findFirst({
    where: { userId: session.userId },
  });

  if (!brokerAccount) {
    brokerAccount = await db.brokerAccount.create({
      data: {
        userId: session.userId,
        providerId: 'clearvest_broker_sandbox',
        externalAccountReference: `SANDBOX-BRK-${session.userId.substring(0, 8)}`,
        authorizationStatus: 'AUTHORIZED',
        capabilityStatus: 'SANDBOX_ONLY',
      },
    });
  }

  // 4. Submit into sandbox state machine with idempotency
  const order = await brokerAdapter.submitPaperOrder({
    userId: session.userId,
    brokerAccountId: brokerAccount.id,
    preview,
    idempotencyKey,
  });

  await logAuditEvent({
    userId: session.userId,
    action: 'ORDER_EXECUTED_SANDBOX',
    resourceType: 'BrokerOrder',
    resourceId: order.id,
    details: { instrumentId, side, quantity, totalCharges: preview.costs.totalCharges },
  });

  return jsonSuccess({
    order,
    preview,
    environment: 'SANDBOX_PAPER_TRADING',
    message: 'Paper trading order simulated and filled in sandbox environment. No real funds were moved.',
  }, 201);
}
