import React, { useState } from 'react';
import { X, PlusCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (task: any) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const token = useAuthStore((state) => state.token);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [projectId, setProjectId] = useState('project-solaris-core-id');
  const [dueDate, setDueDate] = useState('2026-08-20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề Task!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          projectId,
          dueDate,
          status: 'TODO',
          progress: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data);
        setTitle('');
        setDescription('');
        onClose();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Không thể tạo Task mới');
      }
    } catch {
      setError('Lỗi kết nối Server NestJS');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden space-y-6 animate-solar-warp-in">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Tạo Task Mới (Create Task)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider block">
              Tiêu Đề Task <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lập trình API WebSockets Realtime"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider block">
              Mô Tả Chi Tiết (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập chi tiết yêu cầu kỹ thuật và phân công..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider block">
                Thuộc Dự Án
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
              >
                <option value="project-solaris-core-id">Solaris Task Board Core</option>
                <option value="project-solaris-ui-id">Solaris UI Redesign</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider block">
                Mức Ưu Tiên
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
              >
                <option value="LOW">LOW (Thấp)</option>
                <option value="NORMAL">NORMAL (Thường)</option>
                <option value="IMPORTANT">IMPORTANT (Quan trọng)</option>
                <option value="URGENT">URGENT (Khẩn cấp)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider block">
              Hạn Deadline
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold hover:text-white transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="solar-corona-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Đang Tạo...' : 'Tạo Task Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
