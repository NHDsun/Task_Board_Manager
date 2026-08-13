import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  FolderKanban,
  MessageSquare,
  Send,
  Sparkles,
  Paperclip,
  Link as LinkIcon,
  FileText,
  Upload,
  Plus,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import type { TaskItem } from './KanbanCard';
import { useAuthStore } from '../../store/useAuthStore';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onStatusChange?: (taskId: string, newStatus: TaskItem['status']) => void;
  onDeleteTask?: (task: TaskItem) => void;
}

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
}

interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  size?: string;
  createdAt: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onDeleteTask,
}) => {
  if (!isOpen || !task) return null;

  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // 🔒 PRECISE OWNERSHIP CHECK: Is this task assigned to me or created by me or am I Admin?
  const isMyTask =
    currentUser?.id === task.assigneeId ||
    currentUser?.id === (task as any).createdById ||
    currentUser?.globalRole === 'ADMIN';

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Attachments State (Trống ban đầu, tuân thủ No Static Mock Data Rule)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const [urlInput, setUrlInput] = useState('');
  const [urlTitleInput, setUrlTitleInput] = useState('');
  const [showAddUrlForm, setShowAddUrlForm] = useState(false);

  // Fetch real comments from Backend API
  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${task.id}/comments`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (res.ok) {
        const responseData = await res.json();
        const commentList = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];
        setComments(commentList);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (isOpen && task) {
      fetchComments();
    }
  }, [isOpen, task?.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 📎 Handle Local File Selection (Upload)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newAtt: AttachmentItem = {
      id: `att_${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: 'file',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      createdAt: 'Vừa xong',
    };

    setAttachments((prev) => [newAtt, ...prev]);
    e.target.value = '';
  };

  // 🔗 Handle Add Custom URL Attachment
  const handleAddUrlAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const formattedUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
    const newAtt: AttachmentItem = {
      id: `att_${Date.now()}`,
      name: urlTitleInput.trim() || formattedUrl,
      url: formattedUrl,
      type: 'link',
      createdAt: 'Vừa xong',
    };

    setAttachments((prev) => [newAtt, ...prev]);
    setUrlInput('');
    setUrlTitleInput('');
    setShowAddUrlForm(false);
  };

  // 🗑️ Remove Attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
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

              {isMyTask ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> TASK CHÍNH CHỦ
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> QUYỀN XEM VÂN TAY
                </span>
              )}
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

          {/* 🔄 IN_REVIEW & TRANSFER ROUTE BENTO CARD */}
          {(task.status === 'IN_REVIEW' || task.transferInfo) && (
            <div className="solar-glass-card p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-950 to-amber-950/60 border border-purple-500/60 space-y-4 animate-fade-in shadow-2xl">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
                <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-400" />
                  THÔNG TIN CHUYỂN GIAO NHIỆM VỤ (TASK TRANSFER DETAIL)
                </span>
                {task.status === 'IN_REVIEW' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold animate-pulse">
                    🔒 TRẠNG THÁI: IN_REVIEW (CHỜ DUYỆT BÀI)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    ✅ BÀN GIAO THÀNH CÔNG
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 📤 NGƯỜI CHUYỂN GIAO */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2">
                  <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block">
                    📤 NGƯỜI CHUYỂN GIAO (SENDER):
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400 bg-slate-950 flex items-center justify-center font-extrabold text-amber-400 text-sm shrink-0">
                      {task.transferInfo?.senderAvatar ? (
                        <img src={task.transferInfo.senderAvatar} alt="Sender" className="w-full h-full object-cover" />
                      ) : task.createdBy?.avatar ? (
                        <img src={task.createdBy.avatar} alt="Sender" className="w-full h-full object-cover" />
                      ) : (
                        <span>
                          {task.transferInfo?.senderName
                            ? task.transferInfo.senderName.slice(0, 2).toUpperCase()
                            : task.createdBy?.fullName
                            ? task.createdBy.fullName.slice(0, 2).toUpperCase()
                            : 'SD'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        {task.transferInfo?.senderName || task.createdBy?.fullName || 'Người khởi tạo'}
                      </h4>
                      <span className="text-[10px] text-amber-300 font-mono">Người khởi tạo / Gửi bàn giao</span>
                    </div>
                  </div>
                </div>

                {/* 📥 NGƯỜI TIẾP NHẬN */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/40 space-y-2">
                  <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider block">
                    📥 NGƯỜI TIẾP NHẬN (RECEIVER):
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-400 bg-slate-950 flex items-center justify-center font-extrabold text-blue-400 text-sm shrink-0">
                      {task.transferInfo?.receiverAvatar ? (
                        <img src={task.transferInfo.receiverAvatar} alt="Receiver" className="w-full h-full object-cover" />
                      ) : task.assignee?.avatar ? (
                        <img src={task.assignee.avatar} alt="Receiver" className="w-full h-full object-cover" />
                      ) : (
                        <span>
                          {task.transferInfo?.receiverName
                            ? task.transferInfo.receiverName.slice(0, 2).toUpperCase()
                            : task.assignee?.fullName
                            ? task.assignee.fullName.slice(0, 2).toUpperCase()
                            : 'RC'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        {task.transferInfo?.receiverName || task.assignee?.fullName || 'Người tiếp nhận'}
                      </h4>
                      <span className="text-[10px] text-blue-300 font-mono">Người được chỉ định tiếp nhận</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📝 GHI CHÚ NỘI DUNG CHUYỂN GIAO */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 space-y-1">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">Lý do / Ghi chú chuyển giao:</span>
                <p className="italic text-xs text-white">
                  "{task.transferInfo?.note || 'Yêu cầu chuyển giao và bàn giao nhiệm vụ tác nghiệp.'}"
                </p>
              </div>
            </div>
          )}

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

          {/* 📎 ATTACHMENTS & LINK EMBED BENTO SECTION */}
          <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Tài Liệu Đính Kèm & Links ({attachments.length})</h3>
              </div>

              {/* 👑 PERMISSION CONTROLLED ACTION BUTTONS */}
              {isMyTask ? (
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload Tệp</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setShowAddUrlForm(!showAddUrlForm)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chèn URL</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Chỉ chính chủ Task mới có quyền đính kèm tệp/URL
                </span>
              )}
            </div>

            {/* Form Chèn URL */}
            {isMyTask && showAddUrlForm && (
              <form onSubmit={handleAddUrlAttachment} className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-3 animate-fade-in">
                <h4 className="font-bold text-amber-300 text-xs">Chèn Đường Dẫn URL Hoặc Tài Liệu Mẫu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={urlTitleInput}
                    onChange={(e) => setUrlTitleInput(e.target.value)}
                    placeholder="Tiêu đề gợi nhớ (VD: Figma Design System)"
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Đường dẫn URL (VD: https://figma.com/file/...)"
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUrlForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Liên Kết
                  </button>
                </div>
              </form>
            )}

            {/* Attachments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between gap-3 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      att.type === 'file' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {att.type === 'file' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-200 hover:text-amber-400 truncate block transition-colors flex items-center gap-1"
                      >
                        <span className="truncate">{att.name}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {att.size ? `${att.size} • ` : ''}{att.createdAt}
                      </span>
                    </div>
                  </div>

                  {isMyTask && (
                    <button
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      title="Xóa tệp/URL này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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

              {comments.length === 0 && (
                <p className="text-slate-500 italic py-2">Chưa có bình luận nào. Hãy trao đổi tiến độ đầu tiên!</p>
              )}
            </div>

            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập bình luận hoặc trao đổi tiến độ..."
                className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Send className="w-4 h-4" /> {isSubmittingComment ? 'Đang gửi...' : 'Gửi'}
              </button>
            </form>
          </div>

        </div>

        {/* 🎬 Minisite Footer Action Bar */}
        <div className="p-4 md:px-8 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mã Task ID: <strong className="font-mono text-amber-300">{task.id}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            {(currentUser?.globalRole === 'ADMIN' || currentUser?.globalRole === 'MANAGER') && (
              <button
                onClick={() => {
                  onDeleteTask?.(task);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:border-rose-400"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Xóa Nhiệm Vụ</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="solar-corona-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer"
            >
              Đóng Minisite
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
