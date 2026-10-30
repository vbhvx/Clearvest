import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signSessionToken } from '@/lib/auth/jwt';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Invalid login credentials format', 'VALIDATION_FAILED', 422);
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      return jsonError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return jsonError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    const token = await signSessionToken({ userId: user.id, email: user.email });

    await logAuditEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
    });

    const res = jsonSuccess({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName,
        currency: user.profile?.preferredCurrency || 'INR',
        locale: user.profile?.preferredLocale || 'en-IN',
      },
      token,
    });

    res.cookies.set('clearvest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return jsonError('Internal server error during login', 'INTERNAL_SERVER_ERROR', 500);
  }
}
