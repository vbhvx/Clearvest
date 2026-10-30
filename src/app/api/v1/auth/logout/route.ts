import { NextRequest } from 'next/server';
import { jsonSuccess } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  const res = jsonSuccess({ message: 'Logged out successfully' });
  res.cookies.set('clearvest_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
