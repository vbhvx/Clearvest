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

  // Find all accounts belonging to this user
  const accounts = await db.financialAccount.findMany({
    where: { userId: session.userId },
    include: {
      holdingsSnapshots: {
        include: {
          instrument: {
            include: {
              marketObservations: {
                orderBy: { sourceTimestamp: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  let totalValuation = new Decimal(0);
  let totalCost = new Decimal(0);

  const allocationTotals: Record<string, Decimal> = {
    EQUITY: new Decimal(0),
    DEBT: new Decimal(0),
    GOLD: new Decimal(0),
    CASH: new Decimal(0),
  };

  const provenanceTotals: Record<string, Decimal> = {
    USER_ENTERED: new Decimal(0),
    SIMULATED_DEMO: new Decimal(0),
    PROVIDER_REPORTED: new Decimal(0),
  };

  accounts.forEach((acc) => {
    acc.holdingsSnapshots.forEach((h) => {
      const qty = new Decimal(h.quantity.toString());
      const buyPrice = new Decimal(h.averageBuyPrice.toString());
      const costBasis = qty.times(buyPrice);

      const latestQuote = h.instrument.marketObservations[0];
      const currentPrice = latestQuote
        ? new Decimal(latestQuote.priceOrValue.toString())
        : buyPrice;

      const currentMktVal = qty.times(currentPrice);

      totalValuation = totalValuation.plus(currentMktVal);
      totalCost = totalCost.plus(costBasis);

      // Map to broad asset class
      const instType = h.instrument.instrumentType;
      if (instType === 'EQUITY' || instType === 'MUTUAL_FUND' || instType === 'ETF') {
        allocationTotals.EQUITY = allocationTotals.EQUITY.plus(currentMktVal);
      } else if (instType === 'FIXED_INCOME' || instType === 'GOVERNMENT_SECURITY') {
        allocationTotals.DEBT = allocationTotals.DEBT.plus(currentMktVal);
      } else if (instType === 'GOLD_SGB') {
        allocationTotals.GOLD = allocationTotals.GOLD.plus(currentMktVal);
      } else {
        allocationTotals.CASH = allocationTotals.CASH.plus(currentMktVal);
      }

      // Track data provenance
      const prov = h.sourceType || 'USER_ENTERED';
      provenanceTotals[prov] = (provenanceTotals[prov] || new Decimal(0)).plus(currentMktVal);
    });
  });

  const totalGainLoss = totalValuation.minus(totalCost);
  const totalGainLossPct = totalCost.isZero()
    ? new Decimal(0)
    : totalGainLoss.dividedBy(totalCost).times(100);

  // Calculate percentage allocations
  const assetAllocation: Record<string, { value: number; percentage: number }> = {};
  for (const [category, amount] of Object.entries(allocationTotals)) {
    const pct = totalValuation.isZero() ? 0 : amount.dividedBy(totalValuation).times(100).toNumber();
    assetAllocation[category] = {
      value: amount.toDecimalPlaces(2).toNumber(),
      percentage: parseFloat(pct.toFixed(2)),
    };
  }

  const provenanceBreakdown: Record<string, number> = {};
  for (const [prov, amount] of Object.entries(provenanceTotals)) {
    provenanceBreakdown[prov] = amount.toDecimalPlaces(2).toNumber();
  }

  return jsonSuccess({
    currency: 'INR',
    summary: {
      totalValuation: totalValuation.toFixed(2),
      totalCostBasis: totalCost.toFixed(2),
      unrealizedGainLoss: totalGainLoss.toFixed(2),
      unrealizedGainLossPercentage: `${totalGainLossPct.toFixed(2)}%`,
    },
    assetAllocation,
    provenanceBreakdown,
    activeAccountsCount: accounts.length,
    disclaimer: 'Valuations are computed from latest verified or simulated observations. Unliquidated gains do not represent cash balances. Holdings with simulated demo provenance are marked explicitly.',
  });
}
