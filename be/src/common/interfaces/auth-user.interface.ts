import { Role } from '@prisma/client';

export interface AuthUserPayload {
  id: string;
  sub?: string;
  userId?: string;
  email?: string;
  role?: Role | string;
  globalRole?: string;
  fullName?: string;
}

export interface AuthenticatedRequest {
  user: AuthUserPayload;
  headers?: Record<string, string | string[] | undefined>;
  [key: string]: unknown;
}
