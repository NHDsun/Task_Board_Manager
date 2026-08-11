import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('solaris_token'),
  isAuthenticated: !!localStorage.getItem('solaris_token'),
  setAuth: (user, token) => {
    localStorage.setItem('solaris_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('solaris_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
