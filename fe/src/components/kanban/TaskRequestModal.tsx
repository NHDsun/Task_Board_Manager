import React, { useState, useEffect } from 'react';
import { Inbox, X, UserCheck, Send, Layers } from 'lucide-react';
import type { TaskItem } from './KanbanCard';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

interface TaskRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  initialTask?: TaskItem | null;
  onSubmitSuccess: (message: string) => void;
}

interface MemberUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  profession?: string;
}

export const TaskRequestModal: React.FC<TaskRequestModalProps> = ({
  isOpen,
  onClose,
  tasks,
  initialTask,
  onSubmitSuccess,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string>('');
  const [requestType, setRequestType] = useState<'TRANSFER' | 'ASSIST'>('TRANSFER');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [requestReason, setRequestReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectMembers, setProjectMembers] = useState<MemberUser[]>([]);

  // 🔄 Fetch real users list from PostgreSQL database via API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/profile/users');
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setProjectMembers(list);
        if (list.length > 0) {
          setSelectedRecipientId(list[0].id);
        }
      } catch {
        // Fallback
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const currentUser = useAuthStore((state) => state.user);

  // 🔒 CHỈ CHO PHÉP CHỌN CÁC TASK THUỘC VỀ CHÍNH MÌNH (Khi đã giao việc, chỉ người nhận mới có quyền bàn giao tiếp)
  const myOwnTasks = tasks.filter((t) => {
    if (currentUser?.globalRole === 'ADMIN') return true;
    const hasAssignee = Boolean(t.assigneeId || t.assignee?.id || t.assignee?.email);
    return hasAssignee
      ? (t.assigneeId === currentUser?.id ||
         t.assignee?.id === currentUser?.id ||
         t.assignee?.email === currentUser?.email)
      : (t as any).createdById === currentUser?.id;
  });

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
    } else if (myOwnTasks.length > 0) {
      setSelectedTaskId(myOwnTasks[0].id);
    }
  }, [initialTask, tasks, currentUser?.id]);

  const currentSelectedTask = tasks.find((t) => t.id === selectedTaskId);
  const availableSubtasks = currentSelectedTask?.subtasks?.filter((st) => !st.isDone) || [];

  if (!isOpen) return null;

  const handleSendRequest = async () => {
    if (!selectedTaskId || isSubmitting) return;

    setIsSubmitting(true);
    const targetTask = tasks.find((t) => t.id === selectedTaskId);
    const recipient = projectMembers.find((m) => m.id === selectedRecipientId);
    
    // ⚡ SAVE TASK REQUEST ROW IN POSTGRESQL CSDL & UPDATE STATUS TO 'IN_REVIEW'
    try {
      await api.post('/tasks/requests', {
        taskId: selectedTaskId,
        subtaskId: selectedSubtaskId || undefined,
        receiverId: selectedRecipientId,
        type: requestType,
        note: requestReason,
      });

      const targetSubtaskName = availableSubtasks.find((st) => st.id === selectedSubtaskId)?.title;
      onSubmitSuccess(
        `🟢 Đã gửi yêu cầu ${requestType} tới ${recipient?.fullName || 'đồng nghiệp'}! ${targetSubtaskName ? `Minitask "${targetSubtaskName}"` : `Task "${targetTask?.title || 'được chọn'}"`} đã tự động chuyển sang trạng thái CHỜ DUYỆT (IN_REVIEW) 🔒!`
      );
      onClose();
      setRequestReason('');
      setSelectedSubtaskId('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể gửi yêu cầu chuyển giao';
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] relative overflow-hidden space-y-6 animate-solar-warp-in">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Gửi Yêu Cầu Chuyển Giao Task</h2>
              <p className="text-xs text-slate-400">Task sẽ tự động đổi trạng thái thành CHỜ DUYỆT (IN_REVIEW) 🔒</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Container */}
        <div className="solar-glass-card p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          {/* Mục 1: Chọn Task Cần Xử Lý */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-amber-400" />
              1. Chọn Task Cần Xử Lý (Select Target Task)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setSelectedSubtaskId('');
              }}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
            >
              {myOwnTasks.length === 0 ? (
                <option value="" className="bg-[#0F172A] text-slate-400 py-1">
                  ⚠️ Bạn chưa sở hữu Task nào để thực hiện chuyển giao
                </option>
              ) : (
                myOwnTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0F172A] text-slate-200 py-1">
                    📋 [{t.status}] {t.title} ({t.projectName})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Mục 1.1: Chọn Minitask (Task Con) Cụ Thể Cần Chuyển Giao */}
          {availableSubtasks.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-xs font-extrabold text-amber-400 flex items-center justify-between uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Chọn Minitask (Task Con) Cần Bàn Giao
                </span>
                <span className="text-[10px] text-amber-500 font-medium lowercase">
                  ({availableSubtasks.length} minitask khả dụng)
                </span>
              </label>
              <select
                value={selectedSubtaskId}
                onChange={(e) => setSelectedSubtaskId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200 font-medium focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner"
              >
                <option value="" className="bg-[#0F172A] text-slate-300 py-1 font-semibold">
                  ⚡ Chuyển giao toàn bộ Task (hoặc phân công chung)
                </option>
                {availableSubtasks.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#0F172A] text-amber-300 py-1">
                    🔹 Minitask: {st.title} {st.assignee ? `(Đang gán: ${st.assignee.fullName})` : '(Chưa gán)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mục 2: Loại Yêu Cầu */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Send className="w-4 h-4 text-amber-400" />
              2. Chọn Loại Yêu Cầu (Request Type)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'TRANSFER', label: '🔄 Chuyển Giao', desc: 'Bàn giao quyền phụ trách' },
                { id: 'ASSIST', label: '🤝 Cần Hỗ Trợ', desc: 'Nhờ đồng nghiệp hỗ trợ' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setRequestType(type.id as any)}
                  className={`p-3 rounded-xl font-bold text-xs border transition-all cursor-pointer text-left flex flex-col gap-0.5 ${
                    requestType === type.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-extrabold">{type.label}</span>
                  <span className={`text-[10px] font-normal ${requestType === type.id ? 'text-slate-900' : 'text-slate-500'}`}>
                    {type.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mục 3: Người Nhận Yêu Cầu */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-amber-400" />
              3. Người Nhận Yêu Cầu (Recipient)
            </label>
            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
            >
              {projectMembers.map((member) => (
                <option key={member.id} value={member.id} className="bg-[#0F172A] text-slate-200 py-1">
                  👤 {member.fullName} ({member.profession || 'DEV'})
                </option>
              ))}
            </select>
          </div>

          {/* Mục 4: Lý Do / Ghi Chú */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              📝 Lý Do / Ghi Chú Chi Tiết
            </label>
            <textarea
              rows={3}
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="Nhập ghi chú hoặc lý do cần chuyển giao/hỗ trợ..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-medium"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={isSubmitting}
            className="solar-corona-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang Gửi...' : 'Xác Nhận & Đổi Sang IN_REVIEW'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
