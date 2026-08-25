import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { profileService } from '../services/profile';
import type { UserStatusSignal } from '../types/auth';

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 phút không cử động -> AWAY
const THROTTLE_UPDATE_MS = 15 * 1000; // Throttle gọi API backend tối đa 1 lần/15s

export const useAutoStatusSignal = () => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const syncWithAuthUser = useUserStore((state) => state.syncWithAuthUser);

  const lastStatusRef = useRef<UserStatusSignal>(user?.statusSignal || 'ONLINE');
  const lastApiCallTimeRef = useRef<number>(0);
  const idleTimerRef = useRef<any>(null);
  const isTabHiddenRef = useRef<boolean>(false);

  // Cập nhật trạng thái tự động & đồng bộ toàn hệ thống
  const setStatus = useCallback(
    async (newSignal: UserStatusSignal) => {
      if (!isAuthenticated || !user) return;
      if (lastStatusRef.current === newSignal) return;

      lastStatusRef.current = newSignal;
      const updatedUser = { ...user, statusSignal: newSignal };
      updateUser(updatedUser);
      syncWithAuthUser(updatedUser);

      // Đồng bộ ngầm lên Backend (nếu có API)
      const now = Date.now();
      if (now - lastApiCallTimeRef.current > THROTTLE_UPDATE_MS) {
        lastApiCallTimeRef.current = now;
        try {
          await profileService.updateStatusSignal({ statusSignal: newSignal });
        } catch {
          // Bỏ qua lỗi backend nếu offline
        }
      }
    },
    [isAuthenticated, user, updateUser, syncWithAuthUser]
  );

  // Khi có cử chỉ của người dùng -> Khôi phục ONLINE & reset đếm ngược
  const handleUserActivity = useCallback(() => {
    if (isTabHiddenRef.current) return;

    if (lastStatusRef.current !== 'ONLINE') {
      setStatus('ONLINE');
    }

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      setStatus('AWAY');
    }, IDLE_TIMEOUT_MS);
  }, [setStatus]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Khởi tạo -> ONLINE
    setStatus('ONLINE');

    // 1. Lắng nghe mọi tương tác (chuột, phím, chạm, cuộn trang)
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivityThrottled = () => {
      handleUserActivity();
    };

    activityEvents.forEach((ev) => {
      window.addEventListener(ev, handleActivityThrottled, { passive: true });
    });

    // Bắt đầu hẹn giờ Idle
    idleTimerRef.current = setTimeout(() => {
      setStatus('AWAY');
    }, IDLE_TIMEOUT_MS);

    // 2. Chuyển tab hoặc thu nhỏ trình duyệt
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        isTabHiddenRef.current = true;
        setStatus('AWAY');
      } else {
        isTabHiddenRef.current = false;
        setStatus('ONLINE');
        handleUserActivity();
      }
    };

    // 3. Mất mạng hoặc có mạng trở lại
    const handleOnline = () => {
      isTabHiddenRef.current = false;
      setStatus('ONLINE');
    };

    const handleOffline = () => {
      setStatus('OFFLINE');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, handleActivityThrottled);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isAuthenticated, user?.id, handleUserActivity, setStatus]);
};
