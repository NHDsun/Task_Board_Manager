import React, { useState, useEffect, Component, Suspense, type ReactNode } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useAutoStatusSignal } from './hooks/useAutoStatusSignal';
import { MainLayout } from './layouts/MainLayout';
import { AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';

const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const BoardPage = React.lazy(() => import('./pages/BoardPage').then((m) => ({ default: m.BoardPage })));
const SchedulePage = React.lazy(() => import('./pages/SchedulePage').then((m) => ({ default: m.SchedulePage })));
const AdminTrashPage = React.lazy(() => import('./pages/AdminTrashPage').then((m) => ({ default: m.AdminTrashPage })));
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const OnboardingProfilePage = React.lazy(() => import('./pages/OnboardingProfilePage').then((m) => ({ default: m.OnboardingProfilePage })));

const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-amber-400">
    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    <span className="text-xs font-mono tracking-widest text-slate-400">ĐANG TẢI DỮ LIỆU...</span>
  </div>
);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0F172A] border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Đã Khôi Phục Giao Diện An Toàn</h2>
              <p className="text-xs text-slate-400">
                {this.state.error?.message || 'Đã xảy ra sự cố hiển thị. Hãy tải lại để đồng bộ dữ liệu mới nhất.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Tải Lại Trang (Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useAutoStatusSignal();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);

  const isAdmin = currentUser?.globalRole === 'ADMIN';

  // 🔄 Khôi phục trang hiện tại khi F5 / Reload từ URL pathname hoặc localStorage
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path && path !== '/' && path !== '/login') {
      return path;
    }
    const saved = localStorage.getItem('solaris_active_route');
    return saved || '/tasks';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);

  // 🚀 Cập nhật route, đồng bộ localStorage và URL History khi chuyển trang
  const handleNavigate = (route: string) => {
    // 🛡️ Guard Quản trị: Chỉ dành cho Admin
    if ((route === '/admin/users' || route === '/admin/departments' || route === '/admin/trash') && !isAdmin) {
      route = '/tasks';
    }
    setCurrentRoute(route);
    localStorage.setItem('solaris_active_route', route);
    try {
      if (window.location.pathname !== route) {
        window.history.pushState(null, '', route);
      }
    } catch {
      // Fallback
    }
  };

  // 🔙 Lắng nghe nút Back / Forward trên trình duyệt
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      if (path && path !== '/' && path !== '/login') {
        if ((path === '/admin/users' || path === '/admin/departments' || path === '/admin/trash') && !isAdmin) {
          setCurrentRoute('/tasks');
        } else {
          setCurrentRoute(path);
          localStorage.setItem('solaris_active_route', path);
        }
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isAdmin]);

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LoginPage />
      </Suspense>
    );
  }

  // 🚀 FIRST-TIME LOGIN ONBOARDING CHECK
  const isFirstTimeUser =
    currentUser?.isFirstLogin === true ||
    (currentUser?.id && localStorage.getItem(`solaris_onboarded_${currentUser.id}`) === 'needs_onboarding');

  if (isFirstTimeUser) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <OnboardingProfilePage onComplete={() => handleNavigate('/tasks')} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Render view based on active route wrapped inside MainLayout with persistent MeteorEdgeMenu
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case '/tasks':
        return <BoardPage />;
      case '/schedule':
        return <SchedulePage />;
      case '/admin/users':
      case '/admin/departments':
        if (!isAdmin) {
          return <BoardPage />;
        }
        return <AdminUsersPage />;
      case '/admin/trash':
        if (!isAdmin) {
          return <BoardPage />;
        }
        return <AdminTrashPage />;
      default:
        return <ProfilePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <MainLayout currentRoute={currentRoute} onNavigate={handleNavigate}>
        <Suspense fallback={<PageLoadingFallback />}>
          {renderCurrentView()}
        </Suspense>
      </MainLayout>
    </ErrorBoundary>
  );
}
