import { create } from 'zustand';
import type { GlobalRole, Profession, UserStatusSignal, User } from '../types/auth';
import { DEFAULT_COVER, getAvatarUrl } from '../utils/avatar';

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

const DEFAULT_USERS: DirectoryUser[] = [
  {
    id: 'u-1',
    fullName: 'Nguyễn Huy Đạt',
    email: 'huydatne@gmail.com',
    phone: '0988 123 456',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverImage: DEFAULT_COVER,
    globalRole: 'ADMIN',
    profession: 'DEV',
    jobTitle: 'Principal Lead Architect',
    department: 'Engineering',
    statusSignal: 'ONLINE',
    bio: 'Lead System Architect & Core Platform Designer. Đam mê xây dựng hạ tầng thời gian thực và trải nghiệm Solar Glassmorphism 60 FPS.',
    workMode: 'OFFICE',
    isActive: true,
    joinedDate: '15/01/2025',
    projectsCount: 6,
    tasksCount: { total: 18, completed: 14, inProgress: 4, overdue: 0 },
    assignedProjects: [
      'Solaris Core Task Board Engine',
      'Enterprise RBAC & Authentication Module',
      'Voice Assistant & WebRTC Integration',
    ],
    recentTasks: [
      { id: 't-101', title: 'Tối ưu hóa hiệu năng render ma trận Kanban 60 FPS', status: 'DONE', dueDate: '20/08/2026' },
      { id: 't-102', title: 'Triệt tiêu 98 Logic Conflicts trong phân rã Subtasks', status: 'DONE', dueDate: '22/08/2026' },
      { id: 't-103', title: 'Đồng bộ hóa User Profile toàn hệ thống', status: 'IN_PROGRESS', dueDate: '26/08/2026' },
    ],
  },
  {
    id: 'u-2',
    fullName: 'Trần Hoàng Nam',
    email: 'manager@solaris.io',
    phone: '0912 345 678',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    globalRole: 'MANAGER',
    profession: 'PRODUCT_OWNER',
    jobTitle: 'Senior Project Lead',
    department: 'Product & Planning',
    statusSignal: 'BUSY',
    bio: 'Chuyên gia hoạch định chiến lược sản phẩm và điều phối phân kỳ phát triển Staging/Production.',
    workMode: 'OFFICE',
    isActive: true,
    joinedDate: '01/03/2025',
    projectsCount: 4,
    tasksCount: { total: 15, completed: 10, inProgress: 5, overdue: 0 },
    assignedProjects: ['Solaris Core Task Board Engine', 'Mobile Responsive App'],
    recentTasks: [
      { id: 't-201', title: 'Kiểm duyệt Sprint Backlog Giai đoạn #3', status: 'DONE', dueDate: '18/08/2026' },
      { id: 't-202', title: 'Phê duyệt các yêu cầu Remote Work', status: 'IN_PROGRESS', dueDate: '25/08/2026' },
    ],
  },
  {
    id: 'u-3',
    fullName: 'Lê Minh Anh',
    email: 'minhanh.uiux@solaris.io',
    phone: '0933 888 999',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    globalRole: 'EMPLOYEE',
    profession: 'DESIGNER',
    jobTitle: 'UI/UX Design Specialist',
    department: 'Design & UX',
    statusSignal: 'IN_MEETING',
    bio: 'Thiết kế giao diện Dark Theme Cosmic Glassmorphism, Micro-interactions và Design System.',
    workMode: 'REMOTE',
    isActive: true,
    joinedDate: '10/05/2025',
    projectsCount: 3,
    tasksCount: { total: 12, completed: 8, inProgress: 4, overdue: 1 },
    assignedProjects: ['Design System 2.0', 'Solaris Mobile App UI'],
    recentTasks: [
      { id: 't-301', title: 'Thiết kế Iconography phát sáng phong cách Solar Corona', status: 'DONE', dueDate: '15/08/2026' },
      { id: 't-302', title: 'Hoàn thiện giao diện Bento Grid cho Lịch Làm Việc', status: 'IN_PROGRESS', dueDate: '27/08/2026' },
    ],
  },
  {
    id: 'u-4',
    fullName: 'Phạm Thanh Tùng',
    email: 'tung.dev@solaris.io',
    phone: '0909 555 666',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    globalRole: 'EMPLOYEE',
    profession: 'DEV',
    jobTitle: 'Fullstack Nest/React Dev',
    department: 'Engineering',
    statusSignal: 'ONLINE',
    bio: 'Kỹ sư Fullstack phụ trách Prisma ORM, WebSocket Gateway và tối ưu hóa truy vấn CSDL.',
    workMode: 'OFFICE',
    isActive: true,
    joinedDate: '20/06/2025',
    projectsCount: 5,
    tasksCount: { total: 20, completed: 16, inProgress: 4, overdue: 0 },
    assignedProjects: ['Solaris Core Task Board Engine', 'High-speed Search Cache'],
    recentTasks: [
      { id: 't-401', title: 'Tích hợp Idempotency Interceptor chống click spam', status: 'DONE', dueDate: '19/08/2026' },
      { id: 't-402', title: 'Cấu hình Docker Compose Multi-Stage Build', status: 'DONE', dueDate: '21/08/2026' },
    ],
  },
  {
    id: 'u-5',
    fullName: 'Võ Thị Lan Hương',
    email: 'huong.qa@solaris.io',
    phone: '0977 444 333',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    globalRole: 'EMPLOYEE',
    profession: 'TESTER',
    jobTitle: 'QA/QC Automation Lead',
    department: 'QA & Testing',
    statusSignal: 'AWAY',
    bio: 'Kiểm thử hộp đen, Stress Testing và tự động hóa End-to-End Test luồng nghiệp vụ.',
    workMode: 'OFFICE',
    isActive: true,
    joinedDate: '12/08/2025',
    projectsCount: 4,
    tasksCount: { total: 14, completed: 11, inProgress: 3, overdue: 0 },
    assignedProjects: ['Solaris Core Task Board Engine'],
    recentTasks: [
      { id: 't-501', title: 'Kiểm thử tình huống biên CC-01 khôi phục Task từ Thùng Rác', status: 'DONE', dueDate: '23/08/2026' },
    ],
  },
  {
    id: 'u-6',
    fullName: 'Đặng Quốc Bảo',
    email: 'bao.devops@solaris.io',
    phone: '0966 222 111',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    globalRole: 'EMPLOYEE',
    profession: 'DEVOPS',
    jobTitle: 'Cloud Infrastructure & SRE',
    department: 'Operations & SRE',
    statusSignal: 'OFFLINE',
    bio: 'Hạ tầng điện toán đám mây, CI/CD Pipeline, Nginx Reverse Proxy và Docker Swarm.',
    workMode: 'REMOTE',
    isActive: false,
    joinedDate: '05/11/2025',
    projectsCount: 2,
    tasksCount: { total: 8, completed: 8, inProgress: 0, overdue: 0 },
    assignedProjects: ['Infrastructure Core'],
    recentTasks: [],
  },
];

interface UserStoreState {
  users: DirectoryUser[];
  viewingUserId: string | null;
  setViewingUserId: (userId: string | null) => void;
  addUser: (user: DirectoryUser) => void;
  updateDirectoryUser: (id: string, partial: Partial<DirectoryUser>) => void;
  deleteUser: (id: string) => void;
  syncWithAuthUser: (authUser: User) => void;
  getUserById: (id: string) => DirectoryUser | undefined;
}

const getStoredUsers = (): DirectoryUser[] => {
  try {
    const saved = localStorage.getItem('solaris_user_directory');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
};

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: getStoredUsers(),
  viewingUserId: null,

  setViewingUserId: (userId) => {
    set({ viewingUserId: userId });
  },

  addUser: (newUser) => {
    set((state) => {
      const updated = [newUser, ...state.users];
      localStorage.setItem('solaris_user_directory', JSON.stringify(updated));
      return { users: updated };
    });
  },

  updateDirectoryUser: (id, partial) => {
    set((state) => {
      const updated = state.users.map((u) => (u.id === id ? { ...u, ...partial } : u));
      localStorage.setItem('solaris_user_directory', JSON.stringify(updated));
      return { users: updated };
    });
  },

  deleteUser: (id) => {
    set((state) => {
      const updated = state.users.filter((u) => u.id !== id);
      localStorage.setItem('solaris_user_directory', JSON.stringify(updated));
      return { users: updated };
    });
  },

  syncWithAuthUser: (authUser) => {
    set((state) => {
      let matched = false;
      const av = getAvatarUrl(authUser);
      const updated = state.users.map((u) => {
        if (u.id === authUser.id || u.email === authUser.email) {
          matched = true;
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

      if (!matched && authUser.id) {
        const newEntry: DirectoryUser = {
          id: authUser.id,
          fullName: authUser.fullName || 'Người dùng mới',
          email: authUser.email || 'user@solaris.io',
          phone: authUser.phone || '',
          avatar: av,
          avatarUrl: av,
          coverImage: authUser.coverImage || DEFAULT_COVER,
          globalRole: authUser.globalRole || 'EMPLOYEE',
          profession: authUser.profession || 'DEV',
          jobTitle: authUser.jobTitle || 'Software Specialist',
          department: 'Engineering',
          statusSignal: authUser.statusSignal || 'ONLINE',
          bio: authUser.bio || '',
          workMode: 'OFFICE',
          isActive: true,
          joinedDate: new Date().toLocaleDateString('vi-VN'),
          projectsCount: 1,
          tasksCount: { total: 5, completed: 3, inProgress: 2, overdue: 0 },
        };
        updated.unshift(newEntry);
      }

      localStorage.setItem('solaris_user_directory', JSON.stringify(updated));
      return { users: updated };
    });
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id);
  },
}));
