import { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { MainLayout } from './layouts/MainLayout';
import { Kanban, Video, MessageSquare, Clock, Inbox, Users, Settings } from 'lucide-react';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentRoute, setCurrentRoute] = useState('/profile');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Render view based on active route wrapped inside MainLayout with persistent MeteorEdgeMenu
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/profile':
        return <ProfilePage />;
      case '/tasks':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30">
              <h1 className="text-3xl font-extrabold text-amber-300 flex items-center gap-3">
                <Kanban className="w-8 h-8 text-amber-400" />
                Bảng Task Workspace (Giai Đoạn 2 Kanban)
              </h1>
              <p className="text-slate-300 mt-2">
                Hệ thống Bảng Kanban 6 cột kéo thả mượt mà, Tiến trình Pipeline Stage & Hàng chờ cá nhân My Focus Queue.
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
                Hệ thống Video Call WebRTC HD, Chia sẻ Màn hình 1-Click và tự động cập nhật quầng sáng trạng thái <span className="text-purple-400 font-bold">🟣 IN_MEETING</span>.
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
                Tin Nhắn Chat 1-1 & Cuộc Gọi
              </h1>
              <p className="text-slate-300 mt-2">
                Hệ thống DirectMessage real-time và nhật ký cuộc gọi CallLog.
              </p>
            </div>
          </div>
        );
      case '/attendance':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-emerald-500/30">
              <h1 className="text-3xl font-extrabold text-emerald-300 flex items-center gap-3">
                <Clock className="w-8 h-8 text-emerald-400" />
                Chấm Công Giọng Nói & Geofencing (Solaris Smart Attendance)
              </h1>
              <p className="text-slate-300 mt-2">
                Chấm công bằng giọng nói Tiếng Việt ("Solaris, tôi bắt đầu ca làm việc"), Task-Driven Check-In tự động & Huy hiệu Solaris Streak.
              </p>
            </div>
          </div>
        );
      case '/requests':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30">
              <h1 className="text-3xl font-extrabold text-amber-300 flex items-center gap-3">
                <Inbox className="w-8 h-8 text-amber-400" />
                Yêu Cầu Chuyển Giao & Hỗ Trợ Task (Task Requests)
              </h1>
              <p className="text-slate-300 mt-2">
                Danh sách Yêu cầu TRANSFER / ASSIST / REVIEW ở trạng thái <span className="text-amber-400 font-bold">PENDING</span> chờ duyệt.
              </p>
            </div>
          </div>
        );
      case '/admin/users':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-rose-500/30">
              <h1 className="text-3xl font-extrabold text-rose-300 flex items-center gap-3">
                <Users className="w-8 h-8 text-rose-400" />
                Quản Lý Nhân Sự (Admin-Only Account Provisioning)
              </h1>
              <p className="text-slate-300 mt-2">
                Tạo tài khoản nhân viên mới, phân quyền RBAC và gán Phòng ban (Department).
              </p>
            </div>
          </div>
        );
      case '/settings':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-slate-500/30">
              <h1 className="text-3xl font-extrabold text-slate-200 flex items-center gap-3">
                <Settings className="w-8 h-8 text-slate-400" />
                Cấu Hình Hệ Thống & Tùy Chỉnh
              </h1>
              <p className="text-slate-300 mt-2">
                Tùy chỉnh giao diện Dark Sun Eclipse, phím tắt và thông báo.
              </p>
            </div>
          </div>
        );
      default:
        return <ProfilePage />;
    }
  };

  return (
    <MainLayout currentRoute={currentRoute} onNavigate={(route) => setCurrentRoute(route)}>
      {renderCurrentView()}
    </MainLayout>
  );
}
