import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const token = useAuthStore((state) => state.token);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên Dự án!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data);
        setName('');
        setDescription('');
        onClose();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Không thể tạo Dự án mới');
      }
    } catch {
      setError('Lỗi kết nối Server NestJS');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.25)] relative overflow-hidden space-y-6 animate-solar-warp-in">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Tạo Dự Án Mới (Create Project)
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
              Tên Dự Án (Project Name) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Solaris AI Task Manager V2"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider block">
              Mô Tả Dự Án (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả mục tiêu, lộ trình và phạm vi của dự án..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
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
              className="solar-corona-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Đang Khởi Tạo...' : 'Khởi Tạo Dự Án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
