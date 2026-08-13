import React from 'react';
import { Clock, AlertCircle, PauseCircle, CheckCircle2, MoreVertical, MessageSquare, Send } from 'lucide-react';

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
}

interface KanbanCardProps {
  task: TaskItem;
  onStatusChange?: (taskId: string, newStatus: TaskItem['status']) => void;
  onRequestTransfer?: (task: TaskItem) => void;
  onCardClick?: (task: TaskItem) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = React.memo(({ task, onRequestTransfer, onCardClick }) => {
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
      className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800/80 hover:border-amber-500/50 shadow-lg space-y-3 transition-[border-color,box-shadow,background-color] duration-150 group relative overflow-hidden cursor-pointer"
    >
      {/* Glow Hover Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header Badges & Project */}
      <div className="flex items-center justify-between gap-2">
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

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestTransfer?.(task);
          }}
          className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
        {task.title}
      </h3>


      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {/* Assignee Avatar */}
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[9px] text-amber-300 overflow-hidden">
            {task.assignee?.avatar ? (
              <img src={task.assignee.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{task.assignee?.fullName ? task.assignee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HD'}</span>
            )}
          </div>
          <span className="truncate max-w-[90px] font-medium text-slate-300">
            {task.assignee?.fullName || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1 font-mono text-slate-400">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{task.dueDate.slice(5)}</span>
            </div>
          )}
          {task.commentsCount !== undefined && (
            <div className="flex items-center gap-1 font-mono text-slate-400">
              <MessageSquare className="w-3 h-3 text-purple-400" />
              <span>{task.commentsCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Task Request Shortcut Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRequestTransfer?.(task);
        }}
        className="w-full py-1.5 rounded-xl bg-slate-900/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Send className="w-3 h-3 text-amber-400" />
        Yêu Cầu Chuyển Giao / Hỗ Trợ Task
      </button>
    </div>
  );
});
