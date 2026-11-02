import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonSuccess } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const query = searchParams.get('q');

  const where: any = { status: 'ACTIVE' };
  if (type) where.instrumentType = type;
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { symbol: { contains: query, mode: 'insensitive' } },
    ];
  }

  const instruments = await db.instrument.findMany({
    where,
    include: {
      provider: {
        select: {
          id: true,
          displayName: true,
          providerType: true,
          officialDocsUrl: true,
        },
      },
      marketObservations: {
        orderBy: { sourceTimestamp: 'desc' },
        take: 1,
      },
    },
    orderBy: { symbol: 'asc' },
  });

  const formatted = instruments.map((inst) => {
    const latestObs = inst.marketObservations[0];
    return {
      id: inst.id,
      symbol: inst.symbol,
      name: inst.name,
      instrumentType: inst.instrumentType,
      exchange: inst.exchange,
      countryCode: inst.countryCode,
      tradingCurrency: inst.tradingCurrency,
      metadata: inst.metadata,
      provider: inst.provider,
      quote: latestObs
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
    };
  });

  return jsonSuccess(formatted);
}
