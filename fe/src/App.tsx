import { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { BoardPage } from './pages/BoardPage';
import { MainLayout } from './layouts/MainLayout';
import { Video, MessageSquare, Inbox, Users, Clock } from 'lucide-react';

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
        return <ProfilePage onNavigate={(route) => setCurrentRoute(route)} />;
      case '/tasks':
        return <BoardPage />;
      case '/remote-requests':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-emerald-500/30">
              <h1 className="text-3xl font-extrabold text-emerald-300 flex items-center gap-3">
                <Inbox className="w-8 h-8 text-emerald-400" />
                Yêu Cầu Làm Việc Từ Xa (Remote Work Requests)
              </h1>
              <p className="text-slate-300 mt-2">
                Gửi Đơn xin làm Remote chọn ngày, nhập lý do &amp; kế hoạch công việc. Trạng thái PENDING chờ Manager/Admin duyệt (APPROVED ➡️ Tự động chuyển workMode = REMOTE trong CSDL Chấm công).
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
                Tin Nhắn Chat 1-1 &amp; Cuộc Gọi
              </h1>
              <p className="text-slate-300 mt-2">
                Hệ thống DirectMessage real-time và nhật ký cuộc gọi CallLog.
              </p>
            </div>
          </div>
        );
      case '/admin/attendance':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30">
              <h1 className="text-3xl font-extrabold text-amber-300 flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-400" />
                Giám Sát Chấm Công Toàn Công Ty (Admin Attendance Monitoring)
              </h1>
              <p className="text-slate-300 mt-2">
                Bảng nhật ký điểm danh toàn bộ nhân sự công ty, theo dõi ca làm việc, lọc theo ngày/tuần/tháng, phòng ban và địa điểm Geofencing (<span className="text-emerald-400 font-bold">OFFICE</span> vs <span className="text-blue-400 font-bold">REMOTE</span>).
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
      default:
        return <ProfilePage onNavigate={(route) => setCurrentRoute(route)} />;
    }
  };

  return (
    <MainLayout currentRoute={currentRoute} onNavigate={(route) => setCurrentRoute(route)}>
      {renderCurrentView()}
    </MainLayout>
  );
}
