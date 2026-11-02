import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ instrumentId: string }> }
) {
  const { instrumentId } = await context.params;

  const inst = await db.instrument.findUnique({
    where: { id: instrumentId },
    include: {
      provider: true,
      marketObservations: {
        orderBy: { sourceTimestamp: 'desc' },
        take: 10,
      },
    },
  });

  if (!inst) {
    return jsonError('Instrument not found', 'NOT_FOUND', 404);
  }

  const latestObs = inst.marketObservations[0];

  return jsonSuccess({
    id: inst.id,
    symbol: inst.symbol,
    name: inst.name,
    instrumentType: inst.instrumentType,
    exchange: inst.exchange,
    countryCode: inst.countryCode,
    tradingCurrency: inst.tradingCurrency,
    quantityPrecision: inst.quantityPrecision,
    pricePrecision: inst.pricePrecision,
    metadata: inst.metadata,
    provider: {
      id: inst.provider.id,
      displayName: inst.provider.displayName,
      providerType: inst.provider.providerType,
      officialDocsUrl: inst.provider.officialDocsUrl,
      licensingMetadata: inst.provider.licensingMetadata,
    },
    latestQuote: latestObs
      ? {
          priceOrValue: parseFloat(latestObs.priceOrValue.toString()),
          observationType: latestObs.observationType,
          currency: latestObs.currency,
          sourceTimestamp: latestObs.sourceTimestamp,
          isDelayed: latestObs.isDelayed,
          isSimulated: latestObs.isSimulated,
          validityStatus: latestObs.validityStatus,
          metadata: latestObs.metadata,
        }
      : null,
    recentObservations: inst.marketObservations.map((o) => ({
      priceOrValue: parseFloat(o.priceOrValue.toString()),
      observationType: o.observationType,
      timestamp: o.sourceTimestamp,
      isSimulated: o.isSimulated,
    })),
  });
}
