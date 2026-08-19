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
      trailColor: 'from-amber-500 to-amber-300',
      badge: 'PRO',
    },
    {
      id: 'tasks',
      label: 'Bảng Task Workspace',
      route: '/tasks',
      icon: Kanban,
      trailColor: 'from-amber-400 to-amber-500',
      badge: 'CORE',
    },
    {
      id: 'schedule',
      label: 'Lịch Làm Việc',
      route: '/schedule',
      icon: Calendar,
      trailColor: 'from-amber-400 via-orange-400 to-amber-300',
      badge: 'PLAN',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'remote-requests',
      label: 'Yêu Cầu Làm Remote',
      route: '/remote-requests',
      icon: Inbox,
      trailColor: 'from-emerald-500 to-teal-300',
      badge: 'NEW',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'messages',
      label: 'Tin Nhắn & Cuộc Gọi',
      route: '/messages',
      icon: MessageSquare,
      trailColor: 'from-blue-500 to-cyan-300',
    },
    {
      id: 'admin',
      label: 'Quản Lý Nhân Sự',
      route: '/admin/users',
      icon: Users,
      trailColor: 'from-rose-500 to-amber-300',
    },
    ...(isAdmin
      ? [
          {
            id: 'trash',
            label: 'Thùng Rác Hệ Thống',
            route: '/admin/trash',
            icon: Trash2,
            trailColor: 'from-rose-500 via-amber-500 to-rose-400',
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
      className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-700 ease-in-out flex items-center ${
        isExpanded ? 'w-72' : 'w-16'
      }`}
    >
      {/* 🌠 Outer Meteor Edge Glow Spine Line */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/40 via-purple-500/50 to-emerald-500/30 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

      {/* Main Glassmorphism Menu Body */}
      <div className="w-full h-full bg-[#0F172A]/95 backdrop-blur-2xl border-r border-amber-500/20 flex flex-col justify-between py-3 px-2 overflow-hidden shadow-2xl relative">
        {/* Top Brand Header (Aligned Center 100%) */}
        <div className="pt-2 pb-5 border-b border-slate-800/80 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-purple-600/30 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-lg relative group">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="absolute inset-0 bg-amber-400/20 rounded-xl blur-md group-hover:bg-amber-400/40 transition-all" />
          </div>

          {isExpanded && (
            <div className="flex-1 flex flex-col overflow-hidden whitespace-nowrap">
              <span className="font-extrabold text-base tracking-wider text-white bg-gradient-to-r from-amber-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
                SOLARIS
              </span>
              <span className="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">
                Meteor Edge Menu
              </span>
            </div>
          )}
        </div>

        {/* Center Navigation Items (Centered Icons When Collapsed) */}
        <nav className="flex-1 py-4 space-y-2 overflow-y-auto custom-scrollbar flex flex-col items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center gap-3 py-2.5 rounded-xl transition-all duration-300 relative group cursor-pointer overflow-hidden ${
                  isExpanded ? 'px-3 justify-start' : 'px-0 justify-center'
                } ${
                  isActive
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {/* Meteor Tail Sweep Effect on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r ${item.trailColor} opacity-10 transition-opacity duration-300`} />

                {/* Centered Icon Box */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text Label */}
                {isExpanded && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap text-sm font-medium">
                    <span>{item.label}</span>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        item.badgeColor || 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Active Indicator Arrow */}
                {isActive && isExpanded && (
                  <ChevronRight className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
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
            className={`w-full flex items-center gap-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-amber-500/10 border border-amber-500/40 text-amber-300 hover:border-amber-400 transition-all duration-300 shadow-md group cursor-pointer ${
              isExpanded ? 'px-3 justify-start' : 'px-0 justify-center'
            }`}
            title="Trợ Lý Giọng Nói Solaris (Voice Command)"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5 text-amber-400" />
            </div>

            {isExpanded && (
              <div className="flex flex-col text-left overflow-hidden whitespace-nowrap">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Voice Command
                </span>
                <span className="text-[10px] text-slate-400">Trợ Lý Giọng Nói AI</span>
              </div>
            )}
          </button>

          {/* 🚪 LOGOUT BUTTON */}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-all duration-300 group cursor-pointer ${
              isExpanded ? 'px-3 justify-start' : 'px-0 justify-center'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <LogOut className="w-5 h-5 text-rose-400" />
            </div>

            {isExpanded && (
              <span className="text-xs font-bold text-rose-300 whitespace-nowrap">
                Đăng Xuất Phiên Làm Việc
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
