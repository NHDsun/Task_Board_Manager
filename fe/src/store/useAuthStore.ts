import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (partialUser: Partial<User>) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

const getInitialUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('solarisUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('solarisToken'),
  refreshToken: localStorage.getItem('solarisRefreshToken'),
  isAuthenticated: !!localStorage.getItem('solarisToken'),
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('solarisToken', token);
    localStorage.setItem('solarisUser', JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('solarisRefreshToken', refreshToken);
    }
    set({ user, token, refreshToken: refreshToken || localStorage.getItem('solarisRefreshToken'), isAuthenticated: true });
  },
  updateUser: (partialUser) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partialUser };
      localStorage.setItem('solarisUser', JSON.stringify(updated));
      return { user: updated };
    });
  },
  setTokens: (token, refreshToken) => {
    localStorage.setItem('solarisToken', token);
    if (refreshToken) {
      localStorage.setItem('solarisRefreshToken', refreshToken);
    }
    set({ token, refreshToken: refreshToken || localStorage.getItem('solarisRefreshToken') });
  },
  logout: () => {
    localStorage.removeItem('solarisToken');
    localStorage.removeItem('solarisRefreshToken');
    localStorage.removeItem('solarisUser');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },
}));
