import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Users,
  X,
  UserMinus,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Crown,
  Search,
} from 'lucide-react';

interface ProjectMemberItem {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  profession?: string;
  role?: string;
  jobTitle?: string;
  isManager: boolean;
  isCreator: boolean;
  activeTasksCount: number;
  joinedAt?: string;
}

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onMemberChanged?: () => void;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onMemberChanged,
}) => {
  const { user } = useAuthStore();
  const [activeProjectId, setActiveProjectId] = useState<string>(projectId);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [members, setMembers] = useState<ProjectMemberItem[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [managerInfo, setManagerInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<ProjectMemberItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId]);

  const isAdminOrManager = Boolean(
    user &&
      (user.globalRole === 'ADMIN' ||
        user.globalRole === 'MANAGER' ||
        (user as any).role === 'ADMIN' ||
        (user as any).role === 'MANAGER' ||
        managerInfo?.id === user.id)
  );

  const fetchMembers = async (pId: string) => {
    if (!pId) return;
    setLoading(true);
    try {
      const [memRes, usersRes, projRes] = await Promise.all([
        api.get(`/projects/${pId}/members`),
        api.get('/profile/users').catch(() => ({ data: [] })),
        api.get('/projects').catch(() => ({ data: [] })),
      ]);

      const data = memRes.data?.data || memRes.data;
      setMembers(data.members || []);
      setManagerInfo(data.manager || null);

      const uList = usersRes.data?.data || usersRes.data || [];
      setAllUsers(Array.isArray(uList) ? uList : []);

      const pList = projRes.data?.data || projRes.data || [];
      setProjectList(Array.isArray(pList) ? pList : []);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách thành viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const targetId = activeProjectId || projectId;
      if (targetId) {
        fetchMembers(targetId);
      } else {
        api.get('/projects').then((res) => {
          const list = res.data?.data || res.data || [];
          setProjectList(list);
          if (list.length > 0) {
            setActiveProjectId(list[0].id);
            fetchMembers(list[0].id);
          }
        });
      }
      setFeedbackMsg(null);
      setConfirmDeleteMember(null);
    }
  }, [isOpen, activeProjectId, projectId]);

  const handleAddMember = async () => {
    if (!selectedUserIdToAdd || isSubmitting || !activeProjectId) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      await api.post(`/projects/${activeProjectId}/members`, { userId: selectedUserIdToAdd });
      setFeedbackMsg({ text: 'Đã thêm thành viên vào dự án thành công!', type: 'success' });
      setSelectedUserIdToAdd('');
      await fetchMembers(activeProjectId);
      onMemberChanged?.();
    } catch (err: any) {
      setFeedbackMsg({
        text: err.response?.data?.message || 'Không thể thêm thành viên vào dự án',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (member: ProjectMemberItem) => {
    if (isSubmitting || !activeProjectId) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      await api.delete(`/projects/${activeProjectId}/members/${member.id}`);
      setFeedbackMsg({
        text: `Đã xóa ${member.fullName} khỏi dự án! Toàn bộ ${member.activeTasksCount} Task đã tự động chuyển giao cho Quản lý dự án.`,
        type: 'success',
      });
      setConfirmDeleteMember(null);
      await fetchMembers(activeProjectId);
      onMemberChanged?.();
    } catch (err: any) {
      setFeedbackMsg({
        text: err.response?.data?.message || 'Không thể xóa thành viên khỏi dự án',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const existingMemberIds = new Set(members.map((m) => m.id));
  const availableUsersToAdd = allUsers.filter((u) => !existingMemberIds.has(u.id));
  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-solar-warp-in"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Quản Lý Nhân Sự Dự Án
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {members.length} thành viên
                </span>
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400 font-mono">Dự án:</span>
                {projectList.length > 1 ? (
                  <select
                    value={activeProjectId}
                    onChange={(e) => {
                      setActiveProjectId(e.target.value);
                      fetchMembers(e.target.value);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                  >
                    {projectList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-amber-300 font-bold font-mono">
                    {projectList.find((p) => p.id === activeProjectId)?.name || projectName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-bold font-mono flex items-center gap-2 border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            {feedbackMsg.text}
          </div>
        )}

        {/* Add Member Bar (For Manager / Admin) */}
        {isAdminOrManager && (
          <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedUserIdToAdd}
                onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="">-- Chọn nhân sự để thêm vào dự án --</option>
                {availableUsersToAdd.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.email} ({u.profession || u.role || 'Member'}) - {u.email}
                  </option>
                ))}
              </select>
            </div>
            <button
              disabled={!selectedUserIdToAdd || isSubmitting}
              onClick={handleAddMember}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0 font-mono"
            >
              <UserPlus className="w-4 h-4" /> Thêm Vào Dự Án
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="px-6 py-3 border-b border-slate-800/40 bg-slate-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, email, chuyên môn..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Members List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 custom-scrollbar">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs animate-pulse">
              Đang tải danh sách nhân sự dự án...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              Không tìm thấy thành viên nào phù hợp.
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isPM = m.isManager || m.id === managerInfo?.id;
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isPM
                      ? 'bg-amber-950/15 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt={m.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-xs shrink-0 border border-slate-700">
                        {m.fullName?.slice(0, 2).toUpperCase() || 'US'}
                      </div>
                    )}

                    {/* Member Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white leading-tight">
                          {m.fullName}
                        </span>
                        {isPM && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-mono font-black flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3 fill-slate-950" /> Project Manager
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700 font-bold">
                          {m.profession || m.jobTitle || m.role || 'Member'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono flex-wrap">
                        <span>{m.email}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-bold">
                          📋 {m.activeTasksCount} Task đang phụ trách
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdminOrManager && !isPM && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteMember(m)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      title="Xóa thành viên và tự động chuyển toàn bộ Task về cho Manager"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Xóa Khỏi Dự Án
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>💡 Khi xóa thành viên, toàn bộ Task đang làm sẽ tự động chuyển giao về Quản lý dự án.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteMember && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-solar-warp-in">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Xác Nhận Xóa Thành Viên</h4>
                <p className="text-xs text-rose-300 font-mono">Thao tác chuyển giao tự động</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa nhân sự{' '}
                <strong className="text-white underline">{confirmDeleteMember.fullName}</strong> khỏi
                dự án này không?
              </p>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                ⚡ <strong>Quy tắc hệ thống:</strong> Toàn bộ{' '}
                <strong>{confirmDeleteMember.activeTasksCount} Task</strong> đang được giao cho nhân sự này sẽ{' '}
                <strong>tự động chuyển giao về cho Quản lý dự án</strong> để đảm bảo không bị gián đoạn tiến độ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmDeleteMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRemoveMember(confirmDeleteMember)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono font-black cursor-pointer transition-all shadow-lg flex items-center gap-1.5"
              >
                {isSubmitting ? 'Đang Xử Lý...' : '✓ Xác Nhận Xóa & Chuyển Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
