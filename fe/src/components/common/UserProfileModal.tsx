import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  FolderKanban,
  CheckSquare,
  Globe,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import type { GlobalRole, Profession, UserStatusSignal } from '../../types/auth';
import { useUserStore } from '../../store/useUserStore';
import { DEFAULT_COVER, getAvatarUrl } from '../../utils/avatar';

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  coverImage?: string;
  phone?: string;
  bio?: string;
  globalRole?: GlobalRole | string;
  profession?: Profession | string;
  jobTitle?: string;
  department?: string;
  statusSignal?: UserStatusSignal | string;
  customStatus?: string;
  workMode?: 'OFFICE' | 'REMOTE' | string;
  joinedDate?: string;
  projectsCount?: number;
  tasksCount?: {
    total: number;
    completed: number;
    inProgress: number;
    overdue?: number;
  };
  assignedProjects?: string[];
  recentTasks?: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: string;
  }>;
}

interface UserProfileModalProps {
  user: UserProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (user: UserProfileData) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'projects'>('overview');
  const setViewingUserId = useUserStore((state) => state.setViewingUserId);

  if (!isOpen || !user) return null;

  const handleOpenFullProfile = () => {
    setViewingUserId(user.id);
    localStorage.setItem('solaris_active_route', '/profile');
    try {
      if (window.location.pathname !== '/profile') {
        window.history.pushState(null, '', '/profile');
      }
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = '/profile';
    }
    onClose();
  };

  // Status Signal Dot & Label
  const getStatusInfo = (signal?: string) => {
    switch (signal) {
      case 'ONLINE':
        return { label: 'Trực Tuyến (Online)', color: 'bg-emerald-400 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.8)]' };
      case 'BUSY':
        return { label: 'Bận Rộn (Busy)', color: 'bg-rose-500 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.8)]' };
      case 'IN_MEETING':
        return { label: 'Đang Họp (In Meeting)', color: 'bg-purple-500 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(139,92,246,0.8)]' };
      case 'AWAY':
        return { label: 'Vắng Mặt (Away)', color: 'bg-amber-400 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.8)]' };
      default:
        return { label: 'Ngoại Tuyến (Offline)', color: 'bg-slate-500 text-slate-400 border-slate-600' };
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
      case 'MANAGER':
        return 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      default:
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const statusInfo = getStatusInfo(user.statusSignal);
  const tasksTotal = user.tasksCount?.total || 12;
  const tasksCompleted = user.tasksCount?.completed || 9;
  const tasksInProgress = user.tasksCount?.inProgress || 3;
  const tasksOverdue = user.tasksCount?.overdue || 0;
  const tasksOnTime = Math.max(0, tasksCompleted - tasksOverdue);

  const defaultCover = user.coverImage || DEFAULT_COVER;
  const defaultAvatar = getAvatarUrl(user);

  const defaultProjects = user.assignedProjects || [
    'Solaris Core Task Board Engine',
    'Enterprise RBAC & Authentication Module',
    'Voice Assistant & WebRTC Integration',
  ];

  const defaultTasks = user.recentTasks || [
    { id: 't-1', title: 'Tối ưu hóa hiệu năng render Kanban 60 FPS', status: 'IN_PROGRESS', dueDate: '28/08/2026' },
    { id: 't-2', title: 'Kiểm thử hộp đen luồng duyệt Subtasks', status: 'DONE', dueDate: '24/08/2026' },
    { id: 't-3', title: 'Hoàn thiện giao diện Bento Grid cho Lịch Làm Việc', status: 'DONE', dueDate: '22/08/2026' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col animate-solar-warp-in">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* 🌠 Cover Photo Header */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden shrink-0">
          <img
            src={defaultCover}
            alt="Cover"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/40 to-[#0F172A]" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-2xl bg-black/50 hover:bg-black/80 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 👤 Avatar & Identity Block */}
        <div className="px-6 md:px-8 -mt-16 sm:-mt-20 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* Avatar with Status Ring */}
              <div className="relative">
                <img
                  src={defaultAvatar}
                  alt={user.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#0F172A] shadow-2xl bg-slate-900"
                />
                <span
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-[#0F172A] ${statusInfo.color}`}
                  title={statusInfo.label}
                />
              </div>

              {/* Name & Job Title */}
              <div className="space-y-1 pb-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate flex items-center gap-2">
                  {user.fullName}
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">
                  {user.jobTitle || 'Chuyên viên Phát triển Hệ thống'}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-amber-400 font-mono">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user.department || 'Engineering'}</span>
                </div>
              </div>
            </div>

            {/* Role & Work Mode Badges */}
            <div className="flex items-center gap-2 self-start sm:self-end pb-1">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${getRoleBadge(
                  user.globalRole
                )}`}
              >
                {user.globalRole || 'EMPLOYEE'}
              </span>

              <span className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                {user.workMode === 'REMOTE' ? 'Làm Remote' : 'Văn Phòng'}
              </span>
            </div>
          </div>

          {/* Bio / Quote */}
          {user.bio && (
            <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 leading-relaxed">
              "{user.bio}"
            </p>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Tổng Quan Hồ Sơ
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Công Việc Đang Làm
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-amber-400 font-mono">
                {tasksInProgress}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'projects'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Dự Án Tham Gia ({defaultProjects.length})
            </button>
          </div>
        </div>

        {/* 📜 Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4 space-y-5 custom-scrollbar text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fade-in">
              {/* 🎯 4-Card Precise Metric Grid: TỔNG TASK • ĐANG LÀM • ĐÚNG HẠN • TRỄ HẠN */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center justify-center gap-1">
                    <CheckSquare className="w-3 h-3 text-blue-400" /> Tổng Task
                  </span>
                  <span className="text-xl font-black text-white font-mono">{tasksTotal}</span>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1 text-center">
                  <span className="text-amber-400 text-[10px] uppercase font-bold block flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Đang Làm
                  </span>
                  <span className="text-xl font-black text-amber-300 font-mono">{tasksInProgress}</span>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1 text-center">
                  <span className="text-emerald-400 text-[10px] uppercase font-bold block flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Đúng Hạn
                  </span>
                  <span className="text-xl font-black text-emerald-300 font-mono">{tasksOnTime}</span>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1 text-center">
                  <span className="text-rose-400 text-[10px] uppercase font-bold block flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" /> Trễ Hạn
                  </span>
                  <span className="text-xl font-black text-rose-400 font-mono">{tasksOverdue}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Thông Tin Liên Lạc Doanh Nghiệp
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 truncate">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 truncate">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">{user.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-bold text-slate-300 uppercase text-[11px] tracking-wider flex items-center justify-between">
                <span>Danh Sách Công Việc Phụ Trách</span>
                <span className="text-amber-400 font-mono">{defaultTasks.length} Task</span>
              </h3>

              <div className="space-y-2">
                {defaultTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {t.status === 'DONE' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{t.title}</span>
                        {t.dueDate && (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Hạn chót: {t.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                        t.status === 'DONE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-bold text-slate-300 uppercase text-[11px] tracking-wider">
                Các Dự Án Đang Tham Gia
              </h3>
              <div className="space-y-2">
                {defaultProjects.map((pName, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderKanban className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold text-white truncate">{pName}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold shrink-0">
                      Thành Viên
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🚪 Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#0A0F1D]/80 flex items-center justify-between gap-3 relative z-10">
          <div className="text-[11px] text-slate-400 font-mono truncate">
            Mã ID: <span className="text-slate-200">{user.id}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenFullProfile}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Mở Trang Profile Toàn Diện
            </button>

            {onSendMessage && (
              <button
                onClick={() => {
                  onSendMessage(user);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Gửi Tin Nhắn
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
