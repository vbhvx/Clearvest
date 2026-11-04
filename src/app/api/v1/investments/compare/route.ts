import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';

const CompareSchema = z.object({
  instrumentIds: z.array(z.string()).min(2, 'Select at least 2 instruments to compare').max(4, 'Maximum 4 instruments'),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CompareSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid comparison request', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const instruments = await db.instrument.findMany({
    where: {
      id: { in: parsed.data.instrumentIds },
    },
    include: {
      provider: true,
      marketObservations: {
        orderBy: { sourceTimestamp: 'desc' },
        take: 1,
      },
    },
  });

  const comparison = instruments.map((inst) => {
    const quote = inst.marketObservations[0];
    const meta: any = inst.metadata || {};

    return {
      id: inst.id,
      symbol: inst.symbol,
      name: inst.name,
      category: meta.category || inst.instrumentType,
      exchange: inst.exchange,
      currentPriceOrNAV: quote ? parseFloat(quote.priceOrValue.toString()) : null,
      expenseRatio: meta.expenseRatio !== undefined ? `${meta.expenseRatio}%` : 'N/A',
      lockInPeriod: meta.lockInMonths ? `${meta.lockInMonths} Months` : 'None / Liquid',
      riskProfile: meta.riskLevel || 'Moderate',
      taxTreatment: meta.taxCategory || 'EQUITY',
      taxExplanation: meta.taxBenefit || (meta.taxCategory === 'EQUITY' ? '12.5% LTCG above ₹1.25L, 20% STCG' : 'Taxed at Slab Rate'),
      benchmark: meta.benchmark || 'N/A',
      providerProvenance: quote?.isSimulated ? 'Simulated Demonstration Data' : 'Official Feed',
      officialDocumentationUrl: meta.officialUrl || inst.provider.officialDocsUrl,
    };
  });

  return jsonSuccess({
    comparedCount: comparison.length,
    comparison,
    disclaimer: 'Product comparisons highlight objective structural attributes and statutory taxation. Clearvest does not rank or recommend securities.',
  });
}
