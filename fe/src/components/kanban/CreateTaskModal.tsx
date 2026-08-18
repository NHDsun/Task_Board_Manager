import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Sparkles, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (task: any) => void;
}

interface DBProject {
  id: string;
  name: string;
}

interface DBUser {
  id: string;
  fullName: string;
  profession?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentUser = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [minDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });

  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [stageId, setStageId] = useState('stage_1');

  const [dbProjects, setDbProjects] = useState<DBProject[]>([]);
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 🔄 Fetch real Projects & Users list from PostgreSQL database via API
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/profile/users'),
        ]);

        const projList = Array.isArray(projRes.data) ? projRes.data : projRes.data?.data || [];
        setDbProjects(projList);
        if (projList.length > 0) setProjectId(projList[0].id);

        const userList = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || [];
        setDbUsers(userList);
        if (userList.length > 0) setAssigneeId(currentUser?.id || userList[0].id);
      } catch {
        // Fallback
      }
    };

    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen, currentUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề Task!');
      return;
    }

    if (dueDate && dueDate < minDueDate) {
      setError('Hạn Deadline (due date) phải lớn hơn ngày tạo Task (từ ngày mai trở đi)!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/tasks', {
        title,
        description,
        priority,
        projectId: projectId || undefined,
        assigneeId: assigneeId || undefined,
        dueDate,
        status: 'TODO',
        progress: 0,
        stageId,
      });

      onSuccess(res.data?.data || res.data);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể tạo Task mới';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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

          {/* 👤 CHỌN NGƯỜI THỰC HIỆN (ASSIGNEE) */}
          <div className="space-y-1.5">
            <label className="font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Giao Cho Nhân Viên Nào (Assignee) <span className="text-rose-400">*</span>
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
            >
              {dbUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0F172A] text-slate-200 py-1">
                  👤 {u.fullName} ({u.profession || 'DEV'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CHỌN DỰ ÁN */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider block">
                Thuộc Dự Án
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
              >
                {dbProjects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0F172A] text-slate-200 py-1">
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MỨC ƯU TIÊN */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider block">
                Mức Ưu Tiên
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
              >
                <option value="LOW" className="bg-[#0F172A] text-slate-200 py-1">LOW (Thấp)</option>
                <option value="NORMAL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">NORMAL (Thường)</option>
                <option value="IMPORTANT" className="bg-[#0F172A] text-slate-200 font-semibold py-1">IMPORTANT (Quan trọng)</option>
                <option value="URGENT" className="bg-[#0F172A] text-slate-200 font-semibold py-1">URGENT (Khẩn cấp)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* GIAI ĐOẠN DỰ ÁN */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider block">
                Giai Đoạn Dự Án
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
              >
                <option value="stage_1" className="bg-[#0F172A] text-slate-200 py-1">1. Yêu Cầu & Phân Tích</option>
                <option value="stage_2" className="bg-[#0F172A] text-slate-200 py-1">2. Thiết Kế UI/UX</option>
                <option value="stage_3" className="bg-[#0F172A] text-slate-200 py-1">3. Lập Trình Backend/Frontend</option>
                <option value="stage_4" className="bg-[#0F172A] text-slate-200 py-1">4. Kiểm Thử QA/QC</option>
                <option value="stage_5" className="bg-[#0F172A] text-slate-200 py-1">5. Chạy Thử Staging</option>
                <option value="stage_6" className="bg-[#0F172A] text-slate-200 py-1">6. Bàn Giao & Nghiệm Thu</option>
              </select>
            </div>

            {/* HẠN DEADLINE (PHẢI LỚN HƠN NGÀY TẠO TASK) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider block">
                Hạn Deadline (Từ Ngày Mai)
              </label>
              <input
                type="date"
                value={dueDate}
                min={minDueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
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
