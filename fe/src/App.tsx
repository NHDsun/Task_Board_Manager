import React, { useState, useEffect, Component, type ReactNode } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { BoardPage } from './pages/BoardPage';
import { SchedulePage } from './pages/SchedulePage';
import { AdminTrashPage } from './pages/AdminTrashPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { OnboardingProfilePage } from './pages/OnboardingProfilePage';
import { useAutoStatusSignal } from './hooks/useAutoStatusSignal';
import { MainLayout } from './layouts/MainLayout';
import { Video, MessageSquare, Inbox, AlertTriangle, RotateCcw } from 'lucide-react';

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
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
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
    // 🛡️ Guard Quản lý nhân sự: Chỉ dành cho Admin
    if (route === '/admin/users' && !isAdmin) {
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
        if (path === '/admin/users' && !isAdmin) {
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
    return <LoginPage />;
  }

  // 🚀 FIRST-TIME LOGIN ONBOARDING CHECK
  const isFirstTimeUser =
    currentUser?.isFirstLogin === true ||
    (currentUser?.id && localStorage.getItem(`solaris_onboarded_${currentUser.id}`) === 'needs_onboarding');

  if (isFirstTimeUser) {
    return (
      <ErrorBoundary>
        <OnboardingProfilePage onComplete={() => handleNavigate('/tasks')} />
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
      case '/remote-requests':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-emerald-500/30">
              <h1 className="text-3xl font-extrabold text-emerald-300 flex items-center gap-3">
                <Inbox className="w-8 h-8 text-emerald-400" />
                Yêu Cầu Làm Việc Từ Xa (Remote Work Requests)
              </h1>
              <p className="text-slate-300 mt-2">
                Gửi Đơn xin làm Remote chọn ngày, nhập lý do &amp; kế hoạch công việc. Trạng thái PENDING chờ Manager/Admin duyệt.
              </p>
            </div>
          </div>
        );
      case '/meetings':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-purple-500/30">
              <h1 className="text-3xl font-extrabold text-purple-300 flex items-center gap-3">
                <Video className="w-8 h-8 text-purple-400" />
                Phòng Họp Trực Tuyến WebRTC
              </h1>
              <p className="text-slate-300 mt-2">
                Hệ thống Video Call WebRTC HD, Chia sẻ Màn hình 1-Click và tự động cập nhật quầng sáng trạng thái.
              </p>
            </div>
          </div>
        );
      case '/messages':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-cyan-500/30">
              <h1 className="text-3xl font-extrabold text-cyan-300 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-cyan-400" />
                Tin Nhắn Chat 1-1 &amp; Cuộc Gọi
              </h1>
              <p className="text-slate-300 mt-2">
                Hệ thống DirectMessage real-time và nhật ký cuộc gọi CallLog.
              </p>
            </div>
          </div>
        );
      case '/admin/users':
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
        {renderCurrentView()}
      </MainLayout>
    </ErrorBoundary>
  );
}
