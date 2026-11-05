import { NextRequest } from 'next/server';
import Decimal from 'decimal.js';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const holdings = await db.holdingsSnapshot.findMany({
    where: {
      financialAccount: {
        userId: session.userId,
      },
    },
    include: {
      financialAccount: {
        select: {
          id: true,
          accountType: true,
          externalAccountReference: true,
          sourceType: true,
        },
      },
      instrument: {
        include: {
          marketObservations: {
            orderBy: { sourceTimestamp: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { marketValue: 'desc' },
  });

  const formatted = holdings.map((h) => {
    const qty = new Decimal(h.quantity.toString());
    const avgPrice = new Decimal(h.averageBuyPrice.toString());
    const cost = qty.times(avgPrice);

    const quote = h.instrument.marketObservations[0];
    const currentPrice = quote
      ? new Decimal(quote.priceOrValue.toString())
      : avgPrice;

    const currentVal = qty.times(currentPrice);
    const gainLoss = currentVal.minus(cost);
    const gainLossPct = cost.isZero() ? new Decimal(0) : gainLoss.dividedBy(cost).times(100);

    return {
      id: h.id,
      instrumentId: h.instrument.id,
      symbol: h.instrument.symbol,
      name: h.instrument.name,
      instrumentType: h.instrument.instrumentType,
      quantity: qty.toNumber(),
      averageBuyPrice: avgPrice.toNumber(),
      investedAmount: cost.toDecimalPlaces(2).toNumber(),
      currentPrice: currentPrice.toNumber(),
      currentValue: currentVal.toDecimalPlaces(2).toNumber(),
      unrealizedGainLoss: gainLoss.toDecimalPlaces(2).toNumber(),
      gainLossPercentage: `${gainLossPct.toFixed(2)}%`,
      sourceType: h.sourceType, // USER_ENTERED, SIMULATED_DEMO, PROVIDER_REPORTED
      qualityStatus: h.qualityStatus,
      isSimulated: quote ? quote.isSimulated : true,
      lastUpdated: quote ? quote.sourceTimestamp : h.providerTimestamp,
      accountRef: h.financialAccount.externalAccountReference,
    };
  });

  return jsonSuccess(formatted);
}
