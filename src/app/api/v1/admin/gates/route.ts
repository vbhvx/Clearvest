import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonSuccess } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const gates = await db.regulatoryApproval.findMany({
    orderBy: { featureKey: 'asc' },
  });

  const providers = await db.provider.findMany({
    orderBy: { id: 'asc' },
  });

  return jsonSuccess({
    systemStatus: 'OPERATIONAL',
    jurisdiction: 'India (SEBI / RBI / DPDP Act)',
    regulatoryGates: gates,
    registeredProviders: providers,
    environmentModes: {
      appEnv: process.env.APP_ENV || 'development',
      demoMode: process.env.DEMO_MODE === 'true',
      marketDataMode: process.env.MARKET_DATA_MODE || 'simulated',
      brokerageMode: process.env.BROKERAGE_MODE || 'sandbox',
      personalizedAdviceMode: process.env.PERSONALIZED_ADVICE_MODE || 'disabled',
    },
  });
}
