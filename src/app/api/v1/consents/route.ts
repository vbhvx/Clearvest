import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { accountAggregatorAdapter } from '@/lib/providers/accountAggregator';
import { logAuditEvent } from '@/lib/audit';

const ConsentGrantSchema = z.object({
  providerId: z.string().min(1),
  purpose: z.string().min(3),
  dataCategories: z.array(z.string()).min(1),
  durationMonths: z.number().int().min(1).max(36).default(12),
});

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const consents = await db.consent.findMany({
    where: { userId: session.userId },
    orderBy: { grantedAt: 'desc' },
    include: {
      accountConnections: {
        include: {
          provider: true,
        },
      },
    },
  });

  const privacyRequests = await db.privacyRequest.findMany({
    where: { userId: session.userId },
    orderBy: { requestedAt: 'desc' },
  });

  return jsonSuccess({
    consents,
    privacyRequests,
    governingAct: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = ConsentGrantSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid consent request data', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const { providerId, purpose, dataCategories, durationMonths } = parsed.data;

  const result = await accountAggregatorAdapter.createConsentRequest({
    userId: session.userId,
    providerId,
    purpose,
    dataCategories,
    durationMonths,
  });

  await logAuditEvent({
    userId: session.userId,
    action: 'CONSENT_GRANTED',
    resourceType: 'Consent',
    resourceId: result.consent.id,
    details: { purpose, dataCategories, providerId },
  });

  return jsonSuccess(result, 201);
}
