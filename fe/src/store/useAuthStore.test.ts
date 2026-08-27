import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import type { User } from '../types/auth';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('should initialize with null state when localStorage is empty', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should correctly set auth and update localStorage', () => {
    const mockUser: User = {
      id: 'u-test',
      email: 'tester@solaris.io',
      fullName: 'Solaris Tester',
      globalRole: 'EMPLOYEE',
      profession: 'TESTER',
      jobTitle: 'QA Engineer',
      statusSignal: 'ONLINE',
      workMode: 'OFFICE',
    };

    useAuthStore.getState().setAuth(mockUser, 'access-token-123', 'refresh-token-456');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe('u-test');
    expect(state.token).toBe('access-token-123');
    expect(state.refreshToken).toBe('refresh-token-456');
    expect(localStorage.getItem('solarisToken')).toBe('access-token-123');
    expect(localStorage.getItem('solarisRefreshToken')).toBe('refresh-token-456');
  });

  it('should update user profile fields partially', () => {
    const mockUser: User = {
      id: 'u-test',
      email: 'tester@solaris.io',
      fullName: 'Solaris Tester',
      globalRole: 'EMPLOYEE',
      profession: 'TESTER',
      jobTitle: 'QA Engineer',
      statusSignal: 'ONLINE',
      workMode: 'OFFICE',
    };

    useAuthStore.getState().setAuth(mockUser, 'token-123');
    useAuthStore.getState().updateUser({ fullName: 'Updated Tester', statusSignal: 'BUSY' });

    const state = useAuthStore.getState();
    expect(state.user?.fullName).toBe('Updated Tester');
    expect(state.user?.statusSignal).toBe('BUSY');
    expect(state.user?.email).toBe('tester@solaris.io');
  });

  it('should clear tokens and user state on logout', () => {
    const mockUser: User = {
      id: 'u-test',
      email: 'tester@solaris.io',
      fullName: 'Solaris Tester',
      globalRole: 'EMPLOYEE',
      profession: 'TESTER',
      jobTitle: 'QA Engineer',
      statusSignal: 'ONLINE',
      workMode: 'OFFICE',
    };

    useAuthStore.getState().setAuth(mockUser, 'token-123', 'refresh-123');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('solarisToken')).toBeNull();
    expect(localStorage.getItem('solarisRefreshToken')).toBeNull();
  });
});
