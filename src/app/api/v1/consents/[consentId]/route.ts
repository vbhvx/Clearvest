import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/jwt';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { accountAggregatorAdapter } from '@/lib/providers/accountAggregator';
import { logAuditEvent } from '@/lib/audit';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ consentId: string }> }
) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const { consentId } = await context.params;

  try {
    const revoked = await accountAggregatorAdapter.revokeConsent(session.userId, consentId);

    await logAuditEvent({
      userId: session.userId,
      action: 'CONSENT_REVOKED',
      resourceType: 'Consent',
      resourceId: consentId,
    });

    return jsonSuccess({
      message: 'Consent successfully revoked and provider connections terminated',
      consent: revoked,
    });
  } catch (err: any) {
    return jsonError(err.message || 'Failed to revoke consent', 'REVOCATION_FAILED', 400);
  }
}
