import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

const ProfileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  countryCode: z.string().length(2).optional(),
  preferredCurrency: z.string().min(3).optional(),
  preferredLocale: z.string().optional(),
  investmentKnowledge: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  lossTolerance: z.enum(['LOW', 'MODERATE', 'HIGH']).optional(),
  approximateMonthlyIncome: z.number().optional(),
  essentialMonthlyExpenses: z.number().optional(),
  emergencyFundMonths: z.number().int().min(1).max(24).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = ProfileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid profile update data', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const updatedProfile = await db.userProfile.upsert({
    where: { userId: session.userId },
    update: parsed.data,
    create: {
      userId: session.userId,
      fullName: parsed.data.fullName || 'User',
      ...parsed.data,
    },
  });

  await logAuditEvent({
    userId: session.userId,
    action: 'PROFILE_UPDATED',
    resourceType: 'UserProfile',
    resourceId: updatedProfile.id,
    details: parsed.data,
  });

  return jsonSuccess(updatedProfile);
}
