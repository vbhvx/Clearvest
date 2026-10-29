import { db } from './db';

export async function logAuditEvent(params: {
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
}) {
  try {
    await db.auditEvent.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId || null,
        ipAddress: params.ipAddress || null,
        details: params.details || {},
      },
    });
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}
