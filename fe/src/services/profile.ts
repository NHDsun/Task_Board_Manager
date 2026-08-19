import { api } from './api';
import type { User, UserStatusSignal } from '../types/auth';

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
  profession?: string;
  avatar?: string;
  coverImage?: string;
}

export interface UpdateStatusSignalPayload {
  statusSignal: UserStatusSignal;
  customStatus?: string;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
}

export interface PersonalStatsResponse {
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  totalAssignedTasks: number;
}

export const profileService = {
  getProfile: async (): Promise<User> => {
    const res = await api.get('/profile/me');
    return res.data?.data ? res.data.data : res.data;
  },

  updateProfile: async (data: UpdateProfilePayload): Promise<User> => {
    const res = await api.patch('/profile/me', data);
    return res.data?.data ? res.data.data : res.data;
  },

  updateStatusSignal: async (data: UpdateStatusSignalPayload): Promise<{ statusSignal: UserStatusSignal; customStatus?: string }> => {
    const res = await api.patch('/profile/status', data);
    return res.data?.data ? res.data.data : res.data;
  },

  changePassword: async (data: ChangePasswordPayload): Promise<{ message: string }> => {
    const res = await api.patch('/profile/change-password', data);
    return res.data?.data ? res.data.data : res.data;
  },

  getPersonalStats: async (): Promise<PersonalStatsResponse> => {
    const res = await api.get('/profile/stats');
    return res.data?.data ? res.data.data : res.data;
  },
};
