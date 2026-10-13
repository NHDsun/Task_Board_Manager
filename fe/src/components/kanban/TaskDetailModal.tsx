import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  FolderKanban,
  Sparkles,
  CheckCircle2,
  Lock,
  Edit3,
  Check,
  Trash2,
} from 'lucide-react';
import type { TaskItem, SubtaskItem } from './KanbanCard';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { UserProfileModal, type UserProfileData } from '../common/UserProfileModal';
import { getAvatarUrl } from '../../utils/avatar';
import { TaskActivityTimeline } from '../activity/TaskActivityTimeline';
import { TaskSubtasksSection } from './detail/TaskSubtasksSection';
import { TaskAttachmentsSection, type AttachmentItem } from './detail/TaskAttachmentsSection';
import { TaskCommentsSection, type CommentItem } from './detail/TaskCommentsSection';
import { TaskTransferCard } from './detail/TaskTransferCard';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onStatusChange?: (taskId: string, newStatus: TaskItem['status']) => void;
  onDeleteTask?: (task: TaskItem) => void;
  onUpdateTask?: (updatedTask: TaskItem) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onDeleteTask,
  onUpdateTask,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);

  const handleOpenProfile = (userObj?: any, roleFallback: string = 'EMPLOYEE') => {
    if (!userObj) return;
    setProfileUser({
      id: userObj.id || 'u-member',
      fullName: userObj.fullName || userObj.name || 'Thành viên Solaris',
      email:
        userObj.email ||
        `${(userObj.fullName || userObj.name || 'member').toLowerCase().replace(/[^a-z0-9]/g, '.')}@solaris.io`,
      avatarUrl: getAvatarUrl(userObj),
      avatar: getAvatarUrl(userObj),
      jobTitle: userObj.profession ? `${userObj.profession} Specialist` : 'Software Specialist',
      department: 'Engineering',
      globalRole: roleFallback,
      statusSignal: 'ONLINE',
      workMode: 'OFFICE',
    });
  };

  const hasAssignee = Boolean(task?.assigneeId || task?.assignee?.id || task?.assignee?.email);
  const isAssignee = Boolean(
    currentUser &&
    task &&
    (task.assigneeId === currentUser.id ||
      task.assignee?.id === currentUser.id ||
      (task.assignee?.email && currentUser.email === task.assignee.email))
  );

  const isCreator = Boolean(
    currentUser &&
    task &&
    (task.createdById === currentUser.id ||
      task.createdBy?.id === currentUser.id ||
      ((task.createdBy as any)?.email && currentUser.email === (task.createdBy as any).email))
  );

  const isAdminOrManager = Boolean(
    currentUser &&
    (currentUser.globalRole === 'ADMIN' ||
      currentUser.globalRole === 'MANAGER' ||
      (currentUser as any).role === 'ADMIN' ||
      (currentUser as any).role === 'MANAGER')
  );

  const isMyTask = Boolean(currentUser && (isAdminOrManager || (hasAssignee ? isAssignee : isCreator)));

  const canManageSubtasks = Boolean(
    currentUser &&
    (currentUser.globalRole === 'ADMIN' ||
      currentUser.globalRole === 'MANAGER' ||
      (currentUser as any).role === 'ADMIN' ||
      (currentUser as any).role === 'MANAGER' ||
      isAssignee ||
      (!hasAssignee && isCreator))
  );

  const isWorkerDoingTask = Boolean(
    currentUser &&
    (task?.assigneeId === currentUser.id ||
      task?.assignee?.id === currentUser.id ||
      (task?.assignee?.email && currentUser.email === task.assignee.email))
  );

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState(task?.description || '');
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskIsUrgent, setNewSubtaskIsUrgent] = useState(false);
  const [newSubtaskAssigneeId, setNewSubtaskAssigneeId] = useState('');
  const [newSubtaskDays, setNewSubtaskDays] = useState(1);
  const [newSubtaskStartDate, setNewSubtaskStartDate] = useState('');
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitleInput, setUrlTitleInput] = useState('');
  const [showAddUrlForm, setShowAddUrlForm] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setDescriptionText(task.description || '');
      setIsEditingDescription(false);
      fetchComments();
      setAttachments(task.attachments || []);
      setSubtasks(task.subtasks || []);
      setNewSubtaskAssigneeId(task.assigneeId || (task.assignee as any)?.id || '');
      setNewSubtaskStartDate(task.startDate || new Date().toISOString().slice(0, 10));

      api
        .get('/profile/users')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setDbUsers(list);
          if (list.length > 0 && !task.assigneeId && !newSubtaskAssigneeId) {
            setNewSubtaskAssigneeId(list[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, task?.id, task?.description, task?.attachments, task?.subtasks, task?.assigneeId, task?.startDate]);

  const handleAddSubtask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!task) return;
    const title = newSubtaskTitle.trim();
    if (!title || isAddingSubtask) return;

    setIsAddingSubtask(true);
    try {
      const res = await api.post(`/tasks/${task.id}/subtasks`, {
        title,
        isUrgent: newSubtaskIsUrgent,
        assigneeId: newSubtaskAssigneeId || undefined,
        startDate: newSubtaskStartDate || undefined,
        estimatedDays: newSubtaskDays,
      });
      const updatedTask = res.data?.data || res.data;
      if (updatedTask && updatedTask.id) {
        setSubtasks(updatedTask.subtasks || []);
        if (onUpdateTask) {
          onUpdateTask(updatedTask);
        }
      }
      setNewSubtaskTitle('');
      setNewSubtaskIsUrgent(false);
      setNewSubtaskDays(1);
    } catch (err: any) {
      console.error('Lỗi thêm Task con:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Không thể thêm Task con';
      alert(`⚠️ ${serverMsg}`);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleToggleUrgentSubtask = async (subtaskId: string, currentUrgent?: boolean) => {
    if (!task) return;
    const previousSubtasks = [...subtasks];
    const updated = subtasks.map((st) => (st.id === subtaskId ? { ...st, isUrgent: !currentUrgent } : st));
    setSubtasks(updated);

    try {
      const res = await api.patch(`/tasks/subtasks/${subtaskId}`, {
        isUrgent: !currentUrgent,
      });
      const updatedTask = res.data?.data || res.data;
      if (updatedTask && updatedTask.id) {
        setSubtasks(updatedTask.subtasks || []);
        if (onUpdateTask) {
          onUpdateTask(updatedTask);
        }
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật mức khẩn cấp Task con:', err);
      setSubtasks(previousSubtasks);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentDone: boolean) => {
    if (!task || currentDone) return;
    const previousSubtasks = [...subtasks];

    const updated: SubtaskItem[] = subtasks.map((st) => {
      if (st.id !== subtaskId) return st;
      if (isAdminOrManager && isWorkerDoingTask) {
        return { ...st, isDone: true, approvalStatus: 'APPROVED' as const };
      }
      return { ...st, isDone: false, approvalStatus: 'PENDING' as const };
    });
    setSubtasks(updated);

    try {
      const res = await api.patch(`/tasks/subtasks/${subtaskId}`, {
        isDone: true,
      });
      const updatedTask = res.data?.data || res.data;
      if (updatedTask && updatedTask.id) {
        setSubtasks(updatedTask.subtasks || []);
        if (onUpdateTask) {
          onUpdateTask(updatedTask);
        }
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật Task con:', err);
      setSubtasks(previousSubtasks);
      const serverMsg = err.response?.data?.message || err.message || 'Không thể cập nhật tiến độ Task con';
      alert(`⚠️ ${serverMsg}`);
    }
  };

  const handleReviewSubtask = async (subtaskId: string, action: 'APPROVE' | 'REJECT' | 'REOPEN') => {
    if (!task) return;
    let reason: string | undefined = undefined;
    if (action === 'REJECT') {
      const inputReason = window.prompt('Nhập lý do từ chối xác thực Task con này:');
      if (inputReason === null) return;
      reason = inputReason.trim() || 'Chưa đạt yêu cầu, vui lòng hoàn thiện lại';
    } else if (action === 'REOPEN') {
      const inputReason = window.prompt('Nhập lý do mở lại Task con này để nhân sự sửa lại:');
      if (inputReason === null) return;
      reason = inputReason.trim() || 'Quản lý mở lại để kiểm tra và chỉnh sửa';
    }

    try {
      const res = await api.patch(`/tasks/subtasks/${subtaskId}/review`, { action, reason });
      const updatedTask = res.data?.data || res.data;
      if (updatedTask && updatedTask.id) {
        setSubtasks(updatedTask.subtasks || []);
        if (onUpdateTask) {
          onUpdateTask(updatedTask);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể thực hiện đánh giá Task con');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    const previousSubtasks = [...subtasks];
    const updated = subtasks.filter((st) => st.id !== subtaskId);
    setSubtasks(updated);

    try {
      const res = await api.delete(`/tasks/subtasks/${subtaskId}`);
      const updatedTask = res.data?.data || res.data;
      if (updatedTask && updatedTask.id) {
        setSubtasks(updatedTask.subtasks || []);
        if (onUpdateTask) {
          onUpdateTask(updatedTask);
        }
      }
    } catch (err: any) {
      console.error('Lỗi xóa Task con:', err);
      setSubtasks(previousSubtasks);
      const serverMsg = err.response?.data?.message || err.message || 'Không thể xóa Task con';
      alert(`⚠️ ${serverMsg}`);
    }
  };

  const handleSaveDescription = async () => {
    if (!task || isSavingDescription) return;
    setIsSavingDescription(true);

    const isMockTask =
      !task.id || task.id.startsWith('task_') || task.id.startsWith('demo_') || task.id.includes('temp');

    if (isMockTask) {
      if (onUpdateTask) {
        onUpdateTask({ ...task, description: descriptionText.trim() });
      }
      setIsEditingDescription(false);
      setIsSavingDescription(false);
      return;
    }

    try {
      let res;
      try {
        res = await api.patch(`/tasks/${task.id}/description`, {
          description: descriptionText.trim(),
        });
      } catch (firstErr: any) {
        if (firstErr.response?.status === 404) {
          res = await api.patch(`/tasks/${task.id}`, {
            description: descriptionText.trim(),
          });
        } else {
          throw firstErr;
        }
      }

      const updated = res.data?.data || res.data;
      if (onUpdateTask) {
        onUpdateTask({ ...task, ...updated, description: descriptionText.trim() });
      }
      setIsEditingDescription(false);
    } catch (err: any) {
      console.error('Lỗi khi cập nhật mô tả task:', err);
      if (err.response?.status === 404) {
        if (onUpdateTask) {
          onUpdateTask({ ...task, description: descriptionText.trim() });
        }
        setIsEditingDescription(false);
      } else {
        const serverMsg = err.response?.data?.message || err.message || 'Không thể cập nhật mô tả Task';
        alert(`⚠️ Lỗi: ${serverMsg}`);
      }
    } finally {
      setIsSavingDescription(false);
    }
  };

  const fetchComments = async () => {
    if (!task) return;
    try {
      const res = await api.get(`/tasks/${task.id}/comments`);
      const commentList = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setComments(commentList);
    } catch {
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await api.post(`/tasks/${task.id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch {
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!task) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/tasks/${task.id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newAtt = res.data?.data || res.data;
      if (newAtt && newAtt.id) {
        const nextAtts = [newAtt, ...attachments];
        setAttachments(nextAtts);
        if (onUpdateTask) {
          onUpdateTask({ ...task, attachments: nextAtts });
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải file lên:', err);
    }
    e.target.value = '';
  };

  const handleAddUrlAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !urlInput.trim()) return;

    const formattedUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
    const name = urlTitleInput.trim() || formattedUrl;

    try {
      const res = await api.post(`/tasks/${task.id}/attachments`, {
        name,
        url: formattedUrl,
        type: 'link',
      });
      const newAtt = res.data?.data || res.data;
      if (newAtt && newAtt.id) {
        const nextAtts = [newAtt, ...attachments];
        setAttachments(nextAtts);
        if (onUpdateTask) {
          onUpdateTask({ ...task, attachments: nextAtts });
        }
      }
      setUrlInput('');
      setUrlTitleInput('');
      setShowAddUrlForm(false);
    } catch (err) {
      console.error('Lỗi khi liên kết URL:', err);
    }
  };

  const handleDownloadAttachment = (att: AttachmentItem) => {
    let downloadUrl = att.url;
    if (att.url.startsWith('/uploads/')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const backendUrl = apiBase.replace('/api', '');
      downloadUrl = `${backendUrl}${att.url}`;
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = att.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveAttachment = async (id: string) => {
    try {
      await api.delete(`/tasks/attachments/${id}`);
      const nextAtts = attachments.filter((a) => a.id !== id);
      setAttachments(nextAtts);
      if (onUpdateTask && task) {
        onUpdateTask({ ...task, attachments: nextAtts });
      }
    } catch (err) {
      console.error('Lỗi khi xóa đính kèm:', err);
    }
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

  const getDeadlineInfo = (dueDateStr?: string) => {
    if (!dueDateStr) {
      return {
        formattedDate: 'Chưa đặt deadline',
        statusText: 'Không giới hạn thời gian',
        statusColor: 'text-slate-400',
      };
    }

    try {
      const due = new Date(dueDateStr);
      if (isNaN(due.getTime())) {
        return {
          formattedDate: dueDateStr,
          statusText: 'Định dạng ngày',
          statusColor: 'text-slate-400',
        };
      }

      const formattedDate = `${String(due.getDate()).padStart(2, '0')}/${String(due.getMonth() + 1).padStart(2, '0')}/${due.getFullYear()}`;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const targetDate = new Date(due);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return {
          formattedDate,
          statusText: ` Đã quá hạn ${Math.abs(diffDays)} ngày`,
          statusColor: 'text-rose-400 font-bold',
        };
      } else if (diffDays === 0) {
        return {
          formattedDate,
          statusText: ' Hạn chót: Hôm nay',
          statusColor: 'text-amber-400 font-bold',
        };
      } else if (diffDays === 1) {
        return {
          formattedDate,
          statusText: ' Còn lại 1 ngày (Ngày mai)',
          statusColor: 'text-amber-300',
        };
      } else {
        return {
          formattedDate,
          statusText: `Còn lại ${diffDays} ngày làm việc`,
          statusColor: 'text-slate-400',
        };
      }
    } catch {
      return {
        formattedDate: dueDateStr,
        statusText: 'Ngày chỉ định',
        statusColor: 'text-slate-400',
      };
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Vừa tạo gần đây';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      return `${time} • ${date}`;
    } catch {
      return dateStr;
    }
  };

  if (!isOpen || !task) return null;

  const statusStyle = getStatusBadge(task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col animate-solar-warp-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 md:p-8 border-b border-slate-800/80 flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${statusStyle.color}`}>
                {statusStyle.text}
              </span>

              {task.priority === 'URGENT' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold border bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse">
                   KHẨN CẤP (URGENT)
                </span>
              )}

              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5 truncate max-w-full">
                <FolderKanban className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{task.projectName || 'Solaris Task Board Core'}</span>
              </span>

              {isMyTask ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> TASK CHÍNH CHỦ
                </span>
              ) : isCreator ? (
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> NGƯỜI GIAO VIỆC
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center gap-1 shrink-0">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> LOCK
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug break-words max-w-full">
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

        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 relative z-10 text-xs min-w-0 max-w-full">
          <TaskTransferCard task={task} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => handleOpenProfile(task.createdBy, 'MANAGER')}
              className="solar-glass-card p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 space-y-2 cursor-pointer transition-all group/creator"
              title="Nhấn để xem hồ sơ người giao việc"
            >
              <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block font-bold flex items-center justify-between">
                <span>👑 Người Giao Việc</span>
                <span className="text-[10px] text-purple-400/80 opacity-0 group-hover/creator:opacity-100 transition-opacity">
                  Xem hồ sơ ↗
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-400/80 bg-slate-900 flex items-center justify-center font-bold text-purple-300 shrink-0 group-hover/creator:scale-105 transition-transform">
                  {task.createdBy?.avatar ? (
                    <img src={task.createdBy.avatar} alt="Creator" className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {task.createdBy?.fullName
                        ? task.createdBy.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        : 'CR'}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className="font-extrabold text-white text-sm truncate group-hover/creator:text-purple-300 transition-colors"
                    title={task.createdBy?.fullName || 'Người khởi tạo'}
                  >
                    {task.createdBy?.fullName || 'Người khởi tạo'}
                  </h4>
                  <span
                    className="text-[10px] text-purple-300 font-mono flex items-center gap-1 truncate"
                    title={`Thời gian giao việc: ${task.createdAt || 'N/A'}`}
                  >
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    {formatDateTime(task.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleOpenProfile(task.assignee, 'EMPLOYEE')}
              className="solar-glass-card p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 space-y-2 cursor-pointer transition-all group/assignee"
              title="Nhấn để xem hồ sơ người thực hiện"
            >
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block font-bold flex items-center justify-between">
                <span>🎯 Người Thực Hiện</span>
                <span className="text-[10px] text-amber-400/80 opacity-0 group-hover/assignee:opacity-100 transition-opacity">
                  Xem hồ sơ ↗
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400 bg-slate-900 flex items-center justify-center font-bold text-amber-400 shrink-0 group-hover/assignee:scale-105 transition-transform">
                  {task.assignee?.avatar ? (
                    <img src={task.assignee.avatar} alt="Assignee" className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {task.assignee?.fullName
                        ? task.assignee.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        : 'UA'}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className="font-extrabold text-white text-sm truncate group-hover/assignee:text-amber-300 transition-colors"
                    title={task.assignee?.fullName || 'Chưa phân công'}
                  >
                    {task.assignee?.fullName || 'Chưa phân công (Unassigned)'}
                  </h4>
                  <span className="text-[11px] text-blue-300 font-mono truncate block">
                    {task.assignee?.profession || 'MEMBER'} • Chuyên Môn
                  </span>
                </div>
              </div>
            </div>

            {(() => {
              const deadlineInfo = getDeadlineInfo(task.dueDate);
              return (
                <div className="solar-glass-card p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                    📅 Lộ Trình Thực Hiện
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Bắt đầu:</span>
                      <span className="text-amber-300 font-bold">{task.startDate || 'Ngay bây giờ'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Hạn chót:</span>
                      <span className="text-emerald-300 font-extrabold">{deadlineInfo.formattedDate}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${deadlineInfo.statusColor} block pt-0.5`}>
                      {deadlineInfo.statusText}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Mô Tả Chi Tiết Task (Task Description)
              </h3>
              {isMyTask && !isEditingDescription && (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sửa Mô Tả</span>
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-3 animate-fade-in">
                <textarea
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="Nhập nội dung mô tả chi tiết Task..."
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-amber-500/60 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs leading-relaxed resize-y font-normal"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDescriptionText(task.description || '');
                      setIsEditingDescription(false);
                    }}
                    disabled={isSavingDescription}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDescription}
                    disabled={isSavingDescription}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSavingDescription ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed font-normal whitespace-pre-wrap break-words max-w-full overflow-hidden">
                {task.description || 'Chưa có mô tả chi tiết cho Task này.'}
              </p>
            )}
          </div>

          <TaskSubtasksSection
            task={task}
            subtasks={subtasks}
            canManageSubtasks={canManageSubtasks}
            isWorkerDoingTask={isWorkerDoingTask}
            isAdminOrManager={isAdminOrManager}
            currentUser={currentUser}
            newSubtaskTitle={newSubtaskTitle}
            setNewSubtaskTitle={setNewSubtaskTitle}
            newSubtaskIsUrgent={newSubtaskIsUrgent}
            setNewSubtaskIsUrgent={setNewSubtaskIsUrgent}
            newSubtaskAssigneeId={newSubtaskAssigneeId}
            setNewSubtaskAssigneeId={setNewSubtaskAssigneeId}
            newSubtaskDays={newSubtaskDays}
            setNewSubtaskDays={setNewSubtaskDays}
            newSubtaskStartDate={newSubtaskStartDate}
            setNewSubtaskStartDate={setNewSubtaskStartDate}
            dbUsers={dbUsers}
            isAddingSubtask={isAddingSubtask}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onToggleUrgentSubtask={handleToggleUrgentSubtask}
            onReviewSubtask={handleReviewSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />

          <TaskAttachmentsSection
            attachments={attachments}
            isMyTask={isMyTask}
            showAddUrlForm={showAddUrlForm}
            setShowAddUrlForm={setShowAddUrlForm}
            urlTitleInput={urlTitleInput}
            setUrlTitleInput={setUrlTitleInput}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            onFileUpload={handleFileUpload}
            onAddUrlAttachment={handleAddUrlAttachment}
            onDownloadAttachment={handleDownloadAttachment}
            onRemoveAttachment={handleRemoveAttachment}
          />

          <TaskCommentsSection
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            isSubmittingComment={isSubmittingComment}
            onAddComment={handleAddComment}
          />

          <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <TaskActivityTimeline taskId={task.id} />
          </div>
        </div>

        <div className="p-4 md:px-8 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>
              Mã Task ID: <strong className="font-mono text-amber-300">{task.id}</strong>
            </span>
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
                <span>Xóa Task</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="solar-corona-btn px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider shadow-md transition-all cursor-pointer"
            >
              Đóng Minisite
            </button>
          </div>
        </div>
      </div>

      <UserProfileModal user={profileUser} isOpen={!!profileUser} onClose={() => setProfileUser(null)} />
    </div>
  );
};
