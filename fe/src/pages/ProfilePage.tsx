import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  Shield,
  Briefcase,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Edit3,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  Video,
  LogOut
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const statusSignal = user?.statusSignal || 'ONLINE';
  const customStatus = user?.customStatus || '🟢 Đang làm việc trên Bảng Kanban Solaris...';

  const getStatusColor = (signal: string) => {
    switch (signal) {
      case 'ONLINE': return 'bg-emerald-500 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20';
      case 'BUSY': return 'bg-rose-500 text-rose-300 border-rose-500/50 shadow-rose-500/20';
      case 'IN_MEETING': return 'bg-purple-500 text-purple-300 border-purple-500/50 shadow-purple-500/20';
      case 'AWAY': return 'bg-amber-500 text-amber-300 border-amber-500/50 shadow-amber-500/20';
      default: return 'bg-slate-500 text-slate-300 border-slate-500/50';
    }
  };

  const getStatusText = (signal: string) => {
    switch (signal) {
      case 'ONLINE': return '🟢 Trực tuyến / On-Site';
      case 'BUSY': return '🔴 Đang tập trung / Bận';
      case 'IN_MEETING': return '🟣 Đang họp WebRTC';
      case 'AWAY': return '🟡 Tạm vắng';
      default: return '⚪ Ngoại tuyến';
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-x-hidden">
      {/* 🌌 Ambient Floating Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="fixed top-[40%] right-[30%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 🖼️ Cover Image Banner */}
      <div className="relative h-72 w-full overflow-hidden border-b border-amber-500/20">
        <img
          src={user?.coverImage || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80'}
          alt="Cosmic Cover Backdrop"
          className="w-full h-full object-cover object-center opacity-80 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent" />
        <div className="absolute top-6 right-8 flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-300 backdrop-blur-md transition-all duration-300 shadow-lg text-sm font-medium"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            {isEditing ? 'Lưu Thay Đổi' : 'Chỉnh Sửa Profile'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 backdrop-blur-md transition-all duration-300 shadow-lg text-sm font-medium"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* 👤 Main Profile Container */}
      <div className="max-w-7xl mx-auto px-6 relative -mt-24 pb-20">
        {/* Bento Floating Header Card */}
        <div className="solar-glass-card p-8 rounded-3xl backdrop-blur-2xl bg-[#0F172A]/80 border border-amber-500/30 shadow-2xl relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar Cluster */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-400/60 p-1 shadow-2xl bg-[#070A12] relative z-10">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={user?.fullName || 'User Avatar'}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-xl group-hover:bg-amber-400/40 transition-all duration-500" />
            </div>

            {/* User Meta Information */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  {user?.fullName || 'Huy Dat (Admin)'}
                </h1>

                {/* Role Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  {user?.globalRole || 'ADMIN'}
                </span>

                {/* Profession Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  {user?.profession || 'DEV'}
                </span>
              </div>

              <p className="text-slate-300 text-sm font-medium">
                {user?.jobTitle || 'System Architect & Lead Admin'}
              </p>

              {/* Status Signal Display */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-md ${getStatusColor(statusSignal)}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                  {getStatusText(statusSignal)}
                </span>
                
                <span className="text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
                  {customStatus}
                </span>
              </div>
            </div>

            {/* Quick Workspace Switch Buttons */}
            <div className="w-full md:w-auto flex flex-col gap-3">
              <button
                onClick={() => alert('Đang khởi chạy Bảng Task Workspace...')}
                className="solar-corona-btn px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all duration-300"
              >
                Vào Bảng Task Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => alert('Đang khởi chạy Phòng Họp WebRTC...')}
                className="px-6 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Video className="w-4 h-4 text-purple-400" />
                Mở Phòng Họp WebRTC
              </button>
            </div>
          </div>
        </div>

        {/* 📊 Bento Grid Details & Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Card 1: Thông tin Liên hệ & Phòng ban */}
          <div className="solar-glass-card p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Mail className="w-4 h-4 text-amber-400" />
              Thông Tin Liên Hệ & Tổ Chức
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 text-slate-300">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" /> Email chính:
                </span>
                <span className="font-mono text-white">{user?.email}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-300">
                <span className="text-slate-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" /> Điện thoại:
                </span>
                <span className="font-mono text-white">{user?.phone || '+84 988 123 456'}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-300">
                <span className="text-slate-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" /> Phòng ban:
                </span>
                <span className="font-semibold text-purple-300">Khối Product</span>
              </div>
            </div>
          </div>

          {/* Card 2: Bio & Phương Châm Làm Việc */}
          <div className="solar-glass-card p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Tiểu Sử & Mô Tả Công Việc
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed italic bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
              "{user?.bio || 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System. Đam mê tối ưu hóa hiệu năng, giao diện Dark Sun Eclipse và xây dựng giải pháp làm việc thông minh.'}"
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Tài khoản đã hoàn tất xác thực 2 lớp bảo mật (2FA).
            </div>
          </div>

          {/* Card 3: Thống Kê Năng Suất & Solaris Streak */}
          <div className="solar-glass-card p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              Thống Kê Năng Suất Real-time
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-2xl font-extrabold text-amber-400 block">12</span>
                <span className="text-xs text-slate-400">Task Hoàn Thành</span>
              </div>
              
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-2xl font-extrabold text-emerald-400 block">100%</span>
                <span className="text-xs text-slate-400">Đúng Hạn Chót</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-amber-300">Solaris Streak Badge</div>
                  <div className="text-[11px] text-slate-400">7 ngày Chấm công Liên tục</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs">🔥 7 Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
