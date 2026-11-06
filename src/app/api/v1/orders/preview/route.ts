import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { brokerAdapter } from '@/lib/providers/broker';

const PreviewSchema = z.object({
  instrumentId: z.string().min(1),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  orderType: z.enum(['MARKET', 'LIMIT']).default('MARKET'),
  limitPrice: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = PreviewSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid order preview parameters', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  try {
    const preview = await brokerAdapter.previewOrder(parsed.data);
    return jsonSuccess(preview);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to preview order', 'ORDER_PREVIEW_FAILED', 400);
  }
}
