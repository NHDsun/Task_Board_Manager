import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  User,
  Kanban,
  Calendar,
  MessageSquare,
  Inbox,
  Users,
  ChevronRight,
  Sparkles,
  Mic,
  LogOut,
  Trash2,
} from 'lucide-react';

interface MeteorEdgeMenuProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenVoiceCommand?: () => void;
}

export const MeteorEdgeMenu: React.FC<MeteorEdgeMenuProps> = ({ currentRoute, onNavigate, onOpenVoiceCommand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const currentUser = useAuthStore((state) => state.user);

  const isAdmin = currentUser?.globalRole === 'ADMIN';

  const menuItems = [
    {
      id: 'profile',
      label: 'Hồ Sơ Cá Nhân',
      route: '/profile',
      icon: User,
      hoverGradient: 'from-amber-400 to-amber-500',
      badge: 'PRO',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'tasks',
      label: 'Bảng Task Workspace',
      route: '/tasks',
      icon: Kanban,
      hoverGradient: 'from-amber-400 to-amber-500',
      badge: 'CORE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'schedule',
      label: 'Lịch Làm Việc',
      route: '/schedule',
      icon: Calendar,
      hoverGradient: 'from-amber-400 via-orange-400 to-amber-400',
      badge: 'PLAN',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'remote-requests',
      label: 'Yêu Cầu Làm Remote',
      route: '/remote-requests',
      icon: Inbox,
      hoverGradient: 'from-emerald-400 to-teal-400',
      badge: 'NEW',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'messages',
      label: 'Tin Nhắn & Cuộc Gọi',
      route: '/messages',
      icon: MessageSquare,
      hoverGradient: 'from-blue-400 to-cyan-400',
    },
    {
      id: 'admin',
      label: 'Quản Lý Nhân Sự',
      route: '/admin/users',
      icon: Users,
      hoverGradient: 'from-rose-400 to-amber-400',
    },
    ...(isAdmin
      ? [
          {
            id: 'trash',
            label: 'Thùng Rác Hệ Thống',
            route: '/admin/trash',
            icon: Trash2,
            hoverGradient: 'from-rose-400 via-amber-400 to-rose-400',
            badge: '14D',
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          },
        ]
      : []),
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-out flex items-center select-none ${
        isExpanded ? 'w-72 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.15)]' : 'w-16 shadow-xl'
      }`}
    >
      {/* 🌠 Outer Meteor Edge Glow Spine Line */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/50 via-purple-500/50 to-emerald-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)] pointer-events-none z-20" />

      {/* Main Glassmorphism Menu Body */}
      <div className="w-full h-full bg-[#0F172A]/95 backdrop-blur-2xl border-r border-amber-500/25 flex flex-col justify-between py-3 px-2 overflow-hidden shadow-2xl relative">
        {/* Top Brand Header */}
        <div
          className={`pt-2 pb-4 border-b border-slate-800/80 flex items-center transition-all duration-300 ${
            isExpanded ? 'px-2 gap-3 justify-start' : 'px-0 justify-center'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-purple-600/25 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg relative group">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="absolute inset-0 bg-amber-400/15 rounded-xl blur-md group-hover:bg-amber-400/30 transition-all pointer-events-none" />
          </div>

          {isExpanded && (
            <div className="flex-1 flex flex-col min-w-0 transition-opacity duration-200">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-amber-300 via-purple-200 to-emerald-300 bg-clip-text text-transparent truncate">
                SOLARIS
              </span>
              <span className="text-[10px] font-mono text-amber-400/90 tracking-widest uppercase truncate">
                Workflow Manager
              </span>
            </div>
          )}
        </div>

        {/* Center Navigation Items */}
        <nav className="flex-1 py-4 space-y-2 overflow-y-auto custom-scrollbar flex flex-col items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center py-2.5 rounded-xl transition-all duration-200 relative group cursor-pointer overflow-hidden ${
                  isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.45)] border border-amber-300'
                    : `bg-slate-800/60 hover:bg-gradient-to-r hover:${item.hoverGradient} text-slate-200 hover:text-slate-950 border border-slate-700/50 hover:border-transparent hover:shadow-lg`
                }`}
              >
                {/* Icon Box */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isActive
                      ? 'text-slate-950 bg-slate-950/15'
                      : 'text-slate-300 group-hover:text-slate-950 group-hover:bg-slate-950/15'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text Label & Badge */}
                {isExpanded && (
                  <div className="relative z-10 flex-1 flex items-center justify-between min-w-0 gap-2 text-left">
                    <span
                      className={`text-[13.5px] truncate transition-colors ${
                        isActive
                          ? 'font-bold text-slate-950'
                          : 'font-medium text-slate-200 group-hover:text-slate-950 group-hover:font-bold'
                      }`}
                    >
                      {item.label}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shrink-0 transition-colors border ${
                            isActive
                              ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                              : `${item.badgeColor} group-hover:bg-slate-950/20 group-hover:text-slate-950 group-hover:border-slate-950/30`
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-slate-950 animate-pulse'
                            : 'text-slate-400 group-hover:text-slate-950'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions Cluster */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2 flex flex-col items-center">
          {/* 🎙️ Voice Command Trigger */}
          <button
            onClick={() => {
              if (onOpenVoiceCommand) {
                onOpenVoiceCommand();
              }
            }}
            className={`w-full flex items-center py-2.5 rounded-xl bg-slate-800/60 hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 border border-slate-700/50 hover:border-transparent text-slate-200 hover:text-slate-950 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-200 group cursor-pointer relative overflow-hidden ${
              isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
            }`}
            title="Trợ Lý Giọng Nói Solaris (Voice Command)"
          >
            <div className="relative z-10 w-9 h-9 rounded-lg bg-amber-500/20 group-hover:bg-slate-950/15 border border-amber-400/40 group-hover:border-slate-950/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform text-amber-300 group-hover:text-slate-950">
              <Mic className="w-5 h-5" />
            </div>

            {isExpanded && (
              <div className="relative z-10 flex-1 flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-amber-300 group-hover:text-slate-950 flex items-center gap-1 truncate transition-colors">
                  <Sparkles className="w-3 h-3 shrink-0" /> Voice Command
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-medium truncate transition-colors">
                  Trợ Lý Giọng Nói AI
                </span>
              </div>
            )}
          </button>

          {/* 🚪 LOGOUT BUTTON */}
          <button
            onClick={logout}
            className={`w-full flex items-center py-2.5 rounded-xl bg-slate-800/60 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 border border-slate-700/50 hover:border-transparent text-rose-300 hover:text-slate-950 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all duration-200 group cursor-pointer relative overflow-hidden ${
              isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
            }`}
            title="Đăng Xuất"
          >
            <div className="relative z-10 w-9 h-9 rounded-lg bg-rose-500/20 group-hover:bg-slate-950/15 border border-rose-500/40 group-hover:border-slate-950/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-rose-400 group-hover:text-slate-950">
              <LogOut className="w-5 h-5" />
            </div>

            {isExpanded && (
              <span className="relative z-10 text-xs font-semibold text-rose-300 group-hover:text-slate-950 group-hover:font-bold truncate transition-colors">
                Đăng Xuất Phiên Làm Việc
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
