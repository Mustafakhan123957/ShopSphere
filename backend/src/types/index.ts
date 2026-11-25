import { Request } from 'express';

// ---------------------------------------------------------------------------
// Authenticated Request
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ---------------------------------------------------------------------------
// Standard API Response
// ---------------------------------------------------------------------------

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationInfo;
}

// ---------------------------------------------------------------------------
// Pagination / Query Params
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}
