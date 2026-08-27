import { describe, it, expect } from 'vitest';

interface OnboardingForm {
  fullName: string;
  phone: string;
  profession: string;
  jobTitle: string;
  department: string;
  newPassword?: string;
  confirmPassword?: string;
}

function validateOnboarding(form: OnboardingForm): { isValid: boolean; error?: string } {
  if (!form.fullName.trim()) {
    return { isValid: false, error: 'Vui lòng nhập họ và tên chính thức!' };
  }
  if (!form.profession) {
    return { isValid: false, error: 'Vui lòng chọn chuyên môn làm việc!' };
  }
  if (!form.jobTitle.trim()) {
    return { isValid: false, error: 'Vui lòng nhập chức danh công việc!' };
  }
  if (form.newPassword) {
    if (form.newPassword.length < 6) {
      return { isValid: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }
    if (form.newPassword !== form.confirmPassword) {
      return { isValid: false, error: 'Mật khẩu xác nhận không khớp với mật khẩu mới!' };
    }
  }
  return { isValid: true };
}

describe('Onboarding & First-Time Login Logic', () => {
  it('should reject form when fullName is missing', () => {
    const res = validateOnboarding({
      fullName: '',
      phone: '0900000000',
      profession: 'DEV',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('họ và tên');
  });

  it('should reject form when profession is missing', () => {
    const res = validateOnboarding({
      fullName: 'Nguyễn Văn A',
      phone: '0900000000',
      profession: '',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('chuyên môn');
  });

  it('should reject when new password is shorter than 6 characters', () => {
    const res = validateOnboarding({
      fullName: 'Nguyễn Văn A',
      phone: '0900000000',
      profession: 'DEV',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      newPassword: '123',
      confirmPassword: '123',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('ít nhất 6 ký tự');
  });

  it('should reject when confirm password does not match new password', () => {
    const res = validateOnboarding({
      fullName: 'Nguyễn Văn A',
      phone: '0900000000',
      profession: 'DEV',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      newPassword: 'Password@2026',
      confirmPassword: 'DifferentPassword@2026',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('không khớp');
  });

  it('should approve valid onboarding submission with matched password', () => {
    const res = validateOnboarding({
      fullName: 'Nguyễn Văn A',
      phone: '0900000000',
      profession: 'DEV',
      jobTitle: 'Senior Fullstack Developer',
      department: 'Engineering',
      newPassword: 'SecurePassword@2026',
      confirmPassword: 'SecurePassword@2026',
    });
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });
});
