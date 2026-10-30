import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      consents: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (!user) {
    return jsonError('User not found', 'NOT_FOUND', 404);
  }

  return jsonSuccess({
    id: user.id,
    email: user.email,
    profile: user.profile,
    activeConsentsCount: user.consents.length,
  });
}
