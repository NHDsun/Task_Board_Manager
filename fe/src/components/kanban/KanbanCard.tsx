import React from 'react';
import { Clock, AlertCircle, PauseCircle, CheckCircle2, MoreVertical, MessageSquare, Send, FolderKanban } from 'lucide-react';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'BLOCKED' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'NORMAL' | 'IMPORTANT' | 'URGENT';
  progress: number;
  dueDate?: string;
  projectName?: string;
  assignee?: {
    id: string;
    fullName: string;
    avatar?: string;
    profession?: string;
  };
  tags?: Array<{ id: string; name: string; color?: string }>;
  commentsCount?: number;
}

interface KanbanCardProps {
  task: TaskItem;
  onStatusChange?: (taskId: string, newStatus: TaskItem['status']) => void;
  onRequestTransfer?: (task: TaskItem) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onRequestTransfer }) => {
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

  return (
    <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 shadow-xl group relative overflow-hidden">
      {/* Meteor Hover Trail Sweep */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-amber-500/5 via-purple-500/10 to-transparent transition-opacity duration-300 pointer-events-none" />

      {/* Project Name Badge Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/60">
        <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold truncate max-w-[170px]">
          <FolderKanban className="w-3 h-3 text-purple-400 shrink-0" />
          {task.projectName || 'Solaris Core Architecture'}
        </span>

        <button className="text-slate-500 hover:text-amber-400 transition-colors p-0.5">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header Badges Cluster */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {/* Priority Badge */}
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border tracking-wider ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>

        {/* Dở dang Status Badge */}
        {statusBadge && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBadge.color}`}>
            <statusBadge.icon className="w-3 h-3" />
            {statusBadge.label}
          </span>
        )}
      </div>

      {/* Task Title */}
      <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-1.5">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Progress % Bar */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">Tiến độ công việc</span>
          <span className="font-bold text-amber-400">{task.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Footer Cluster */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-400/40 bg-slate-900 shrink-0 flex items-center justify-center">
            {task.assignee?.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.fullName || 'Assignee'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-slate-950 font-black text-[10px] tracking-tight">
                {task.assignee?.fullName ? task.assignee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HD'}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[90px]">
            {task.assignee?.fullName?.split(' ')[0] || 'User'}
          </span>
        </div>

        {/* Task Actions */}
        <div className="flex items-center gap-2">
          {task.commentsCount !== undefined && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {task.commentsCount}
            </span>
          )}

          {onRequestTransfer && (
            <button
              onClick={() => onRequestTransfer(task)}
              title="Gửi Yêu cầu Chuyển giao / Hỗ trợ Task"
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all text-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
