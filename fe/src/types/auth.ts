export type GlobalRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  globalRole: GlobalRole;
}

export interface LoginPayload {
  email?: string;
  password?: string;
  googleToken?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
