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
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  Video,
  LogOut
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate?: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
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
      default: return 'bg-slate-500 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (signal: string) => {
    switch (signal) {
      case 'ONLINE': return 'ONLINE (🟢 Đang trực tuyến)';
      case 'BUSY': return 'BUSY (🔴 Đang bận)';
      case 'IN_MEETING': return 'IN_MEETING (🟣 Đang trong cuộc họp)';
      case 'AWAY': return 'AWAY (🟡 Đang vắng mặt)';
      default: return 'OFFLINE (⚪ Ngoại tuyến)';
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Bento Wrapper */}
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">

        {/* 🌠 Cosmic Cover Banner Header */}
        <div className="solar-glass-card rounded-3xl overflow-hidden border border-amber-500/30 bg-[#0F172A]/80 shadow-2xl relative">
          <div className="h-56 md:h-64 w-full relative overflow-hidden">
            <img
              src={user?.coverImage || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80'}
              alt="Cosmic Cover Banner"
              className="w-full h-full object-cover filter brightness-75 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900/80 backdrop-blur-md border border-amber-500/40 text-amber-300">
                PRO PROFILE
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Hủy Sửa' : 'Chỉnh Sửa Profile'}
              </button>
            </div>
          </div>

          {/* Profile Header Info Overlay */}
          <div className="px-6 md:px-10 pb-8 -mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* 3D Avatar Pulse Circle */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-slate-900 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 via-amber-400 to-purple-600 flex items-center justify-center text-slate-950 font-black text-4xl tracking-widest shadow-inner">
                      {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HD'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0F172A] shadow-md animate-pulse" />
              </div>

              {/* Name & Titles */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {user?.fullName || 'Huy Dat'}
                  </h1>

                  <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    {user?.globalRole || 'ADMIN'}
                  </span>

                  <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    {user?.profession || 'DEV'}
                  </span>
                </div>

                <p className="text-slate-300 font-medium text-sm">
                  {user?.jobTitle || 'System Architect & Lead Admin'}
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-lg ${getStatusColor(statusSignal)}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    {getStatusLabel(statusSignal)}
                  </span>
                  
                  <span className="text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
                    {customStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Workspace Switch Buttons */}
            <div className="w-full md:w-auto flex flex-col gap-3">
              <button
                onClick={() => onNavigate?.('/tasks')}
                className="solar-corona-btn px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              >
                Vào Bảng Task Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onNavigate?.('/meetings')}
                className="px-6 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              >
                <Video className="w-4 h-4 text-purple-400" />
                Mở Phòng Họp WebRTC
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 Bento Stats & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Contact & Info Card */}
          <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-amber-500/20 space-y-6">
            <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Thông Tin Liên Hệ & Tổ Chức
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-xs">{user?.email || 'huydatne@gmail.com'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{user?.phone || '+84 988 123 456'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Phòng Ban: <strong className="text-white">Khối Kiến Trúc Core</strong></span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Tiểu sử ngắn (Bio)</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{user?.bio || 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.'}"
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Đăng Xuất Phiên Làm Việc
            </button>
          </div>

          {/* Right Column (Span 2): Productivity Stats & Personal Metrics */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Thống Kê Tác Nghiệp Cá Nhân (Personal Task Metrics)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Task Hoàn Thành */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">HOÀN THÀNH</span>
                </div>
                <span className="text-2xl font-extrabold text-white">42</span>
                <p className="text-[11px] text-slate-400">Task Hoàn Thành</p>
              </div>

              {/* Task Trễ Hạn */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-rose-500/40 space-y-1">
                <div className="flex items-center justify-between text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">TRỄ HẠN</span>
                </div>
                <span className="text-2xl font-extrabold text-rose-300">2</span>
                <p className="text-[11px] text-slate-400">Task Quá Hạn Deadline</p>
              </div>

              {/* Task Đang Thực Hiện */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between text-amber-400">
                  <Zap className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">ĐANG LÀM</span>
                </div>
                <span className="text-2xl font-extrabold text-amber-300">3</span>
                <p className="text-[11px] text-slate-400">Task Đang Xử Lý</p>
              </div>

              {/* Streak Đúng Giờ */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-purple-500/40 space-y-1">
                <div className="flex items-center justify-between text-purple-400">
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">STREAK</span>
                </div>
                <span className="text-2xl font-extrabold text-purple-300">14 Ngày</span>
                <p className="text-[11px] text-slate-400">Chấm Công Đúng Giờ</p>
              </div>
            </div>

            {/* Badges & Recent Activities Card */}
            <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-amber-500/20 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Huy Hiệu Solaris & Thành Tích Uy Tín
              </h3>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  🔥 Solar Streak Master
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5">
                  ⚡ Core Architect
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  🎙️ Voice Check-In Pioneer
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
