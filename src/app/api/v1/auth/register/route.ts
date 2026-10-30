import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signSessionToken } from '@/lib/auth/jwt';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name required'),
  lossTolerance: z.enum(['LOW', 'MODERATE', 'HIGH']).default('MODERATE'),
  investmentKnowledge: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  approximateMonthlyIncome: z.number().optional(),
  essentialMonthlyExpenses: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Invalid registration data', 'VALIDATION_FAILED', 422, parsed.error.format());
    }

    const { email, password, fullName, lossTolerance, investmentKnowledge, approximateMonthlyIncome, essentialMonthlyExpenses } = parsed.data;

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return jsonError('User with this email already exists', 'EMAIL_TAKEN', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            fullName,
            countryCode: 'IN',
            preferredCurrency: 'INR',
            preferredLocale: 'en-IN',
            lossTolerance,
            investmentKnowledge,
            approximateMonthlyIncome,
            essentialMonthlyExpenses,
          },
        },
      },
      include: { profile: true },
    });

    const token = await signSessionToken({ userId: user.id, email: user.email });

    await logAuditEvent({
      userId: user.id,
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: user.id,
    });

    const res = jsonSuccess({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName,
        currency: user.profile?.preferredCurrency,
      },
      token,
    }, 201);

    res.cookies.set('clearvest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error('Registration error:', err);
    return jsonError('Internal server error during registration', 'INTERNAL_SERVER_ERROR', 500);
  }
}
