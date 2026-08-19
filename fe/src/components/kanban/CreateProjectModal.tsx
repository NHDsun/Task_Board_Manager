import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Sparkles, UserPlus, Check, Crown, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
  existingProjects?: string[];
}

interface MemberUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  profession?: string;
  avatar?: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingProjects = [],
}) => {
  const currentUser = useAuthStore((state) => state.user);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<MemberUser[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [customStages, setCustomStages] = useState<string[]>([
    '1. Yêu Cầu & Phân Tích',
    '2. Thiết Kế UI/UX',
    '3. Lập Trình Backend/Frontend',
    '4. Kiểm Thử QA/QC',
    '5. Bàn Giao & Nghiệm Thu',
  ]);
  const [newStageInput, setNewStageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
        setAvailableUsers(list);
      } catch {
        // Fallback
      }
    };

    if (isOpen) {
      fetchUsers();
      if (currentUser?.id) {
        setSelectedManagerId(currentUser.id);
        setSelectedMemberIds((prev) => (prev.includes(currentUser.id) ? prev : [currentUser.id, ...prev]));
      }
    }
  }, [isOpen, currentUser?.id]);

  const toggleMemberSelect = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên Dự án!');
      return;
    }

    // 🔒 [LC-99] KIỂM TRA TRÙNG TÊN CLIENT-SIDE (CASE-INSENSITIVE)
    const isDuplicate = existingProjects.some(
      (pName) => pName.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError(`Dự án mang tên "${trimmed}" đã tồn tại trong hệ thống! Vui lòng chọn một tên khác.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/projects', {
        name: trimmed,
        description,
        managerId: selectedManagerId,
        memberIds: selectedMemberIds,
        stagesJson: JSON.stringify(
          customStages.map((stName, idx) => ({
            id: `stage_${idx + 1}`,
            name: stName,
            status: idx === customStages.length - 1 ? 'DONE' : 'IN_PROGRESS',
            color: 'border-purple-500/40 text-purple-300',
          }))
        ),
      });

      onSuccess(res.data?.data || res.data);
      setName('');
      setDescription('');
      setSelectedManagerId('');
      setSelectedMemberIds([]);
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể tạo Dự án mới';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomStage = () => {
    if (!newStageInput.trim()) return;
    setCustomStages((prev) => [...prev, newStageInput.trim()]);
    setNewStageInput('');
  };

  const handleRemoveCustomStage = (index: number) => {
    setCustomStages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen || currentUser?.globalRole !== 'ADMIN') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.25)] relative overflow-hidden space-y-6 animate-solar-warp-in max-h-[90vh] overflow-y-auto">
        
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
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả mục tiêu, lộ trình và phạm vi của dự án..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          {/* 👑 CHỈ ĐỊNH QUẢN LÝ DỰ ÁN (PROJECT MANAGER ASSIGNMENT) */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <label className="font-bold text-amber-300 uppercase tracking-wider block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                Chỉ Định Quản Lý Dự Án (Project Manager) <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-amber-400/80 lowercase font-normal">(toàn quyền điều hành)</span>
            </label>

            <select
              value={selectedManagerId}
              onChange={(e) => {
                const newMgrId = e.target.value;
                setSelectedManagerId(newMgrId);
                if (newMgrId && !selectedMemberIds.includes(newMgrId)) {
                  setSelectedMemberIds((prev) => [...prev, newMgrId]);
                }
              }}
              className="w-full p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner text-xs"
            >
              {currentUser && (
                <option value={currentUser.id} className="bg-slate-950 text-amber-300 font-bold py-1">
                  👑 Chính tôi ({currentUser.fullName} - {currentUser.globalRole || (currentUser as any)?.role || 'ADMIN'})
                </option>
              )}
              {availableUsers.filter((u) => u.id !== currentUser?.id && (u.role === 'MANAGER' || u.role === 'ADMIN')).length > 0 && (
                <optgroup label="👔 Quản Lý & Admin Hệ Thống" className="bg-slate-950 text-slate-400">
                  {availableUsers
                    .filter((u) => u.id !== currentUser?.id && (u.role === 'MANAGER' || u.role === 'ADMIN'))
                    .map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-950 text-slate-100 py-1">
                        👔 {u.fullName} ({u.role}) - {u.email}
                      </option>
                    ))}
                </optgroup>
              )}
              {availableUsers.filter((u) => u.id !== currentUser?.id && u.role !== 'MANAGER' && u.role !== 'ADMIN').length > 0 && (
                <optgroup label="👤 Nhân Viên (Tự động cấp toàn quyền Quản lý)" className="bg-slate-950 text-purple-400 font-bold">
                  {availableUsers
                    .filter((u) => u.id !== currentUser?.id && u.role !== 'MANAGER' && u.role !== 'ADMIN')
                    .map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-950 text-slate-200 py-1">
                        👤 {u.fullName} ({u.profession || 'Nhân viên'}) - {u.email} ➔ Cấp quyền Manager
                      </option>
                    ))}
                </optgroup>
              )}
            </select>

            {/* Thông báo quyền hạn tự động */}
            {selectedManagerId && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200/90 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Đặc quyền Quản lý:</strong>{' '}
                  {availableUsers.find((u) => u.id === selectedManagerId)?.fullName || 'Người được chọn'} sẽ có{' '}
                  <strong>toàn quyền Quản lý</strong>: Phê duyệt Task con, điều phối tiến độ, phân công thành viên và đóng/mở giai đoạn dự án.
                </span>
              </div>
            )}
          </div>

          {/* 🎛️ THIẾT LẬP CÁC GIAI ĐOẠN PIPELINE (CUSTOM PIPELINE STAGES) */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <label className="font-bold text-purple-300 uppercase tracking-wider block flex items-center justify-between">
              <span>🎛️ Thiết Lập Các Giai Đoạn Pipeline ({customStages.length})</span>
              <span className="text-[10px] text-slate-500 lowercase font-normal">(tùy chỉnh thủ công)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStageInput}
                onChange={(e) => setNewStageInput(e.target.value)}
                placeholder="Tên giai đoạn mới (VD: 6. Kiểm Thử Security)"
                className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCustomStage}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                + Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {customStages.map((st, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300 font-mono text-[11px] flex items-center gap-1.5"
                >
                  {st}
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomStage(idx)}
                    className="text-slate-500 hover:text-rose-400 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 👥 THÊM THÀNH VIÊN VÀO DỰ ÁN (ADD MEMBERS) */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <label className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Thêm Thành Viên Dự Án ({selectedMemberIds.length} đã chọn)
            </label>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {availableUsers.map((user) => {
                const isSelected = selectedMemberIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleMemberSelect(user.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 font-bold flex items-center justify-center text-[10px] text-amber-400">
                        {user.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{user.fullName}</h4>
                        <span className="text-[10px] text-slate-500">{user.email}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      isSelected ? 'bg-purple-500 border-purple-400 text-white' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
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
