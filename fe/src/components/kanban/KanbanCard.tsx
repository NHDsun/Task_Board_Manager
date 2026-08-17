import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  AlertCircle,
  PauseCircle,
  CheckCircle2,
  MoreVertical,
  MessageSquare,
  Send,
  Trash2,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'BLOCKED' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'NORMAL' | 'IMPORTANT' | 'URGENT';
  progress: number;
  dueDate?: string;
  projectName?: string;
  assigneeId?: string;
  createdById?: string;
  assignee?: {
    id: string;
    fullName: string;
    email?: string;
    avatar?: string;
    profession?: string;
  };
  createdBy?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  transferInfo?: {
    senderName: string;
    senderAvatar?: string;
    receiverName: string;
    receiverAvatar?: string;
    note?: string;
  };
  tags?: Array<{ id: string; name: string; color?: string }>;
  commentsCount?: number;
  stageId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'file' | 'link';
    size?: string;
    createdAt: string;
  }>;
}
interface KanbanCardProps {
  task: TaskItem;
  onStatusChange?: (taskId: string, newStatus: TaskItem['status']) => void;
  onRequestTransfer?: (task: TaskItem) => void;
  onCardClick?: (task: TaskItem) => void;
  onDeleteTask?: (task: TaskItem) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = React.memo(({
  task,
  onRequestTransfer,
  onCardClick,
  onDeleteTask,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isMyTask = Boolean(
    currentUser &&
      (task.assigneeId === currentUser.id ||
        task.assignee?.id === currentUser.id ||
        task.assignee?.email === currentUser.email ||
        (!task.assigneeId && task.createdById === currentUser.id))
  );

  const isAdminOrManager = currentUser?.globalRole === 'ADMIN' || currentUser?.globalRole === 'MANAGER';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCopyTaskId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(task.id);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      setIsMenuOpen(false);
    }, 1500);
  };

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse';
      case 'IMPORTANT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'NORMAL':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case 'PAUSED':
        return { label: 'Tạm Dừng', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: PauseCircle };
      case 'BLOCKED':
        return { label: 'Tắc Nghẽn', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: AlertCircle };
      case 'IN_REVIEW':
        return { label: 'Chờ Duyệt', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock };
      case 'DONE':
        return { label: 'Hoàn Thành', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle2 };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge(task.status);
  const StatusIcon = statusBadge?.icon;

  return (
    <div
      onClick={() => onCardClick?.(task)}
      className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800/80 hover:border-amber-500/50 shadow-lg space-y-3 transition-[border-color,box-shadow,background-color] duration-150 group relative overflow-visible cursor-pointer"
    >
      {/* Glow Hover Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl overflow-hidden pointer-events-none" />

      {/* Header Badges & 3-Dot Quick Actions Menu */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(task.priority)}`}>
            {task.priority}
          </span>
          {statusBadge && StatusIcon && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${statusBadge.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </span>
          )}
        </div>

        {/* 🌟 3-DOT QUICK ACTION BUTTON & CONTEXT MENU */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            title="Tác vụ nhanh"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* 🌌 Glassmorphism Dropdown Menu */}
          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl p-1.5 z-50 animate-solar-warp-in space-y-1 text-xs"
            >
              {/* Chi tiết Task */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onCardClick?.(task);
                }}
                className="w-full px-3 py-2 rounded-xl text-left font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Xem Chi Tiết Task</span>
              </button>

              {/* Yêu Cầu Bàn Giao (Dành Cho Chính Chủ Task) */}
              {isMyTask && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRequestTransfer?.(task);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bàn Giao Nhiệm Vụ</span>
                </button>
              )}

              {/* Sao chép Mã Task */}
              <button
                onClick={handleCopyTaskId}
                className="w-full px-3 py-2 rounded-xl text-left font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã Sao Chép ID!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sao Chép Mã ID</span>
                  </>
                )}
              </button>

              {/* Xóa Task (Dành Cho Admin / Manager) */}
              {isAdminOrManager && onDeleteTask && (
                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDeleteTask(task);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Xóa Task</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
        {task.title}
      </h3>

      {/* 📊 Task Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 font-medium">Tiến độ</span>
          <span className="font-bold text-amber-400">{task.progress}%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              task.progress === 100
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : task.progress > 50
                ? 'bg-gradient-to-r from-amber-500 to-purple-500'
                : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Assignee Avatar */}
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[9px] text-amber-300 overflow-hidden shrink-0">
            {task.assignee?.avatar ? (
              <img src={task.assignee.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{task.assignee?.fullName ? task.assignee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UA'}</span>
            )}
          </div>
          <span
            className="truncate font-medium text-slate-300 max-w-[105px]"
            title={task.assignee?.fullName || 'Chưa phân công'}
          >
            {task.assignee?.fullName?.replace(/\s*\([^)]*\)/g, '') || 'Chưa phân công'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {task.dueDate && (() => {
            try {
              const due = new Date(task.dueDate);
              const formatted = !isNaN(due.getTime())
                ? `${String(due.getDate()).padStart(2, '0')}/${String(due.getMonth() + 1).padStart(2, '0')}`
                : task.dueDate.slice(5);

              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const target = new Date(due);
              target.setHours(0, 0, 0, 0);
              const isOverdue = target.getTime() < today.getTime() && task.status !== 'DONE';

              return (
                <div
                  className={`flex items-center gap-1 font-mono text-[10px] ${
                    isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                  }`}
                  title={isOverdue ? 'Đã quá hạn deadline!' : `Hạn chót: ${task.dueDate}`}
                >
                  <Clock className={`w-3 h-3 shrink-0 ${isOverdue ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                  <span>{formatted}</span>
                </div>
              );
            } catch {
              return (
                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 shrink-0 text-amber-400" />
                  <span>{task.dueDate.slice(5)}</span>
                </div>
              );
            }
          })()}
          {task.commentsCount !== undefined && (
            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <MessageSquare className="w-3 h-3 shrink-0 text-purple-400" />
              <span>{task.commentsCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
