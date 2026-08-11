export type GlobalRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type Profession = 'DEV' | 'TESTER' | 'DESIGNER' | 'BA' | 'MARKETING' | 'DEVOPS' | 'PRODUCT_OWNER';

export type UserStatusSignal = 'ONLINE' | 'BUSY' | 'IN_MEETING' | 'AWAY' | 'OFFLINE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  coverImage?: string;
  globalRole: GlobalRole;
  profession?: Profession;
  jobTitle?: string;
  phone?: string;
  bio?: string;
  statusSignal?: UserStatusSignal;
  customStatus?: string;
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
