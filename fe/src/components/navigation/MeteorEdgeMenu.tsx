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
    ...(isAdmin
      ? [
          {
            id: 'admin-users',
            label: 'Quản Lý Nhân Sự',
            route: '/admin/users',
            icon: Users,
            hoverGradient: 'from-rose-400 to-amber-400',
            badge: 'ADMIN',
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          },
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
            <div className="flex flex-col min-w-0 animate-fade-in">
              <span className="font-black text-sm tracking-tight text-white flex items-center gap-1.5 truncate">
                SOLARIS <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">PRO</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate">
                {currentUser?.fullName || 'Workspace Lead'}
              </span>
            </div>
          )}
        </div>

        {/* Middle Navigation Routes */}
        <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`w-full group relative flex items-center transition-all duration-200 rounded-2xl cursor-pointer ${
                  isExpanded ? 'px-3.5 py-2.5 gap-3.5' : 'p-2.5 justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/15 to-transparent text-white border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                )}

                <div
                  className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900/80 text-slate-400 group-hover:text-amber-300 group-hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {isExpanded && (
                  <div className="flex items-center justify-between flex-1 min-w-0 animate-fade-in">
                    <span
                      className={`text-xs font-bold tracking-wide truncate ${
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Subtle Right Chevron on Hover */}
                {isExpanded && !isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Action Footer */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          {/* Voice Assistant Trigger */}
          {onOpenVoiceCommand && (
            <button
              onClick={onOpenVoiceCommand}
              className={`w-full group flex items-center rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 transition-all cursor-pointer shadow-md ${
                isExpanded ? 'px-3.5 py-2.5 gap-3' : 'p-2.5 justify-center'
              }`}
              title="Trợ lý giọng nói Solaris AI"
            >
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 group-hover:scale-105 transition-transform">
                <Mic className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              {isExpanded && (
                <div className="flex flex-col text-left min-w-0 animate-fade-in">
                  <span className="text-xs font-black text-purple-200">Solaris Voice AI</span>
                  <span className="text-[9px] text-purple-400 font-mono">Điều khiển rảnh tay</span>
                </div>
              )}
            </button>
          )}

          {/* Logout Action */}
          <button
            onClick={logout}
            className={`w-full group flex items-center rounded-2xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 transition-all cursor-pointer ${
              isExpanded ? 'px-3.5 py-2.5 gap-3' : 'p-2.5 justify-center'
            }`}
            title="Đăng xuất tài khoản"
          >
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0 group-hover:scale-105 transition-transform">
              <LogOut className="w-4 h-4" />
            </div>
            {isExpanded && (
              <span className="text-xs font-bold text-rose-300 group-hover:text-rose-200 animate-fade-in truncate">
                Đăng Xuất
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
