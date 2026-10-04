export type GlobalRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type Profession = 'DEV' | 'TESTER' | 'DESIGNER' | 'BA' | 'MARKETING' | 'DEVOPS' | 'PRODUCT_OWNER';

export type UserStatusSignal = 'ONLINE' | 'BUSY' | 'IN_MEETING' | 'AWAY' | 'OFFLINE';

export interface UserProjectItem {
  id: string;
  name: string;
  description?: string;
  roleInProject?: string;
}

export interface UserDepartment {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  avatarUrl?: string;
  coverImage?: string;
  role?: GlobalRole;
  globalRole: GlobalRole;
  profession?: Profession;
  jobTitle?: string;
  phone?: string;
  bio?: string;
  statusSignal?: UserStatusSignal;
  customStatus?: string;
  workMode?: 'OFFICE' | 'REMOTE';
  isFirstLogin?: boolean;
  department?: UserDepartment | string | null;
  departmentId?: string;
  assignedProjects?: UserProjectItem[] | string[];
}

export interface LoginPayload {
  email?: string;
  password?: string;
  googleToken?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}
