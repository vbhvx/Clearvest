import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'clearvest_dev_jwt_secret_key_needs_at_least_32_chars_2026';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the current session from request cookies or Authorization header.
 */
export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    // 1. Check Authorization Bearer header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // 2. Check Cookie in NextRequest
      const cookieHeader = req.cookies.get('clearvest_session');
      token = cookieHeader?.value;
    }
  } else {
    // 3. Check Server Component / Route Handler cookie store
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('clearvest_session')?.value;
    } catch {
      // Fallback if called outside request context
    }
  }

  if (!token) return null;
  return await verifySessionToken(token);
}
