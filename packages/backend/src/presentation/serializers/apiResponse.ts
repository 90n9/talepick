import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ApiPaginatedResponse<T = unknown> = ApiResponse<{
  items: T[];
  meta: ApiPaginationMeta;
}>;

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  });
}

export function createPaginatedResponse<T>(
  items: T[],
  meta: ApiPaginationMeta,
  message?: string,
  requestId?: string
): NextResponse<ApiPaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data: {
      items,
      meta,
    },
    message,
    timestamp: new Date().toISOString(),
    requestId,
  });
}

export function createNoContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
