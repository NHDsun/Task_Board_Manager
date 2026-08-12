import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
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
  isAuthenticated: !!localStorage.getItem('solaris_token'),
  setAuth: (user, token) => {
    localStorage.setItem('solaris_token', token);
    localStorage.setItem('solaris_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('solaris_token');
    localStorage.removeItem('solaris_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
