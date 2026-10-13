import React from 'react';
import {
  Users,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  Building2,
  Mail,
  Phone,
  Code2,
  KeyRound,
  Trash2,
  X,
  Loader2,
  Edit2,
  ArrowRightLeft,
  CheckSquare,
  Square,
  Lock,
  Unlock,
} from 'lucide-react';
import type { GlobalRole } from '../../types/auth';
import type { DirectoryUser } from '../../store/useUserStore';
import { getAvatarUrl } from '../../utils/avatar';

interface UsersTabContentProps {
  metrics: {
    total: number;
    managers: number;
    devs: number;
    allocated: number;
  };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  departmentOptions: string[];
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  selectedUserIds: string[];
  isAllFilteredSelected: boolean;
  handleToggleSelectAll: () => void;
  handleToggleSelectUser: (userId: string, e: React.MouseEvent) => void;
  handleClearSelection: () => void;
  handleOpenTransferBulk: () => void;
  isLoading: boolean;
  filteredUsers: DirectoryUser[];
  handleOpenProfile: (user: DirectoryUser) => void;
  handleOpenEditUser: (user: DirectoryUser) => void;
  setSelectedUserForLock: (user: DirectoryUser) => void;
  handleOpenTransferSingle: (user: DirectoryUser, e?: React.MouseEvent) => void;
  setSelectedUserForRole: (user: DirectoryUser) => void;
  handleResetPassword: (user: DirectoryUser) => void;
  setSelectedUserForDelete: (user: DirectoryUser) => void;
  getRoleBadge: (role: GlobalRole) => string;
}

export const UsersTabContent: React.FC<UsersTabContentProps> = ({
  metrics,
  searchQuery,
  setSearchQuery,
  selectedRole,
  setSelectedRole,
  selectedDepartment,
  setSelectedDepartment,
  departmentOptions,
  viewMode,
  setViewMode,
  selectedUserIds,
  isAllFilteredSelected,
  handleToggleSelectAll,
  handleToggleSelectUser,
  handleClearSelection,
  handleOpenTransferBulk,
  isLoading,
  filteredUsers,
  handleOpenProfile,
  handleOpenEditUser,
  setSelectedUserForLock,
  handleOpenTransferSingle,
  setSelectedUserForRole,
  handleResetPassword,
  setSelectedUserForDelete,
  getRoleBadge,
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng Nhân Sự</span>
            <span className="text-xl font-bold text-white font-mono">{metrics.total}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Cấp Quản Lý (PM)</span>
            <span className="text-xl font-bold text-purple-300 font-mono">{metrics.managers}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Lập Trình Viên (DEV)</span>
            <span className="text-xl font-bold text-cyan-300 font-mono">{metrics.devs}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã Phân Bổ Phòng Ban</span>
            <span className="text-xl font-bold text-amber-300 font-mono">{metrics.allocated}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, chức danh..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isAllFilteredSelected
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title={isAllFilteredSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả nhân sự đang lọc'}
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isAllFilteredSelected ? 'Bỏ Chọn Hết' : 'Chọn Tất Cả'}</span>
            </button>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả Vai trò</option>
              <option value="ADMIN">ADMIN (Quản trị viên)</option>
              <option value="MANAGER">MANAGER (Quản lý)</option>
              <option value="EMPLOYEE">EMPLOYEE (Nhân viên)</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-slate-700 cursor-pointer max-w-[180px] truncate"
            >
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  Phòng: {dept}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Chế độ Thẻ"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Chế độ Bảng"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {selectedUserIds.length > 0 && (
          <div className="p-3 px-4 rounded-xl bg-slate-900 border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-solar-drop-snap">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs">
                {selectedUserIds.length}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Đã chọn {selectedUserIds.length} nhân sự</span>
                <span className="text-[11px] text-slate-400">
                  Sẵn sàng thực hiện điều chuyển khối phòng ban hàng loạt
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSelection}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Bỏ Chọn
              </button>
              <button
                onClick={handleOpenTransferBulk}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Chuyển Khối Phòng Ban ({selectedUserIds.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-medium">Đang tải danh sách nhân sự từ máy chủ...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center solar-glass-card rounded-3xl bg-[#0F172A]/80 border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Không tìm thấy nhân sự phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ các bộ lọc.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const userAvatar = getAvatarUrl(user);
            const isSelected = selectedUserIds.includes(user.id);
            return (
              <div
                key={user.id}
                onClick={() => handleOpenProfile(user)}
                className={`solar-glass-card p-5 sm:p-6 rounded-3xl bg-[#0F172A]/90 border transition-all duration-300 space-y-4 relative group cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-[#0F172A] shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                    : 'border-slate-800 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectUser(user.id, e)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            : 'bg-slate-900/90 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-white'
                        }`}
                        title={isSelected ? 'Bỏ chọn' : 'Tích chọn nhân sự này'}
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>

                      <div className="relative shrink-0">
                        <img
                          src={userAvatar}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-amber-500/50 transition-all bg-slate-900"
                        />
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors truncate flex items-center gap-1.5">
                          {user.fullName}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">{user.jobTitle}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{user.department}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border shrink-0 ${getRoleBadge(
                        user.globalRole
                      )}`}
                    >
                      {user.globalRole}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border inline-block ${
                        user.isActive === true
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {user.isActive === true ? '● Hoạt động' : '■ Đã khóa'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditUser(user)}
                      className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors cursor-pointer"
                      title="Cập nhật thông tin nhân sự"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedUserForLock(user)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        user.isActive === true
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                      title={user.isActive === true ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {user.isActive === true ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleOpenTransferSingle(user, e)}
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
                      title="Điều chuyển phòng ban"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedUserForRole(user)}
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                      title="Phân quyền (RBAC)"
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleResetPassword(user)}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                      title="Cấp lại mật khẩu mặc định"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedUserForDelete(user)}
                      className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                      title="Xóa vĩnh viễn tài khoản"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="solar-glass-card rounded-3xl bg-[#0F172A]/90 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-3 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isAllFilteredSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-white'
                      }`}
                      title={isAllFilteredSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Nhân Sự</th>
                  <th className="py-3.5 px-4">Chức Danh / Khối</th>
                  <th className="py-3.5 px-4">Vai Trò (Role)</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {filteredUsers.map((user) => {
                  const userAvatar = getAvatarUrl(user);
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenProfile(user)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelectUser(user.id, e)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-slate-900/90 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={userAvatar}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900"
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-white group-hover:text-amber-300 block">
                              {user.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-white block">{user.jobTitle}</span>
                        <span className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getRoleBadge(
                            user.globalRole
                          )}`}
                        >
                          {user.globalRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border inline-block ${
                            user.isActive !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {user.isActive !== false ? '● Hoạt động' : '■ Đã khóa'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition-colors cursor-pointer"
                            title="Cập nhật thông tin nhân sự"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedUserForLock(user)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.isActive !== false
                                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300'
                            }`}
                            title={user.isActive !== false ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {user.isActive !== false ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleOpenTransferSingle(user, e)}
                            className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 transition-colors cursor-pointer"
                            title="Điều chuyển phòng ban"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedUserForRole(user)}
                            className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 transition-colors cursor-pointer"
                            title="Phân quyền"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition-colors cursor-pointer"
                            title="Cấp lại mật khẩu mặc định"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedUserForDelete(user)}
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn tài khoản"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
