import React from 'react';
import {
  Users,
  Edit2,
  Trash2,
  Building2,
  ArrowRightLeft,
  X,
  Loader2,
  KeyRound,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { GlobalRole, Profession } from '../../types/auth';
import type { DirectoryUser, DepartmentItem } from '../../store/useUserStore';
import { getAvatarUrl } from '../../utils/avatar';

interface AdminUserModalsProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (v: boolean) => void;
  newFullName: string;
  setNewFullName: (v: string) => void;
  newEmail: string;
  setNewEmail: (v: string) => void;
  newPhone: string;
  setNewPhone: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (v: boolean) => void;
  newJobTitle: string;
  setNewJobTitle: (v: string) => void;
  newDepartment: string;
  setNewDepartment: (v: string) => void;
  newProfession: Profession;
  setNewProfession: (v: Profession) => void;
  newRole: GlobalRole;
  setNewRole: (v: GlobalRole) => void;
  departmentOptions: string[];
  isSubmittingCreate: boolean;
  handleCreateUser: (e: React.FormEvent) => void;
  handleGenerateRandomPassword: () => void;

  editingUser: DirectoryUser | null;
  editFullName: string;
  setEditFullName: (v: string) => void;
  editPhone: string;
  setEditPhone: (v: string) => void;
  editJobTitle: string;
  setEditJobTitle: (v: string) => void;
  editProfession: Profession;
  setEditProfession: (v: Profession) => void;
  editDepartmentId: string;
  setEditDepartmentId: (v: string) => void;
  editBio: string;
  setEditBio: (v: string) => void;
  departments: DepartmentItem[];
  isSubmittingUpdate: boolean;
  handleUpdateUser: (e: React.FormEvent) => void;
  handleCloseEditUser: () => void;

  selectedUserForDelete: DirectoryUser | null;
  setSelectedUserForDelete: (v: DirectoryUser | null) => void;
  handleDeleteUser: (user: DirectoryUser) => void;
  actionLoadingId: string | null;

  isCreateDeptModalOpen: boolean;
  setIsCreateDeptModalOpen: (v: boolean) => void;
  editingDept: DepartmentItem | null;
  setEditingDept: (v: DepartmentItem | null) => void;
  deletingDept: DepartmentItem | null;
  setDeletingDept: (v: DepartmentItem | null) => void;
  deptName: string;
  setDeptName: (v: string) => void;
  deptCode: string;
  setDeptCode: (v: string) => void;
  deptDescription: string;
  setDeptDescription: (v: string) => void;
  isSubmittingDept: boolean;
  handleSubmitCreateDept: (e: React.FormEvent) => void;
  handleSubmitEditDept: (e: React.FormEvent) => void;
  handleConfirmDeleteDept: () => void;

  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (v: boolean) => void;
  transferUserList: DirectoryUser[];
  transferTargetDeptId: string;
  setTransferTargetDeptId: (v: string) => void;
  users: DirectoryUser[];
  isSubmittingTransfer: boolean;
  handleConfirmTransfer: (e: React.FormEvent) => void;
}

export const AdminUserModals: React.FC<AdminUserModalsProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  newFullName,
  setNewFullName,
  newEmail,
  setNewEmail,
  newPhone,
  setNewPhone,
  newPassword,
  setNewPassword,
  showNewPassword,
  setShowNewPassword,
  newJobTitle,
  setNewJobTitle,
  newDepartment,
  setNewDepartment,
  newProfession,
  setNewProfession,
  newRole,
  setNewRole,
  departmentOptions,
  isSubmittingCreate,
  handleCreateUser,
  handleGenerateRandomPassword,
  editingUser,
  editFullName,
  setEditFullName,
  editPhone,
  setEditPhone,
  editJobTitle,
  setEditJobTitle,
  editProfession,
  setEditProfession,
  editDepartmentId,
  setEditDepartmentId,
  editBio,
  setEditBio,
  departments,
  isSubmittingUpdate,
  handleUpdateUser,
  handleCloseEditUser,
  selectedUserForDelete,
  setSelectedUserForDelete,
  handleDeleteUser,
  actionLoadingId,
  isCreateDeptModalOpen,
  setIsCreateDeptModalOpen,
  editingDept,
  setEditingDept,
  deletingDept,
  setDeletingDept,
  deptName,
  setDeptName,
  deptCode,
  setDeptCode,
  deptDescription,
  setDeptDescription,
  isSubmittingDept,
  handleSubmitCreateDept,
  handleSubmitEditDept,
  handleConfirmDeleteDept,
  isTransferModalOpen,
  setIsTransferModalOpen,
  transferUserList,
  transferTargetDeptId,
  setTransferTargetDeptId,
  users,
  isSubmittingTransfer,
  handleConfirmTransfer,
}) => {
  return (
    <>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Khởi Tạo Tài Khoản Nhân Sự</h2>
                  <p className="text-xs text-slate-400">
                    Cấp tài khoản đăng nhập, mật khẩu ban đầu và phân bổ phòng ban
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Họ Và Tên *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="VD: Trần Văn Nam"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Email Doanh Nghiệp *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nam.tran@solaris.io"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <label className="text-amber-300 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Mật Khẩu Khởi Tạo Ban Đầu *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Tạo Ngẫu Nhiên
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu đăng nhập lần đầu"
                    className="w-full p-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Nhân sự sẽ được yêu cầu đổi mật khẩu và cập nhật hồ sơ tại lần đầu đăng nhập.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Chức Danh Công Việc</label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="VD: Senior Frontend Dev"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Phòng Ban</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {departmentOptions
                      .filter((d) => d !== 'Tất Cả')
                      .map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Chuyên Môn (Profession)</label>
                  <select
                    value={newProfession}
                    onChange={(e) => setNewProfession(e.target.value as Profession)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="DEV">DEV (Lập trình viên)</option>
                    <option value="TESTER">TESTER (Kiểm thử QA/QC)</option>
                    <option value="DESIGNER">DESIGNER (Thiết kế UI/UX)</option>
                    <option value="BA">BA (Phân tích nghiệp vụ)</option>
                    <option value="PRODUCT_OWNER">PRODUCT_OWNER (Quản trị sản phẩm)</option>
                    <option value="DEVOPS">DEVOPS (Vận hành hạ tầng)</option>
                    <option value="MARKETING">MARKETING (Truyền thông)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Phân Quyền (RBAC Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as GlobalRole)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Nhân viên tác nghiệp)</option>
                    <option value="MANAGER">MANAGER (Quản lý dự án)</option>
                    <option value="ADMIN">ADMIN (Quản trị tối cao)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingCreate && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác Nhận Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.18)] p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Cập Nhật Thông Tin Nhân Sự</h2>
                  <p className="text-xs text-slate-400">Chỉnh sửa hồ sơ của {editingUser.fullName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEditUser}
                disabled={isSubmittingUpdate}
                className="text-slate-400 hover:text-white p-1 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Họ Và Tên *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-500">Email không được cập nhật hiện tại.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Chức Danh Công Việc</label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    placeholder="VD: Senior Frontend Dev"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Chuyên Môn</label>
                  <select
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value as Profession)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="DEV">DEV (Lập trình viên)</option>
                    <option value="TESTER">TESTER (Kiểm thử QA/QC)</option>
                    <option value="DESIGNER">DESIGNER (Thiết kế UI/UX)</option>
                    <option value="BA">BA (Phân tích nghiệp vụ)</option>
                    <option value="PRODUCT_OWNER">PRODUCT_OWNER (Quản trị sản phẩm)</option>
                    <option value="DEVOPS">DEVOPS (Vận hành hạ tầng)</option>
                    <option value="MARKETING">MARKETING (Truyền thông)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Phòng Ban</label>
                <select
                  value={editDepartmentId}
                  onChange={(e) => setEditDepartmentId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Chưa phân bổ --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Giới Thiệu / Bio</label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Mô tả ngắn về nhân sự..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseEditUser}
                  disabled={isSubmittingUpdate}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer disabled:opacity-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUpdate}
                  className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-rose-500/50 p-6 space-y-5 relative animate-solar-warp-in text-center shadow-[0_0_60px_rgba(244,63,94,0.3)]">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Xác Nhận Xóa Vĩnh Viễn?</h3>
              <p className="text-xs text-slate-400">
                Thành viên: <span className="text-white font-bold">{selectedUserForDelete.fullName}</span> (
                {selectedUserForDelete.email})
              </p>
            </div>

            <p className="text-xs text-rose-300/90 bg-rose-950/40 p-3 rounded-2xl border border-rose-500/30 leading-relaxed">
              ⚠️ Xóa tài khoản
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSelectedUserForDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={actionLoadingId === selectedUserForDelete.id}
                onClick={() => handleDeleteUser(selectedUserForDelete)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoadingId === selectedUserForDelete.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Thêm Khối Phòng Ban Mới</h2>
                  <p className="text-xs text-slate-400">Khởi tạo phòng ban để phân nhóm và quản lý cơ cấu nhân sự</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateDeptModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateDept} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tên Khối / Phòng Ban *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="VD: Engineering & Architecture"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mã Phòng Ban (Code) *</label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  placeholder="VD: ENG, QA, UX, OPS..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono uppercase placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Mã định danh viết tắt, duy nhất trong hệ thống.</span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mô Tả Chức Năng</label>
                <textarea
                  rows={3}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Mô tả chức năng, nhiệm vụ chính của phòng ban..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateDeptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDept}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingDept && <Loader2 className="w-4 h-4 animate-spin" />}
                  Khởi Tạo Phòng Ban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Chỉnh Sửa Phòng Ban</h2>
                  <p className="text-xs text-slate-400">Cập nhật thông tin chi tiết của khối phòng ban</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDept(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditDept} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tên Khối / Phòng Ban *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="VD: Engineering & Architecture"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mã Phòng Ban *</label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  placeholder="VD: ENG, QA, UX, OPS..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono uppercase placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mô Tả Chức Năng</label>
                <textarea
                  rows={3}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Mô tả chức năng, nhiệm vụ chính của phòng ban..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDept}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingDept && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-rose-500/50 p-6 space-y-5 relative animate-solar-warp-in text-center shadow-[0_0_60px_rgba(244,63,94,0.3)]">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Xác Nhận Giải Thể / Xóa Phòng Ban?</h3>
              <p className="text-xs text-slate-400">
                Phòng ban: <span className="text-white font-bold">{deletingDept.name}</span> ({deletingDept.code})
              </p>
            </div>

            <p className="text-xs text-rose-300/90 bg-rose-950/40 p-3 rounded-2xl border border-rose-500/30 leading-relaxed">
              ⚠️ Khi xóa phòng ban, các nhân sự thuộc phòng ban này sẽ được tự động chuyển về trạng thái &quot;Chưa phân
              bổ&quot;. Dữ liệu nhân sự và các task liên quan vẫn được bảo toàn nguyên vẹn.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingDept(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={isSubmittingDept}
                onClick={handleConfirmDeleteDept}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingDept ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    Điều Chuyển Khối Phòng Ban
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono font-bold border border-amber-500/30">
                      {transferUserList.length} Nhân Sự
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Chuyển nhân sự sang khối phòng ban mới để tái cấu trúc đội ngũ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span>Danh Sách Nhân Sự Được Điều Chuyển ({transferUserList.length}):</span>
                </label>
                <div className="max-h-40 overflow-y-auto p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 divide-y divide-slate-800/60">
                  {transferUserList.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-3 pt-2 first:pt-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={getAvatarUrl(u)}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-xl object-cover bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-white block truncate">{u.fullName}</span>
                          <span className="text-[10px] text-slate-400 truncate block">{u.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700">
                          Hiện tại: {u.department || 'Chưa phân bổ'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" /> Chọn Khối Phòng Ban Tiếp Nhận *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                  {departments.map((dept) => {
                    const isTarget = transferTargetDeptId === dept.id;
                    const membersCount = users.filter((u) => u.department === dept.name).length;
                    return (
                      <div
                        key={dept.id}
                        onClick={() => setTransferTargetDeptId(dept.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isTarget
                            ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 border ${
                              isTarget
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {dept.code}
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`font-bold block truncate text-xs ${
                                isTarget ? 'text-amber-300' : 'text-white'
                              }`}
                            >
                              {dept.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {dept.totalMembers !== undefined ? dept.totalMembers : membersCount} nhân sự
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isTarget
                                ? 'border-amber-400 bg-amber-400 text-slate-950'
                                : 'border-slate-600 bg-transparent'
                            }`}
                          >
                            {isTarget && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTransfer || !transferTargetDeptId}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingTransfer && <Loader2 className="w-4 h-4 animate-spin" />}
                  <ArrowRightLeft className="w-4 h-4" />
                  Xác Nhận Điều Chuyển
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
