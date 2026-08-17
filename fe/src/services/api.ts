import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/google');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('solaris_refresh_token');

      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`;
        const { data } = await axios.post(refreshUrl, { refreshToken });

        const resPayload = data?.data ? data.data : data;
        const newAccessToken = resPayload.accessToken;
        const newRefreshToken = resPayload.refreshToken;

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
