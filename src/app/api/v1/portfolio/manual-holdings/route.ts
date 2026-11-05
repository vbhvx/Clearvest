import { NextRequest } from 'next/server';
import { z } from 'zod';
import Decimal from 'decimal.js';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

const ManualHoldingSchema = z.object({
  instrumentId: z.string().min(1),
  quantity: z.number().positive('Quantity must be greater than zero'),
  averageBuyPrice: z.number().positive('Buy price must be greater than zero'),
  accountName: z.string().default('Manual Portfolio'),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = ManualHoldingSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid holding inputs', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const { instrumentId, quantity, averageBuyPrice, accountName } = parsed.data;

  const instrument = await db.instrument.findUnique({
    where: { id: instrumentId },
    include: {
      marketObservations: {
        orderBy: { sourceTimestamp: 'desc' },
        take: 1,
      },
    },
  });

  if (!instrument) {
    return jsonError('Instrument not found', 'NOT_FOUND', 404);
  }

  // Find or create user manual portfolio account
  let manualAccount = await db.financialAccount.findFirst({
    where: {
      userId: session.userId,
      accountType: 'MANUAL_PORTFOLIO',
    },
  });

  if (!manualAccount) {
    manualAccount = await db.financialAccount.create({
      data: {
        userId: session.userId,
        providerId: 'simulated_feed',
        externalAccountReference: `MANUAL-${session.userId.substring(0, 8)}`,
        accountType: 'MANUAL_PORTFOLIO',
        baseCurrency: 'INR',
        connectionStatus: 'ACTIVE',
        sourceType: 'USER_ENTERED',
        lastSyncedAt: new Date(),
      },
    });
  }

  const qtyDec = new Decimal(quantity);
  const priceDec = new Decimal(averageBuyPrice);
  const latestPrice = instrument.marketObservations[0]
    ? new Decimal(instrument.marketObservations[0].priceOrValue.toString())
    : priceDec;

  const marketValue = qtyDec.times(latestPrice);

  const holding = await db.holdingsSnapshot.create({
    data: {
      financialAccountId: manualAccount.id,
      instrumentId: instrument.id,
      providerTimestamp: new Date(),
      quantity: qtyDec.toFixed(instrument.quantityPrecision),
      averageBuyPrice: priceDec.toFixed(instrument.pricePrecision),
      marketValue: marketValue.toFixed(2),
      currency: instrument.tradingCurrency,
      sourceType: 'USER_ENTERED',
      qualityStatus: 'CONFIRMED',
    },
  });

  await logAuditEvent({
    userId: session.userId,
    action: 'MANUAL_HOLDING_ADDED',
    resourceType: 'HoldingsSnapshot',
    resourceId: holding.id,
    details: { symbol: instrument.symbol, quantity, averageBuyPrice },
  });

  return jsonSuccess(holding, 201);
}
