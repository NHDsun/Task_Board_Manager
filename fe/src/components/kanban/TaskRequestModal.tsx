import React, { useState, useEffect } from 'react';
import { Inbox, X, UserCheck, Send, Layers } from 'lucide-react';
import type { TaskItem } from './KanbanCard';

interface TaskRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  initialTask?: TaskItem | null;
  onSubmitSuccess: (message: string) => void;
}

export const TaskRequestModal: React.FC<TaskRequestModalProps> = ({
  isOpen,
  onClose,
  tasks,
  initialTask,
  onSubmitSuccess,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [requestType, setRequestType] = useState<'TRANSFER' | 'ASSIST' | 'REVIEW'>('TRANSFER');
  const [selectedRecipientId, setSelectedRecipientId] = useState('manager-minhanh-id');
  const [requestReason, setRequestReason] = useState('');

  // Project Members List
  const projectMembers = [
    { id: 'admin-huydat-id', name: 'Huy Dat (Admin)', role: 'ADMIN', profession: 'DEV' },
    { id: 'manager-minhanh-id', name: 'Minh Anh (Manager)', role: 'MANAGER', profession: 'PRODUCT_OWNER' },
    { id: 'employee-hoangnam-id', name: 'Hoang Nam (Developer)', role: 'EMPLOYEE', profession: 'DEV' },
  ];

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
    } else if (tasks.length > 0) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [initialTask, tasks]);

  if (!isOpen) return null;

  const handleSendRequest = () => {
    const targetTask = tasks.find((t) => t.id === selectedTaskId);
    const recipient = projectMembers.find((m) => m.id === selectedRecipientId);
    
    onSubmitSuccess(
      `🟢 Đã gửi thành công Yêu cầu ${requestType} cho Task "${targetTask?.title || 'được chọn'}" tới ${recipient?.name || 'đồng nghiệp'}! Trạng thái: PENDING.`
    );
    onClose();
    setRequestReason('');
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
              <h2 className="text-xl font-black text-white tracking-tight">Gửi Yêu Cầu Task Mới</h2>
              <p className="text-xs text-slate-400">Chuyển giao, yêu cầu hỗ trợ hoặc duyệt bài</p>
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
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  📋 [{t.status}] {t.title} ({t.projectName})
                </option>
              ))}
            </select>
          </div>

          {/* Mục 2: Loại Yêu Cầu */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-300 block uppercase tracking-wider">
              2. Loại Yêu Cầu (Request Type)
            </label>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setRequestType('TRANSFER')}
                className={`py-3 rounded-xl font-black tracking-wider border transition-all cursor-pointer ${
                  requestType === 'TRANSFER'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                TRANSFER
              </button>
              <button
                type="button"
                onClick={() => setRequestType('ASSIST')}
                className={`py-3 rounded-xl font-black tracking-wider border transition-all cursor-pointer ${
                  requestType === 'ASSIST'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                ASSIST
              </button>
              <button
                type="button"
                onClick={() => setRequestType('REVIEW')}
                className={`py-3 rounded-xl font-black tracking-wider border transition-all cursor-pointer ${
                  requestType === 'REVIEW'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                REVIEW
              </button>
            </div>
          </div>

          {/* Mục 3: Chọn Người Nhận Trong Cùng Dự Án */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-amber-400" />
              3. Chọn Người Nhận Trong Cùng Dự Án (Recipient Member)
            </label>
            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
            >
              {projectMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — ({m.role} / {m.profession})
                </option>
              ))}
            </select>
          </div>

          {/* Mục 4: Lý Do & Kế Hoạch Bàn Giao */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-300 block uppercase tracking-wider">
              4. Lý Do &amp; Kế Hoạch Bàn Giao
            </label>
            <textarea
              rows={3}
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="Nhập chi tiết lý do chuyển giao hoặc cần hỗ trợ..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none shadow-inner"
            />
          </div>

          {/* Nút Gửi Yêu Cầu */}
          <button
            type="button"
            onClick={handleSendRequest}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" /> Gửi Yêu Cầu (PENDING)
          </button>
        </div>
      </div>
    </div>
  );
};
