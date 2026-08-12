import React, { useState } from 'react';
import {
  X,
  Clock,
  FolderKanban,
  MessageSquare,
  Send,
  Sparkles,
  Zap
} from 'lucide-react';
import type { TaskItem } from './KanbanCard';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onStatusChange?: (taskId: string, newStatus: TaskItem['status']) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  if (!isOpen || !task) return null;

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Huy Dat (Admin)',
      avatar: '',
      text: 'Đã cập nhật xong DTOs và Controller Skeleton cho module này!',
      createdAt: '10 phút trước',
    },
    {
      id: 'c2',
      author: 'Minh Anh (Manager)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      text: 'Nhớ kiểm tra kỹ phân quyền Admin trước khi bàn giao sang cột IN_REVIEW nhé.',
      createdAt: '5 phút trước',
    },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      ...comments,
      {
        id: `c_${Date.now()}`,
        author: 'Huy Dat (Admin)',
        avatar: '',
        text: newComment,
        createdAt: 'Vừa xong',
      },
    ]);
    setNewComment('');
  };

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case 'TODO':
        return { text: 'CẦN LÀM (TODO)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
      case 'IN_PROGRESS':
        return { text: 'ĐANG LÀM (IN PROGRESS)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'PAUSED':
        return { text: 'TẠM DỪNG (PAUSED)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'BLOCKED':
        return { text: 'TẮC NGHỄN (BLOCKED)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'IN_REVIEW':
        return { text: 'CHỜ DUYỆT (IN REVIEW) 🔒', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'DONE':
        return { text: 'HOÀN THÀNH (DONE)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
  };

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
      case 'IMPORTANT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'NORMAL':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const statusStyle = getStatusBadge(task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Minisite Bento Card Container */}
      <div className="w-full max-w-4xl max-h-[90vh] solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col animate-solar-warp-in">
        
        {/* Background Cosmic Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 🌠 Minisite Header */}
        <div className="p-6 md:p-8 border-b border-slate-800/80 flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${statusStyle.color}`}>
                {statusStyle.text}
              </span>

              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getPriorityBadge(task.priority)}`}>
                ƯU TIÊN: {task.priority}
              </span>

              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                {task.projectName || 'Solaris Task Board Core'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {task.title}
            </h1>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 🚀 Minisite Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 relative z-10 text-xs">

          {/* Progress Bar & Status Quick Changer */}
          <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <Zap className="w-4 h-4 text-amber-400" /> Tiến Độ Hoàn Thành
              </span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">{task.progress}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-purple-500 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          {/* Metadata Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee Card */}
            <div className="solar-glass-card p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Người Thực Hiện</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400 bg-slate-900 flex items-center justify-center font-bold text-amber-400">
                  {task.assignee?.avatar ? (
                    <img src={task.assignee.avatar} alt="Assignee" className="w-full h-full object-cover" />
                  ) : (
                    <span>{task.assignee?.fullName ? task.assignee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HD'}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">{task.assignee?.fullName || 'Huy Dat (Admin)'}</h4>
                  <span className="text-[11px] text-blue-300 font-mono">
                    {task.assignee?.profession || 'DEV'} • Backend Architect
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date & Deadline Card */}
            <div className="solar-glass-card p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Hạn Deadline</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-300 text-sm">{task.dueDate || '2026-08-15'}</h4>
                  <span className="text-[11px] text-slate-400">Còn lại 3 ngày làm việc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Mô Tả Chi Tiết Nhiệm Vụ (Task Description)
            </h3>
            <p className="text-slate-300 leading-relaxed font-normal">
              {task.description || 'Xây dựng DTO, Guard JWT, và Service xử lý API Profile cá nhân. Đảm bảo bảo vệ bằng JwtAuthGuard và mã hóa bcrypt.'}
            </p>
          </div>

          {/* 💬 Activity Audit & Comments Section */}
          <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Bình Luận & Lịch Sử Tác Nghiệp ({comments.length})
            </h3>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{c.author}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{c.createdAt}</span>
                  </div>
                  <p className="text-slate-200">{c.text}</p>
                </div>
              ))}
            </div>

            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập bình luận hoặc trao đổi tiến độ..."
                className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Send className="w-4 h-4" /> Gửi
              </button>
            </form>
          </div>

        </div>

        {/* 🎬 Minisite Footer Action Bar */}
        <div className="p-4 md:px-8 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mã Task ID: <strong className="font-mono text-amber-300">{task.id}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="solar-corona-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer"
          >
            Đóng Minisite
          </button>
        </div>

      </div>
    </div>
  );
};
