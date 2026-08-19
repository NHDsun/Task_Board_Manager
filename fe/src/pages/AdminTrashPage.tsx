import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Folder,
  Clock,
  Search,
  RefreshCw,
  FolderOpen,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { SolarNotificationModal } from '../components/common/SolarNotificationModal';

interface TrashProject {
  id: string;
  name: string;
  description?: string;
  deletedAt: string;
  expiresAt: string;
  daysLeft: number;
  hoursLeft: number;
  timeRemainingText: string;
  tasksCount: number;
  membersCount: number;
  createdBy?: { id: string; fullName: string; avatar?: string };
  manager?: { id: string; fullName: string; avatar?: string };
}

interface TrashTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  projectId: string;
  projectName: string;
  isParentProjectDeleted: boolean;
  deletedAt: string;
  expiresAt: string;
  daysLeft: number;
  hoursLeft: number;
  timeRemainingText: string;
  assignee?: { id: string; fullName: string; avatar?: string };
  createdBy?: { id: string; fullName: string; avatar?: string };
}

export const AdminTrashPage: React.FC = () => {
  const [projects, setProjects] = useState<TrashProject[]>([]);
  const [tasks, setTasks] = useState<TrashTask[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROJECTS' | 'TASKS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal Xác nhận Xóa Vĩnh Viễn / Dọn Sạch
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'project' | 'task' | 'empty_all';
    targetId?: string;
    targetName?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'project',
  });

  // Modal Thông Báo Toast
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const currentUser = useAuthStore((state) => state.user);

  const fetchTrashData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/trash');
      setProjects(res.data?.projects || []);
      setTasks(res.data?.tasks || []);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu Thùng Rác:', err);
      setNotification({
        isOpen: true,
        title: 'Lỗi Truy Cập',
        message: err.response?.data?.message || 'Không thể tải dữ liệu Thùng Rác.',
        type: 'warning',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashData();
  }, []);

  // 🔄 Khôi phục Dự Án
  const handleRestoreProject = async (id: string, name: string) => {
    try {
      await api.post(`/admin/trash/restore-project/${id}`);
      setNotification({
        isOpen: true,
        title: 'Khôi Phục Thành Công',
        message: `Dự án "${name}" và toàn bộ công việc liên quan đã được khôi phục về hệ thống!`,
        type: 'success',
      });
      fetchTrashData();
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: 'Lỗi Khôi Phục',
        message: err.response?.data?.message || 'Không thể khôi phục dự án.',
        type: 'warning',
      });
    }
  };

  // 🔄 Khôi phục Task
  const handleRestoreTask = async (id: string, title: string) => {
    try {
      await api.post(`/admin/trash/restore-task/${id}`);
      setNotification({
        isOpen: true,
        title: 'Khôi Phục Thành Công',
        message: `Công việc "${title}" đã được khôi phục về Bảng Kanban!`,
        type: 'success',
      });
      fetchTrashData();
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: 'Lỗi Khôi Phục',
        message: err.response?.data?.message || 'Không thể khôi phục công việc.',
        type: 'warning',
      });
    }
  };

  // 💥 Xóa Vĩnh Viễn khi nhấn nút xác nhận trong Modal
  const executePermanentAction = async () => {
    try {
      if (confirmModal.type === 'project' && confirmModal.targetId) {
        await api.delete(`/admin/trash/permanent-project/${confirmModal.targetId}`);
        setNotification({
          isOpen: true,
          title: 'Đã Xóa Vĩnh Viễn',
          message: `Dự án "${confirmModal.targetName}" đã được xóa triệt để khỏi CSDL.`,
          type: 'success',
        });
      } else if (confirmModal.type === 'task' && confirmModal.targetId) {
        await api.delete(`/admin/trash/permanent-task/${confirmModal.targetId}`);
        setNotification({
          isOpen: true,
          title: 'Đã Xóa Vĩnh Viễn',
          message: `Công việc "${confirmModal.targetName}" đã được xóa triệt để khỏi CSDL.`,
          type: 'success',
        });
      } else if (confirmModal.type === 'empty_all') {
        await api.delete('/admin/trash/empty-all');
        setNotification({
          isOpen: true,
          title: 'Đã Dọn Sạch Thùng Rác',
          message: 'Toàn bộ dữ liệu trong Thùng Rác đã được xóa vĩnh viễn.',
          type: 'success',
        });
      }
      setConfirmModal({ ...confirmModal, isOpen: false });
      fetchTrashData();
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: 'Lỗi Xóa Dữ Liệu',
        message: err.response?.data?.message || 'Không thể thực hiện xóa vĩnh viễn.',
        type: 'warning',
      });
    }
  };

  // 🔍 Lọc theo tìm kiếm và tab
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = projects.length + tasks.length;

  if (currentUser?.globalRole !== 'ADMIN') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Quyền Truy Cập Bị Từ Chối</h2>
        <p className="text-sm text-slate-400">
          Chỉ Quản Trị Viên (Admin) mới có quyền truy cập Trung Tâm Thùng Rác Hệ Thống.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* 🚀 Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0F172A]/90 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/30 to-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Trash2 className="w-7 h-7 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white">
                Thùng Rác Hệ Thống
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                14-DAY RETENTION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dữ liệu đã xóa được lưu trữ an toàn trong <span className="text-amber-300 font-bold">14 ngày</span> trước khi bị hủy vĩnh viễn. Bạn có thể khôi phục bất cứ lúc nào.
            </p>
          </div>
        </div>

        {/* Nút Hành Động Nhanh */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTrashData}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40 transition-all cursor-pointer shadow-md"
            title="Đồng Bộ Lại"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {totalItems > 0 && (
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  title: 'Dọn Sạch Thùng Rác Toàn Hệ Thống',
                  message: `Bạn có chắc chắn muốn xóa vĩnh viễn toàn bộ ${projects.length} Dự án và ${tasks.length} Task khỏi cơ sở dữ liệu? Hành động này KHÔNG THỂ HOÀN TÁC!`,
                  type: 'empty_all',
                })
              }
              className="px-4 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-500/10"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Dọn Sạch Thùng Rác</span>
            </button>
          )}
        </div>
      </div>

      {/* 🔍 Bộ Lọc & Tìm Kiếm */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          {[
            { id: 'ALL', label: `Tất Cả (${totalItems})` },
            { id: 'PROJECTS', label: `Dự Án (${projects.length})` },
            { id: 'TASKS', label: `Công Việc (${tasks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm dự án hoặc task đã xóa..."
            className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-72"
          />
        </div>
      </div>

      {/* 📂 DANH SÁCH DỰ ÁN ĐÃ XÓA */}
      {(activeTab === 'ALL' || activeTab === 'PROJECTS') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Dự Án Đã Xóa ({filteredProjects.length})
            </h2>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0F172A]/50 border border-slate-800/80 text-center text-slate-500 text-xs">
              Không có dự án nào trong Thùng Rác.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => {
                // Tính phần trăm thời gian còn lại trong 14 ngày
                const percentLeft = Math.max(0, Math.min(100, Math.round((proj.daysLeft / 14) * 100)));

                return (
                  <div
                    key={proj.id}
                    className="p-5 rounded-3xl bg-[#0F172A]/80 border border-purple-500/20 hover:border-purple-500/40 shadow-lg space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">{proj.name}</h3>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {proj.description || 'Không có mô tả'}
                          </span>
                        </div>
                      </div>

                      {/* Badge Đếm Ngược 14 Ngày */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-mono font-bold shrink-0 ${
                          proj.daysLeft <= 0 && proj.hoursLeft <= 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : proj.daysLeft <= 3
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {proj.daysLeft <= 0 && proj.hoursLeft <= 0
                            ? 'Đã hết hạn lưu giữ'
                            : proj.timeRemainingText}
                        </span>
                      </div>
                    </div>

                    {/* Thanh Tiến Độ Thời Gian 14 Ngày */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Hạn lưu giữ: 14 ngày</span>
                        <span
                          className={
                            proj.daysLeft <= 0
                              ? 'text-rose-400 font-black'
                              : proj.daysLeft <= 3
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400'
                          }
                        >
                          {proj.daysLeft <= 0 && proj.hoursLeft <= 0
                            ? '0 ngày (sắp dọn dẹp)'
                            : `${proj.daysLeft} ngày còn lại`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            proj.daysLeft <= 3
                              ? 'bg-rose-500'
                              : proj.daysLeft <= 7
                              ? 'bg-amber-500'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.max(2, percentLeft)}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Info & Nút Hành Động */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>📦 {proj.tasksCount} Tasks</span>
                        <span>👥 {proj.membersCount} Thành viên</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreProject(proj.id, proj.name)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Khôi Phục</span>
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              title: `Xóa Vĩnh Viễn Dự Án "${proj.name}"`,
                              message: `Toàn bộ ${proj.tasksCount} task trong dự án này sẽ bị xóa sạch khỏi CSDL vĩnh viễn. Bạn có chắc chắn không?`,
                              type: 'project',
                              targetId: proj.id,
                              targetName: proj.name,
                            })
                          }
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
                          title="Xóa Vĩnh Viễn Khỏi CSDL"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 📋 DANH SÁCH TASK ĐÃ XÓA */}
      {(activeTab === 'ALL' || activeTab === 'TASKS') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Công Việc Đã Xóa ({filteredTasks.length})
            </h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0F172A]/50 border border-slate-800/80 text-center text-slate-500 text-xs">
              Không có công việc nào trong Thùng Rác.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 hover:border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="overflow-hidden space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white truncate">{t.title}</span>
                        {t.isParentProjectDeleted && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[9px] font-mono border border-rose-500/30">
                            DỰ ÁN ĐÃ BỊ XÓA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                        <span>📁 {t.projectName}</span>
                        {t.assignee && <span>👤 @{t.assignee.fullName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Thời gian còn lại */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono ${
                        t.daysLeft <= 0 && t.hoursLeft <= 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : t.daysLeft <= 3
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-900 border border-slate-800 text-amber-300'
                      }`}
                    >
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>
                        {t.daysLeft <= 0 && t.hoursLeft <= 0
                          ? 'Đã hết hạn lưu giữ'
                          : t.timeRemainingText}
                      </span>
                    </div>

                    {/* Nút Khôi Phục & Xóa Vĩnh Viễn */}
                    <button
                      onClick={() => handleRestoreTask(t.id, t.title)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi Phục</span>
                    </button>

                    <button
                      onClick={() =>
                        setConfirmModal({
                          isOpen: true,
                          title: `Xóa Vĩnh Viễn Task "${t.title}"`,
                          message: 'Công việc này sẽ bị xóa sạch khỏi CSDL vĩnh viễn. Bạn có chắc chắn không?',
                          type: 'task',
                          targetId: t.id,
                          targetName: t.title,
                        })
                      }
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
                      title="Xóa Vĩnh Viễn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ⚠️ MODAL XÁC NHẬN XÓA VĨNH VIỄN */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0F172A] border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{confirmModal.title}</h3>
                <span className="text-[10px] text-rose-400/90 font-mono font-bold uppercase tracking-wider">
                  CẢNH BÁO NGUY HIỂM: KHÔNG THỂ HOÀN TÁC
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={executePermanentAction}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-black shadow-lg shadow-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Xóa Vĩnh Viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 MODAL THÔNG BÁO TOAST CHUNG */}
      <SolarNotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};
