import { describe, it, expect } from 'vitest';
import type { DirectoryUser } from '../store/useUserStore';

function filterDirectoryUsers(
  users: DirectoryUser[],
  searchQuery: string,
  selectedRole: string,
  selectedDepartment: string,
  selectedStatus: string
): DirectoryUser[] {
  return users.filter((u) => {
    const matchQuery =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole = selectedRole === 'ALL' || u.globalRole === selectedRole;
    const matchDept = selectedDepartment === 'Tất Cả' || u.department === selectedDepartment;
    const matchStatus = selectedStatus === 'ALL' || u.statusSignal === selectedStatus;

    return matchQuery && matchRole && matchDept && matchStatus;
  });
}

function calculateMetrics(users: DirectoryUser[]) {
  const total = users.length;
  const online = users.filter((u) => u.statusSignal === 'ONLINE' || u.statusSignal === 'BUSY').length;
  const managers = users.filter((u) => u.globalRole === 'MANAGER').length;
  const active = users.filter((u) => u.isActive).length;
  return { total, online, managers, active };
}

function validateCreateUserForm(fullName: string, email: string, password: string): { isValid: boolean; error?: string } {
  if (!fullName.trim() || !email.trim() || !password.trim()) {
    return { isValid: false, error: 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu khởi tạo!' };
  }
  return { isValid: true };
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pass = 'Sol@';
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

function canShowPermanentDelete(user: DirectoryUser): boolean {
  // 🔒 [LC-102] Chỉ cho phép hiển thị nút xóa vĩnh viễn khi tài khoản ĐÃ BỊ KHÓA
  return !user.isActive;
}

describe('Admin Users Page Logic & Business Rules (Quản Lý Nhân Sự)', () => {
  const mockUsers: DirectoryUser[] = [
    {
      id: 'u-1',
      fullName: 'Nguyễn Huy Đạt',
      email: 'huydatne@gmail.com',
      globalRole: 'ADMIN',
      profession: 'DEV',
      jobTitle: 'Principal Lead Architect',
      department: 'Engineering',
      statusSignal: 'ONLINE',
      isActive: true,
      joinedDate: '15/01/2025',
      projectsCount: 6,
      tasksCount: { total: 18, completed: 14, inProgress: 4, overdue: 0 },
      workMode: 'OFFICE',
    },
    {
      id: 'u-2',
      fullName: 'Trần Hoàng Nam',
      email: 'manager@solaris.io',
      globalRole: 'MANAGER',
      profession: 'PRODUCT_OWNER',
      jobTitle: 'Senior Project Lead',
      department: 'Product & Planning',
      statusSignal: 'BUSY',
      isActive: true,
      joinedDate: '01/03/2025',
      projectsCount: 4,
      tasksCount: { total: 15, completed: 10, inProgress: 5, overdue: 0 },
      workMode: 'OFFICE',
    },
    {
      id: 'u-3',
      fullName: 'Lê Minh Anh',
      email: 'minhanh.uiux@solaris.io',
      globalRole: 'EMPLOYEE',
      profession: 'DESIGNER',
      jobTitle: 'Senior UI/UX Designer',
      department: 'Design & UX',
      statusSignal: 'AWAY',
      isActive: true,
      joinedDate: '10/02/2025',
      projectsCount: 3,
      tasksCount: { total: 12, completed: 8, inProgress: 4, overdue: 0 },
      workMode: 'OFFICE',
    },
    {
      id: 'u-4',
      fullName: 'Phạm Quốc Bảo',
      email: 'baopq@solaris.io',
      globalRole: 'EMPLOYEE',
      profession: 'TESTER',
      jobTitle: 'Senior QA Automation',
      department: 'QA & Testing',
      statusSignal: 'OFFLINE',
      isActive: false, // Tài khoản đã bị khóa
      joinedDate: '20/04/2025',
      projectsCount: 1,
      tasksCount: { total: 4, completed: 1, inProgress: 3, overdue: 0 },
      workMode: 'REMOTE',
    },
  ];

  describe('1. Search & Filter Logic', () => {
    it('should search by full name case-insensitively', () => {
      const result = filterDirectoryUsers(mockUsers, 'Huy Đạt', 'ALL', 'Tất Cả', 'ALL');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('u-1');
    });

    it('should search by email', () => {
      const result = filterDirectoryUsers(mockUsers, 'manager@solaris.io', 'ALL', 'Tất Cả', 'ALL');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('u-2');
    });

    it('should search by job title', () => {
      const result = filterDirectoryUsers(mockUsers, 'Designer', 'ALL', 'Tất Cả', 'ALL');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('u-3');
    });

    it('should filter by role', () => {
      const admins = filterDirectoryUsers(mockUsers, '', 'ADMIN', 'Tất Cả', 'ALL');
      expect(admins.length).toBe(1);

      const managers = filterDirectoryUsers(mockUsers, '', 'MANAGER', 'Tất Cả', 'ALL');
      expect(managers.length).toBe(1);

      const employees = filterDirectoryUsers(mockUsers, '', 'EMPLOYEE', 'Tất Cả', 'ALL');
      expect(employees.length).toBe(2);
    });

    it('should filter by department', () => {
      const eng = filterDirectoryUsers(mockUsers, '', 'ALL', 'Engineering', 'ALL');
      expect(eng.length).toBe(1);

      const qa = filterDirectoryUsers(mockUsers, '', 'ALL', 'QA & Testing', 'ALL');
      expect(qa.length).toBe(1);
    });

    it('should filter by status signal', () => {
      const online = filterDirectoryUsers(mockUsers, '', 'ALL', 'Tất Cả', 'ONLINE');
      expect(online.length).toBe(1);

      const offline = filterDirectoryUsers(mockUsers, '', 'ALL', 'Tất Cả', 'OFFLINE');
      expect(offline.length).toBe(1);
    });

    it('should combine search query, role, and department filters', () => {
      const result = filterDirectoryUsers(mockUsers, 'Senior', 'EMPLOYEE', 'Design & UX', 'ALL');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('u-3');
    });
  });

  describe('2. KPI & Metrics Calculation', () => {
    it('should calculate correct metrics across directory users', () => {
      const metrics = calculateMetrics(mockUsers);
      expect(metrics.total).toBe(4);
      expect(metrics.online).toBe(2); // ONLINE (1) + BUSY (1)
      expect(metrics.managers).toBe(1); // MANAGER (1)
      expect(metrics.active).toBe(3); // isActive: true (3)
    });
  });

  describe('3. Form Validation & Random Password Generator', () => {
    it('should reject form with missing required fields', () => {
      expect(validateCreateUserForm('', 'test@solaris.io', 'pass123').isValid).toBe(false);
      expect(validateCreateUserForm('Test User', '', 'pass123').isValid).toBe(false);
      expect(validateCreateUserForm('Test User', 'test@solaris.io', '').isValid).toBe(false);
    });

    it('should approve valid form input', () => {
      const validation = validateCreateUserForm('Nguyễn Văn A', 'nva@solaris.io', 'Solaris@2026');
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should generate secure random password starting with Sol@', () => {
      const pass = generateRandomPassword();
      expect(pass.startsWith('Sol@')).toBe(true);
      expect(pass.length).toBe(10); // 'Sol@' (4) + 6 random chars
    });
  });

  describe('4. Security & Two-Step Deletion Flow [LC-102]', () => {
    it('should hide permanent delete button for Active users', () => {
      const activeUser = mockUsers[0]; // isActive: true
      expect(canShowPermanentDelete(activeUser)).toBe(false);
    });

    it('should show permanent delete button ONLY when user is Locked (isActive: false)', () => {
      const lockedUser = mockUsers[3]; // isActive: false
      expect(canShowPermanentDelete(lockedUser)).toBe(true);
    });
  });
});
