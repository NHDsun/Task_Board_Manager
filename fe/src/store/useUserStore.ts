import { create } from 'zustand';
import type { GlobalRole, Profession, UserStatusSignal, User } from '../types/auth';
import { DEFAULT_COVER, getAvatarUrl } from '../utils/avatar';
import { api } from '../services/api';

export interface DirectoryUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  coverImage?: string;
  globalRole: GlobalRole;
  profession: Profession;
  jobTitle: string;
  department: string;
  statusSignal: UserStatusSignal;
  customStatus?: string;
  bio?: string;
  workMode: 'OFFICE' | 'REMOTE';
  isActive: boolean;
  joinedDate: string;
  projectsCount: number;
  tasksCount: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  assignedProjects?: string[];
  recentTasks?: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: string;
  }>;
}

export interface UserWorkload {
  totalActiveTasks: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
  urgent: number;
}

interface BackendDepartment {
  id?: string;
  name?: string;
  code?: string;
}

interface BackendUserResponse {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: GlobalRole;
  profession?: Profession;
  jobTitle?: string;
  department?: BackendDepartment | string | null;
  statusSignal?: UserStatusSignal;
  customStatus?: string;
  bio?: string;
  workMode?: 'OFFICE' | 'REMOTE';
  isActive?: boolean;
  createdAt?: string;
  coverImage?: string;
  avatar?: string;
  avatarUrl?: string;
}

interface UserStoreState {
  users: DirectoryUser[];
  viewingUserId: string | null;
  isLoading: boolean;
  error: string | null;

  // Workload state
  workload: UserWorkload | null;
  isLoadingWorkload: boolean;
  workloadError: string | null;

  // Actions
  setViewingUserId: (userId: string | null) => void;
  fetchUsers: () => Promise<void>;
  fetchUserWorkload: (userId: string) => Promise<void>;
  addUser: (user: DirectoryUser) => void;
  updateDirectoryUser: (id: string, partial: Partial<DirectoryUser>) => void;
  deleteUser: (id: string) => Promise<void>;
  syncWithAuthUser: (authUser: User) => void;
  getUserById: (id: string) => DirectoryUser | undefined;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  viewingUserId: null,
  isLoading: false,
  error: null,

  workload: null,
  isLoadingWorkload: false,
  workloadError: null,

  setViewingUserId: (userId) => {
    set({ viewingUserId: userId });
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users');
      const res = response.data;

      let rawUsers: BackendUserResponse[] = [];
      if (Array.isArray(res?.data?.data)) {
        rawUsers = res.data.data;
      } else if (Array.isArray(res?.data)) {
        rawUsers = res.data;
      } else if (Array.isArray(res)) {
        rawUsers = res;
      }

      const mappedUsers: DirectoryUser[] = rawUsers.map((u: BackendUserResponse) => {
        const departmentName =
          typeof u.department === 'string'
            ? u.department
            : (u.department as { name?: string } | null | undefined)?.name || 'Chưa phân bổ';

        const userAvatar = getAvatarUrl(u as unknown as User) || u.avatar || DEFAULT_COVER;

        return {
          id: u.id,
          fullName: u.fullName || u.name || 'Người dùng',
          email: u.email,
          phone: u.phone || '',
          avatar: userAvatar,
          avatarUrl: userAvatar,
          coverImage: u.coverImage || DEFAULT_COVER,
          globalRole: u.role || 'EMPLOYEE',
          profession: u.profession || 'DEV',
          jobTitle: u.jobTitle || 'Chuyên viên',
          department: departmentName,
          statusSignal: u.statusSignal || 'ONLINE',
          customStatus: u.customStatus || '',
          bio: u.bio || '',
          workMode: u.workMode || 'OFFICE',
          isActive: u.isActive ?? true,
          joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '',
          projectsCount: 0,
          tasksCount: {
            total: 0,
            completed: 0,
            inProgress: 0,
            overdue: 0,
          },
        };
      });

      set({ users: mappedUsers, isLoading: false });
    } catch (err: unknown) {
      console.error('Fetch users error:', err);
      const message =
        err instanceof Error ? err.message : 'Không thể tải danh sách nhân sự';
      set({ error: message, isLoading: false });
    }
  },

  fetchUserWorkload: async (userId: string) => {
    set({ isLoadingWorkload: true, workloadError: null });
    try {
      const response = await api.get(`/users/${userId}/workload`);
      const payload: UserWorkload =
        (response.data as { workload?: UserWorkload })?.workload ||
        (response.data as { data?: UserWorkload })?.data ||
        (response.data as UserWorkload);

      set({ workload: payload, isLoadingWorkload: false });
    } catch (err: unknown) {
      console.error('Fetch workload error:', err);
      const message =
        err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu khối lượng công việc';
      set({
        workload: null,
        workloadError: message,
        isLoadingWorkload: false,
      });
    }
  },

  addUser: (newUser) => {
    set((state) => ({ users: [newUser, ...state.users] }));
  },

  updateDirectoryUser: (id, partial) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...partial } : u)),
    }));
  },

  deleteUser: async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
    } catch (err: unknown) {
      console.error('Delete user error:', err);
      throw err;
    }
  },

  syncWithAuthUser: (authUser) => {
    set((state) => {
      const av = getAvatarUrl(authUser);
      const updated = state.users.map((u) => {
        if (u.id === authUser.id || u.email === authUser.email) {
          return {
            ...u,
            fullName: authUser.fullName || u.fullName,
            phone: authUser.phone || u.phone,
            jobTitle: authUser.jobTitle || u.jobTitle,
            profession: authUser.profession || u.profession,
            bio: authUser.bio || u.bio,
            avatar: av,
            avatarUrl: av,
            coverImage: authUser.coverImage || u.coverImage || DEFAULT_COVER,
            statusSignal: authUser.statusSignal || u.statusSignal,
            customStatus: authUser.customStatus || u.customStatus,
            globalRole: authUser.globalRole || u.globalRole,
          };
        }
        return u;
      });
      return { users: updated };
    });
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id);
  },
}));