import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

const getInitialUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('solaris_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('solaris_token'),
  refreshToken: localStorage.getItem('solaris_refresh_token'),
  isAuthenticated: !!localStorage.getItem('solaris_token'),
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('solaris_token', token);
    localStorage.setItem('solaris_user', JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('solaris_refresh_token', refreshToken);
    }
    set({ user, token, refreshToken: refreshToken || localStorage.getItem('solaris_refresh_token'), isAuthenticated: true });
  },
  setTokens: (token, refreshToken) => {
    localStorage.setItem('solaris_token', token);
    if (refreshToken) {
      localStorage.setItem('solaris_refresh_token', refreshToken);
    }
    set({ token, refreshToken: refreshToken || localStorage.getItem('solaris_refresh_token') });
  },
  logout: () => {
    localStorage.removeItem('solaris_token');
    localStorage.removeItem('solaris_refresh_token');
    localStorage.removeItem('solaris_user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },
}));
