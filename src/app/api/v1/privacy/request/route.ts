import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

const PrivacyRequestSchema = z.object({
  requestType: z.enum(['DATA_EXPORT', 'DATA_DELETION', 'CONSENT_REVOCATION']),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = PrivacyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid privacy request type', 'VALIDATION_FAILED', 422);
  }

  const { requestType } = parsed.data;

  // Handle instant JSON data export
  if (requestType === 'DATA_EXPORT') {
    const fullUserData = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        goals: { include: { scenarios: true } },
        consents: true,
        financialAccounts: {
          include: {
            holdingsSnapshots: {
              include: { instrument: true },
            },
            transactions: true,
          },
        },
      },
    });

    const exportRecord = await db.privacyRequest.create({
      data: {
        userId: session.userId,
        requestType: 'DATA_EXPORT',
        status: 'COMPLETED',
        completedAt: new Date(),
        auditReference: `EXPORT-${Date.now()}`,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: 'DATA_EXPORTED',
      resourceType: 'User',
      resourceId: session.userId,
    });

    return jsonSuccess({
      exportMetadata: exportRecord,
      userData: fullUserData,
    });
  }

  const privacyRequest = await db.privacyRequest.create({
    data: {
      userId: session.userId,
      requestType,
      status: 'PENDING',
      auditReference: `REQ-${Date.now()}`,
    },
  });

  await logAuditEvent({
    userId: session.userId,
    action: `PRIVACY_REQ_${requestType}`,
    resourceType: 'PrivacyRequest',
    resourceId: privacyRequest.id,
  });

  return jsonSuccess(privacyRequest, 201);
}
