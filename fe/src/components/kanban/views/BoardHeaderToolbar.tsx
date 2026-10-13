import React from 'react';
import {
  Search,
  Kanban,
  GitMerge,
  Target,
  Filter,
  UserCheck,
  Users,
  RefreshCw,
  PlusCircle,
  FolderPlus,
  Bell,
} from 'lucide-react';
import { NotificationCenter } from '../../navigation/NotificationCenter';
import type { TaskItem } from '../KanbanCard';

interface BoardHeaderToolbarProps {
  user: any;
  isLoading: boolean;
  tasks: TaskItem[];
  dbProjects: Array<{ id: string; name: string }>;
  dbUsers: Array<{ id: string; fullName: string }>;
  filterProject: string;
  setFilterProject: (val: string) => void;
  filterAssignee: string;
  setFilterAssignee: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  filterProfession: string;
  setFilterProfession: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeView: 'focus' | 'pipeline' | 'kanban';
  setActiveView: (view: 'focus' | 'pipeline' | 'kanban') => void;
  pendingNotificationCount: number;
  onRefresh: () => void;
  onOpenCreateProjectModal: () => void;
  onOpenProjectMembersModal: () => void;
  onOpenCreateTaskModal: () => void;
  onOpenTransferInbox: () => void;
  onSelectTaskForDetail: (task: TaskItem) => void;
  showNotification: (msg: string, type: 'success' | 'warning' | 'info', title?: string) => void;
}

export const BoardHeaderToolbar: React.FC<BoardHeaderToolbarProps> = ({
  user,
  isLoading,
  tasks,
  dbProjects,
  dbUsers,
  filterProject,
  setFilterProject,
  filterAssignee,
  setFilterAssignee,
  filterPriority,
  setFilterPriority,
  filterProfession,
  setFilterProfession,
  searchQuery,
  setSearchQuery,
  activeView,
  setActiveView,
  pendingNotificationCount,
  onRefresh,
  onOpenCreateProjectModal,
  onOpenProjectMembersModal,
  onOpenCreateTaskModal,
  onOpenTransferInbox,
  onSelectTaskForDetail,
  showNotification,
}) => {
  const isRoleAdminOrManager = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';

  const tabs = [
    {
      id: 'focus' as const,
      label: "Today's Focus",
      icon: Target,
    },
    {
      id: 'pipeline' as const,
      label: 'Roadmap & Pipeline',
      icon: GitMerge,
    },
    {
      id: 'kanban' as const,
      label: 'Kanban Matrix',
      icon: Kanban,
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>SOLARIS WORKSPACE</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Đồng Bộ Dữ Liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {user?.globalRole === 'ADMIN' && (
            <button
              onClick={onOpenCreateProjectModal}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-400" />
              <span>+ Tạo Dự Án</span>
            </button>
          )}

          {isRoleAdminOrManager && (
            <button
              onClick={onOpenProjectMembersModal}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Quản lý thành viên dự án"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Thành Viên</span>
            </button>
          )}

          {isRoleAdminOrManager && (
            <button
              onClick={onOpenCreateTaskModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tạo Task Mới</span>
            </button>
          )}

          <div className="relative hidden lg:block">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm task..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 w-48"
            />
          </div>

          <NotificationCenter
            onSelectTaskId={async (id) => {
              const target = tasks.find((t) => t.id === id);
              if (target) {
                onSelectTaskForDetail(target);
              } else {
                showNotification(
                  'Công việc này đã bị chuyển vào Thùng Rác hoặc bạn không còn quyền truy cập!',
                  'warning',
                  'Không Thể Mở Task'
                );
              }
            }}
          />

          <button
            onClick={onOpenTransferInbox}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
            title="Trung Tâm Phê Duyệt Task"
          >
            <div className="relative">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              {pendingNotificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {pendingNotificationCount}
                </span>
              )}
            </div>
            <span>Duyệt & Bàn Giao</span>
          </button>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center gap-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Tất Cả Dự Án</option>
              {dbProjects.map((p) => (
                <option key={p.id} value={p.name} className="bg-[#0F172A] text-slate-200 font-semibold py-1">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Tất Cả Nhân Sự</option>
              {dbUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0F172A] text-slate-200 font-semibold py-1">
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-amber-400 font-bold">★</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Mọi Độ Ưu Tiên</option>
              <option value="URGENT" className="bg-[#0F172A] text-slate-200 font-semibold py-1">URGENT (Khẩn cấp)</option>
              <option value="IMPORTANT" className="bg-[#0F172A] text-slate-200 font-semibold py-1">IMPORTANT (Quan trọng)</option>
              <option value="NORMAL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">NORMAL (Thường)</option>
              <option value="LOW" className="bg-[#0F172A] text-slate-200 font-semibold py-1">LOW (Thấp)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-purple-400 font-bold">🛠️</span>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Mọi Chuyên Môn</option>
              <option value="DEV" className="bg-[#0F172A] text-slate-200 font-semibold py-1">DEV (Lập trình viên)</option>
              <option value="PRODUCT_OWNER" className="bg-[#0F172A] text-slate-200 font-semibold py-1">PRODUCT_OWNER (Quản lý)</option>
              <option value="TESTER" className="bg-[#0F172A] text-slate-200 font-semibold py-1">TESTER (Kiểm thử)</option>
              <option value="DESIGNER" className="bg-[#0F172A] text-slate-200 font-semibold py-1">DESIGNER (Thiết kế)</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};
