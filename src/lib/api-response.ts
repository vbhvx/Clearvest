import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: any;
  };
}

export function jsonSuccess<T>(data: T, status = 200, meta?: Record<string, any>) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function jsonError(message: string, code = 'BAD_REQUEST', status = 400, details?: any) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}
