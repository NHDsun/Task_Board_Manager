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
      badge: 'PRO',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'tasks',
      label: 'Bảng Task Workspace',
      route: '/tasks',
      icon: Kanban,
      badge: 'CORE',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    {
      id: 'schedule',
      label: 'Lịch Làm Việc',
      route: '/schedule',
      icon: Calendar,
      badge: 'PLAN',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'remote-requests',
      label: 'Yêu Cầu Làm Remote',
      route: '/remote-requests',
      icon: Inbox,
      badge: 'NEW',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'messages',
      label: 'Tin Nhắn & Cuộc Gọi',
      route: '/messages',
      icon: MessageSquare,
    },
    ...(isAdmin
      ? [
          {
            id: 'admin-users',
            label: 'Quản Lý Nhân Sự & Tổ Chức',
            route: '/admin/users',
            icon: Users,
            badge: 'ADMIN',
            badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          },
          {
            id: 'trash',
            label: 'Thùng Rác Hệ Thống',
            route: '/admin/trash',
            icon: Trash2,
            badge: '14D',
            badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
          },
        ]
      : []),
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-200 ease-out flex items-center select-none ${
        isExpanded ? 'w-72 shadow-2xl' : 'w-16 shadow-lg'
      }`}
    >
      {/* Main Glassmorphism Menu Body */}
      <div className="w-full h-full bg-[#0d131f]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between py-3 px-2 overflow-hidden shadow-2xl relative">
        {/* Top Brand Header */}
        <div
          className={`pt-2 pb-4 border-b border-slate-800/80 flex items-center transition-all duration-200 ${
            isExpanded ? 'px-2 gap-3 justify-start' : 'px-0 justify-center'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm relative group">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          {isExpanded && (
            <div className="flex flex-col min-w-0 animate-fade-in">
              <span className="font-extrabold text-xs tracking-tight text-white flex items-center gap-1.5 truncate">
                SOLARIS <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">PRO</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate">
                {currentUser?.fullName || 'Workspace Lead'}
              </span>
            </div>
          )}
        </div>

        {/* Middle Navigation Routes */}
        <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`w-full group relative flex items-center transition-all duration-150 rounded-xl cursor-pointer ${
                  isExpanded ? 'px-3 py-2 gap-3' : 'p-2 justify-center'
                } ${
                  isActive
                    ? 'bg-amber-500/10 text-white border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-500" />
                )}

                <div
                  className={`p-1.5 rounded-lg transition-all duration-150 shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900/60 text-slate-400 group-hover:text-amber-300 group-hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {isExpanded && (
                  <div className="flex items-center justify-between flex-1 min-w-0 animate-fade-in">
                    <span
                      className={`text-xs font-semibold tracking-wide truncate ${
                        isActive ? 'text-amber-300 font-bold' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor}`}
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
              className={`w-full group flex items-center rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all cursor-pointer ${
                isExpanded ? 'px-3 py-2 gap-2.5' : 'p-2 justify-center'
              }`}
              title="Trợ lý giọng nói Solaris AI"
            >
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/80 shrink-0">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
              </div>
              {isExpanded && (
                <div className="flex flex-col text-left min-w-0 animate-fade-in">
                  <span className="text-xs font-bold text-slate-200">Solaris Voice AI</span>
                  <span className="text-[9px] text-slate-400 font-mono">Điều khiển rảnh tay</span>
                </div>
              )}
            </button>
          )}

          {/* Logout Action */}
          <button
            onClick={logout}
            className={`w-full group flex items-center rounded-xl bg-slate-900/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-all cursor-pointer ${
              isExpanded ? 'px-3 py-2 gap-2.5' : 'p-2 justify-center'
            }`}
            title="Đăng xuất tài khoản"
          >
            <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-rose-500/20 text-slate-400 group-hover:text-rose-400 border border-slate-700/80 group-hover:border-rose-500/40 shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            {isExpanded && (
              <span className="text-xs font-bold text-slate-400 group-hover:text-rose-300 animate-fade-in truncate">
                Đăng Xuất
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
