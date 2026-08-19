import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Sparkles, UserCheck, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
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

interface SubtaskDraft {
  title: string;
  days: number;
  isUrgent: boolean;
  assigneeId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentUser = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [stageId, setStageId] = useState('stage_1');

  // 🔘 Subtasks Builder State
  const [subtasksDraft, setSubtasksDraft] = useState<SubtaskDraft[]>([]);
  const [subtaskInputTitle, setSubtaskInputTitle] = useState('');
  const [subtaskInputDays, setSubtaskInputDays] = useState(1);
  const [subtaskInputIsUrgent, setSubtaskInputIsUrgent] = useState(false);
  const [subtaskInputAssigneeId, setSubtaskInputAssigneeId] = useState('');

  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  const totalEstimatedDays = subtasksDraft.reduce((acc, st) => acc + (st.days || 1), 0);

  const computedDueDate = (() => {
    const base = startDate ? new Date(startDate) : new Date();
    const daysToAdd = Math.max(totalEstimatedDays, 1);
    base.setDate(base.getDate() + daysToAdd);
    return base.toISOString().slice(0, 10);
  })();

  const [customDueDate, setCustomDueDate] = useState('');

  const effectiveDueDate = customDueDate || computedDueDate;

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
        if (userList.length > 0) {
          setAssigneeId(currentUser?.id || userList[0].id);
          setSubtaskInputAssigneeId(currentUser?.id || userList[0].id);
        }
      } catch {
        // Fallback
      }
    };

    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen, currentUser?.id]);

  const handleAddDraftSubtask = () => {
    if (!subtaskInputTitle.trim()) return;
    setSubtasksDraft((prev) => [
      ...prev,
      {
        title: subtaskInputTitle.trim(),
        days: subtaskInputDays,
        isUrgent: subtaskInputIsUrgent,
        assigneeId: subtaskInputAssigneeId || assigneeId || undefined,
      },
    ]);
    setSubtaskInputTitle('');
    setSubtaskInputDays(1);
    setSubtaskInputIsUrgent(false);
  };

  const handleRemoveDraftSubtask = (index: number) => {
    setSubtasksDraft((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề Task!');
      return;
    }

    if (effectiveDueDate && startDate && effectiveDueDate < startDate) {
      setError('Hạn Deadline (due date) phải lớn hơn hoặc bằng Ngày Bắt Đầu Task!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/tasks', {
        title,
        description,
        projectId: projectId || undefined,
        assigneeId: assigneeId || undefined,
        startDate: startDate || undefined,
        dueDate: effectiveDueDate,
        status: 'TODO',
        progress: 0,
        stageId,
        subtasks: subtasksDraft.map((st) => ({
          title: st.title,
          isUrgent: st.isUrgent,
          estimatedDays: st.days,
          assigneeId: st.assigneeId,
        })),
      });

      onSuccess(res.data?.data || res.data);
      setTitle('');
      setDescription('');
      setSubtasksDraft([]);
      setCustomDueDate('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden space-y-6 animate-solar-warp-in my-8">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Tạo Task Mới (Create Task)
              </h2>
              <p className="text-[11px] text-slate-400">
                Phân rã lộ trình Task con theo từng ngày, tự động tính hạn chót công bằng cho nhân sự.
              </p>
            </div>
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
          {/* Tiêu đề Task */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider block">
              Tiêu Đề Task <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lập trình API WebSockets Realtime"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-semibold text-xs"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider block">
              Mô Tả Chi Tiết (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập chi tiết yêu cầu kỹ thuật và phân công..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 👤 CHỌN NGƯỜI THỰC HIỆN (ASSIGNEE) */}
            <div className="space-y-1.5">
              <label className="font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Giao Cho Nhân Viên (Assignee) <span className="text-rose-400">*</span>
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
          </div>

          {/* 🔘 PHÂN RÃ TASK CON & ƯỚC LƯỢNG NGÀY (SUBTASKS DAILY SPRINT BUILDER) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Lộ Trình Task Con & Thời Hạn Thực Hiện (1, 2, 3 Ngày):
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-bold bg-purple-950 px-2 py-0.5 rounded border border-purple-500/40">
                {subtasksDraft.length} Task Con ({totalEstimatedDays} Ngày)
              </span>
            </div>

            {/* Draft list */}
            {subtasksDraft.length > 0 && (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {subtasksDraft.map((st, idx) => {
                  const assignedUser = dbUsers.find((u) => u.id === st.assigneeId);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-purple-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          Ngày #{idx + 1}
                        </span>
                        <span className="text-xs text-white truncate font-medium">{st.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {assignedUser && (
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                            👤 {assignedUser.fullName.replace(/\s*\([^)]*\)/g, '')}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          ⏳ {st.days} ngày
                        </span>
                        {st.isUrgent && (
                          <span className="text-[10px] font-mono text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40 font-bold animate-pulse">
                            🚨 GẤP
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftSubtask(idx)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                          title="Xóa Task con này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form thêm Task con nhanh */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <input
                type="text"
                value={subtaskInputTitle}
                onChange={(e) => setSubtaskInputTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDraftSubtask();
                  }
                }}
                placeholder="Nhập tên Task con (VD: Thiết kế cơ sở dữ liệu)..."
                className="flex-1 min-w-[180px] p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-xs"
              />
              <select
                value={subtaskInputAssigneeId}
                onChange={(e) => setSubtaskInputAssigneeId(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-purple-400 cursor-pointer max-w-[150px] truncate"
                title="Chọn nhân sự phụ trách riêng cho Task con này"
              >
                {dbUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#0F172A] text-slate-200">
                    👤 {u.fullName}
                  </option>
                ))}
              </select>
              <select
                value={subtaskInputDays}
                onChange={(e) => setSubtaskInputDays(Number(e.target.value))}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value={1}>1 ngày</option>
                <option value={2}>2 ngày</option>
                <option value={3}>3 ngày</option>
                <option value={4}>4 ngày</option>
                <option value={5}>5 ngày</option>
              </select>
              <button
                type="button"
                onClick={() => setSubtaskInputIsUrgent(!subtaskInputIsUrgent)}
                className={`p-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                  subtaskInputIsUrgent
                    ? 'bg-red-500 text-white border-red-400 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🚨 {subtaskInputIsUrgent ? 'Gấp' : 'Đặt Gấp?'}
              </button>
              <button
                type="button"
                onClick={handleAddDraftSubtask}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" /> Thêm Task Con
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* GIAI ĐOẠN DỰ ÁN */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider block">
                Giai Đoạn Quy Trình
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500/60 font-semibold cursor-pointer text-xs"
              >
                <option value="stage_1" className="bg-[#0F172A] text-slate-200 py-1">1. Yêu Cầu & Phân Tích</option>
                <option value="stage_2" className="bg-[#0F172A] text-slate-200 py-1">2. Thiết Kế UI/UX</option>
                <option value="stage_3" className="bg-[#0F172A] text-slate-200 py-1">3. Lập Trình Backend/Frontend</option>
                <option value="stage_4" className="bg-[#0F172A] text-slate-200 py-1">4. Kiểm Thử QA/QC</option>
                <option value="stage_5" className="bg-[#0F172A] text-slate-200 py-1">5. Chạy Thử Staging</option>
                <option value="stage_6" className="bg-[#0F172A] text-slate-200 py-1">6. Bàn Giao & Nghiệm Thu</option>
              </select>
            </div>

            {/* NGÀY BẮT ĐẦU TASK */}
            <div className="space-y-1.5">
              <label className="font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Ngày Bắt Đầu Task
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
              />
            </div>

            {/* HẠN DEADLINE (TỰ ĐỘNG TÍNH TOÁN THEO TỔNG NGÀY TASK CON TỪ NGÀY BẮT ĐẦU) */}
            <div className="space-y-1.5">
              <label className="font-bold text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Hạn Deadline Tổng
              </label>
              <input
                type="date"
                value={effectiveDueDate}
                min={startDate}
                onChange={(e) => setCustomDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400 cursor-pointer text-xs"
              />
            </div>
          </div>

          {/* 🛡️ Thông điệp Tôn Trọng Nhân Viên */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Lên lịch linh hoạt:</strong> Ngày bắt đầu ({startDate}) giúp bạn có thể chuẩn bị task trước mà không bắt buộc nhân sự phải làm ngay lập tức. Hạn chót tổng ({effectiveDueDate}) được tự động tính dựa trên tổng thời gian các Task con ({totalEstimatedDays} ngày).
            </span>
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
