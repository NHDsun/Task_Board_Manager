import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Building2,
  Sparkles,
  Lock,
  Unlock,
  Loader2,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import type { GlobalRole, Profession } from '../types/auth';
import { UserProfileModal, type UserProfileData } from '../components/common/UserProfileModal';
import { useUserStore, type DirectoryUser, type DepartmentItem } from '../store/useUserStore';
import { getAvatarUrl } from '../utils/avatar';
import { api } from '../services/api';
import { DepartmentsTabContent } from '../components/admin/DepartmentsTabContent';
import { AdminUserModals } from '../components/admin/AdminUserModals';
import { UsersTabContent } from '../components/admin/UsersTabContent';

export const AdminUsersPage: React.FC = () => {
  const users = useUserStore((state) => state.users);
  const isLoading = useUserStore((state) => state.isLoading);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const deleteUser = useUserStore((state) => state.deleteUser);

  const departments = useUserStore((state) => state.departments);
  const isLoadingDepartments = useUserStore((state) => state.isLoadingDepartments);
  const fetchDepartments = useUserStore((state) => state.fetchDepartments);
  const createDepartment = useUserStore((state) => state.createDepartment);
  const updateDepartment = useUserStore((state) => state.updateDepartment);
  const deleteDepartment = useUserStore((state) => state.deleteDepartment);
  const transferUsersDepartment = useUserStore((state) => state.transferUsersDepartment);

  const [activeMainTab, setActiveMainTab] = useState<'users' | 'departments'>('users');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetDeptId, setTransferTargetDeptId] = useState<string>('');
  const [transferUserList, setTransferUserList] = useState<DirectoryUser[]>([]);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Tất Cả');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [deptSearchQuery, setDeptSearchQuery] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfileData | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<DirectoryUser | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<DirectoryUser | null>(null);
  const [selectedUserForLock, setSelectedUserForLock] = useState<DirectoryUser | null>(null);

  const [editingUser, setEditingUser] = useState<DirectoryUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editProfession, setEditProfession] = useState<Profession>('DEV');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  const [isCreateDeptModalOpen, setIsCreateDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);

  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDescription, setDeptDescription] = useState('');

  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newProfession, setNewProfession] = useState<Profession>('DEV');
  const [newRole, setNewRole] = useState<GlobalRole>('EMPLOYEE');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setShowNewPassword(true);
  };

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
    departments.forEach((d) => {
      if (!unique.includes(d.name)) unique.push(d.name);
    });
    return ['Tất Cả', ...unique];
  }, [users, departments]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.jobTitle.toLowerCase().includes(q);
      const matchRole = selectedRole === 'ALL' || u.globalRole === selectedRole;
      const matchDept = selectedDepartment === 'Tất Cả' || u.department === selectedDepartment;
      return matchSearch && matchRole && matchDept;
    });
  }, [users, searchQuery, selectedRole, selectedDepartment]);

  const filteredDepartments = useMemo(() => {
    const q = deptSearchQuery.toLowerCase().trim();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [departments, deptSearchQuery]);

  const isAllFilteredSelected = useMemo(() => {
    if (filteredUsers.length === 0) return false;
    return filteredUsers.every((u) => selectedUserIds.includes(u.id));
  }, [filteredUsers, selectedUserIds]);

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = Array.from(new Set([...selectedUserIds, ...filteredUsers.map((u) => u.id)]));
      setSelectedUserIds(newIds);
    }
  };

  const handleToggleSelectUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  const metrics = useMemo(() => {
    const total = users.length;
    const managers = users.filter((u) => u.globalRole === 'MANAGER').length;
    const devs = users.filter((u) => u.profession === 'DEV').length;
    const allocated = users.filter((u) => u.department && u.department !== 'Chưa phân bổ').length;
    return { total, managers, devs, allocated };
  }, [users]);

  const handleOpenProfile = (user: DirectoryUser) => {
    setSelectedProfileUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: getAvatarUrl(user),
      avatar: getAvatarUrl(user),
      jobTitle: user.jobTitle,
      department: user.department,
      globalRole: user.globalRole,
      statusSignal: user.statusSignal || 'ONLINE',
      phone: user.phone,
      bio: user.bio,
      workMode: user.workMode,
      projectsCount: user.projectsCount,
    });
  };

  const handleOpenEditUser = (user: DirectoryUser) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditPhone(user.phone || '');
    setEditJobTitle(user.jobTitle || '');
    setEditProfession((user.profession as Profession) || 'DEV');
    const currentDeptObj = departments.find((d) => d.name === user.department);
    setEditDepartmentId(currentDeptObj ? currentDeptObj.id : '');
    setEditBio(user.bio || '');
  };

  const handleCloseEditUser = () => {
    setEditingUser(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmittingUpdate(true);
    try {
      await api.patch(`/profile/admin/users/${editingUser.id}`, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        jobTitle: editJobTitle.trim(),
        profession: editProfession,
        departmentId: editDepartmentId || null,
        bio: editBio.trim(),
      });
      showToast(`✅ Đã cập nhật thông tin nhân sự "${editFullName.trim()}" thành công!`);
      handleCloseEditUser();
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleToggleLockUser = async (user: DirectoryUser) => {
    const isCurrentlyActive = user.isActive !== false;
    setActionLoadingId(user.id);
    try {
      const res = await api.patch(`/profile/admin/users/${user.id}/status`, {
        isActive: !isCurrentlyActive,
      });
      const updatedUser = res.data?.data || res.data;
      showToast(
        updatedUser.isActive
          ? `🔓 Đã mở khóa tài khoản cho "${user.fullName}" thành công!`
          : `🔒 Đã khóa tài khoản của "${user.fullName}"!`
      );
      setSelectedUserForLock(null);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác khóa/mở khóa thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: GlobalRole) => {
    setActionLoadingId(userId);
    try {
      await api.patch(`/profile/admin/users/${userId}/role`, { globalRole: newRole });
      showToast(`✅ Đã nâng cấp vai trò RBAC thành "${newRole}" thành công!`);
      setSelectedUserForRole(null);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Nâng cấp quyền thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetPassword = async (user: DirectoryUser) => {
    if (!window.confirm(`Bạn có chắc chắn muốn cấp lại mật khẩu mặc định (Solaris@123) cho "${user.fullName}"?`)) {
      return;
    }
    setActionLoadingId(user.id);
    try {
      await api.post(`/profile/admin/users/${user.id}/reset-password`, {});
      showToast(`🔑 Đã cấp lại mật khẩu mặc định Solaris@123 cho "${user.fullName}"!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset mật khẩu thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (user: DirectoryUser) => {
    setActionLoadingId(user.id);
    try {
      await deleteUser(user.id);
      showToast(`🗑️ Đã chuyển tài khoản "${user.fullName}" vào Thùng rác hệ thống!`);
      setSelectedUserForDelete(null);
      setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showToast('⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const matchedDept = departments.find((d) => d.name === newDepartment);
      await api.post('/profile/admin/users', {
        fullName: newFullName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword.trim(),
        phone: newPhone.trim() || undefined,
        jobTitle: newJobTitle.trim() || 'Software Specialist',
        departmentId: matchedDept ? matchedDept.id : undefined,
        departmentName: !matchedDept ? newDepartment : undefined,
        profession: newProfession,
        globalRole: newRole,
      });

      showToast(`🎉 Đã khởi tạo thành công tài khoản cho "${newFullName}"!`);
      setIsCreateModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewJobTitle('');
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo tài khoản';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleOpenCreateDept = () => {
    setDeptName('');
    setDeptCode('');
    setDeptDescription('');
    setIsCreateDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDescription(dept.description || '');
  };

  const handleSubmitCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      showToast('⚠️ Vui lòng nhập Tên và Mã phòng ban!');
      return;
    }

    setIsSubmittingDept(true);
    try {
      await createDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        description: deptDescription.trim() || undefined,
      });
      showToast(`🏢 Đã khởi tạo thành công khối phòng ban "${deptName.trim()}"!`);
      setIsCreateDeptModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo phòng ban';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleSubmitEditDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !deptName.trim() || !deptCode.trim()) return;

    setIsSubmittingDept(true);
    try {
      await updateDepartment(editingDept.id, {
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        description: deptDescription.trim() || undefined,
      });
      showToast(`🏢 Đã cập nhật khối phòng ban "${deptName.trim()}"!`);
      setEditingDept(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật phòng ban thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleConfirmDeleteDept = async () => {
    if (!deletingDept) return;
    setIsSubmittingDept(true);
    try {
      await deleteDepartment(deletingDept.id);
      showToast(`🗑️ Đã giải thể phòng ban "${deletingDept.name}"!`);
      setDeletingDept(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giải thể phòng ban thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleOpenTransferSingle = (user: DirectoryUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTransferUserList([user]);
    setTransferTargetDeptId('');
    setIsTransferModalOpen(true);
  };

  const handleOpenTransferBulk = () => {
    if (selectedUserIds.length === 0) return;
    const selected = users.filter((u) => selectedUserIds.includes(u.id));
    setTransferUserList(selected);
    setTransferTargetDeptId('');
    setIsTransferModalOpen(true);
  };

  const handleOpenTransferToDept = (targetDept: DepartmentItem) => {
    if (selectedUserIds.length > 0) {
      const selected = users.filter((u) => selectedUserIds.includes(u.id));
      setTransferUserList(selected);
      setTransferTargetDeptId(targetDept.id);
      setIsTransferModalOpen(true);
    } else {
      setActiveMainTab('users');
      showToast(`👉 Hãy tích chọn các nhân sự cần chuyển rồi bấm [Chuyển Đến: ${targetDept.name}]!`);
    }
  };

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetDeptId) {
      showToast('⚠️ Vui lòng chọn khối phòng ban tiếp nhận!');
      return;
    }
    const targetDept = departments.find((d) => d.id === transferTargetDeptId);
    if (!targetDept) {
      showToast('⚠️ Không tìm thấy phòng ban đích!');
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      await transferUsersDepartment(
        transferUserList.map((u) => u.id),
        transferTargetDeptId
      );
      setIsTransferModalOpen(false);
      setSelectedUserIds([]);
      showToast(`✅ Đã điều chuyển ${transferUserList.length} nhân sự sang phòng ban "${targetDept.name}" thành công!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Điều chuyển nhân sự thất bại';
      showToast(`❌ Lỗi: ${msg}`);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const getRoleBadge = (role: GlobalRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      case 'MANAGER':
        return 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40';
      case 'EMPLOYEE':
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in relative pb-16">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-white text-xs font-bold shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl flex items-center gap-2 animate-solar-drop-snap">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              {activeMainTab === 'users' ? <Users className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Quản Trị Tổ Chức &amp; Nhân Sự
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  ADMIN ONLY
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Quản trị tài khoản, phân quyền RBAC và điều phối cơ cấu phòng ban
              </p>
            </div>
          </div>
        </div>

        {activeMainTab === 'users' ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm Nhân Sự Mới
          </button>
        ) : (
          <button
            onClick={handleOpenCreateDept}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm Phòng Ban Mới
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveMainTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'users' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Danh Bạ Nhân Sự ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveMainTab('departments')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'departments' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Khối Phòng Ban ({departments.length})</span>
        </button>
      </div>

      {activeMainTab === 'users' && (
        <UsersTabContent
          metrics={metrics}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          departmentOptions={departmentOptions}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedUserIds={selectedUserIds}
          isAllFilteredSelected={isAllFilteredSelected}
          handleToggleSelectAll={handleToggleSelectAll}
          handleToggleSelectUser={handleToggleSelectUser}
          handleClearSelection={handleClearSelection}
          handleOpenTransferBulk={handleOpenTransferBulk}
          isLoading={isLoading}
          filteredUsers={filteredUsers}
          handleOpenProfile={handleOpenProfile}
          handleOpenEditUser={handleOpenEditUser}
          setSelectedUserForLock={setSelectedUserForLock}
          handleOpenTransferSingle={handleOpenTransferSingle}
          setSelectedUserForRole={setSelectedUserForRole}
          handleResetPassword={handleResetPassword}
          setSelectedUserForDelete={setSelectedUserForDelete}
          getRoleBadge={getRoleBadge}
        />
      )}

      {activeMainTab === 'departments' && (
        <DepartmentsTabContent
          departments={departments}
          filteredDepartments={filteredDepartments}
          users={users}
          isLoadingDepartments={isLoadingDepartments}
          deptSearchQuery={deptSearchQuery}
          setDeptSearchQuery={setDeptSearchQuery}
          onOpenCreateDept={handleOpenCreateDept}
          onOpenEditDept={handleOpenEditDept}
          onOpenDeleteDept={setDeletingDept}
          onOpenTransferToDept={handleOpenTransferToDept}
        />
      )}

      <UserProfileModal
        user={selectedProfileUser}
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        onSendMessage={(u) => showToast(`💬 Đang mở hộp thoại chat với ${u.fullName}...`)}
      />

      {selectedUserForLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 p-6 space-y-5 relative animate-solar-warp-in text-center shadow-xl">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto ${
                selectedUserForLock.isActive !== false
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {selectedUserForLock.isActive !== false ? <Lock className="w-7 h-7" /> : <Unlock className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">
                {selectedUserForLock.isActive !== false ? 'Xác Nhận Khóa Tài Khoản?' : 'Xác Nhận Mở Khóa Tài Khoản?'}
              </h3>
              <p className="text-xs text-slate-400">
                Nhân sự: <span className="text-white font-bold">{selectedUserForLock.fullName}</span>
              </p>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              {selectedUserForLock.isActive !== false
                ? '⚠️ Sau khi khóa, tài khoản này sẽ tạm thời không thể đăng nhập vào hệ thống Task Board.'
                : '✅ Sau khi mở khóa, tài khoản này có thể truy cập và làm việc bình thường trở lại.'}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSelectedUserForLock(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={actionLoadingId === selectedUserForLock.id}
                onClick={() => handleToggleLockUser(selectedUserForLock)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 text-slate-950 ${
                  selectedUserForLock.isActive !== false
                    ? 'bg-amber-500 hover:bg-amber-400'
                    : 'bg-emerald-400 hover:bg-emerald-300'
                }`}
              >
                {actionLoadingId === selectedUserForLock.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {selectedUserForLock.isActive !== false ? 'Xác Nhận Khóa' : 'Xác Nhận Mở Khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-purple-500/40 p-6 space-y-5 relative animate-solar-warp-in">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Điều Chỉnh Vai Trò Phân Quyền</h3>
                <p className="text-xs text-slate-400">{selectedUserForRole.fullName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Chọn cấp độ đặc quyền mới cho nhân sự. Lưu ý: Cấp quyền{' '}
              <span className="text-rose-400 font-bold">ADMIN</span> sẽ cho phép người dùng truy cập toàn bộ dữ liệu và
              Thùng rác hệ thống.
            </p>

            <div className="space-y-2 text-xs">
              {(['EMPLOYEE', 'MANAGER', 'ADMIN'] as GlobalRole[]).map((r) => (
                <button
                  key={r}
                  disabled={actionLoadingId === selectedUserForRole.id}
                  onClick={() => handleUpdateRole(selectedUserForRole.id, r)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 ${
                    selectedUserForRole.globalRole === r
                      ? 'bg-purple-500/20 border-purple-400 text-white font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    {r === 'ADMIN' && 'ADMIN — Toàn quyền Quản trị tối cao'}
                    {r === 'MANAGER' && 'MANAGER — Quản lý Dự án & Duyệt bài'}
                    {r === 'EMPLOYEE' && 'EMPLOYEE — Nhân viên tác nghiệp'}
                  </span>
                  {selectedUserForRole.globalRole === r && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </button>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminUserModals
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        newFullName={newFullName}
        setNewFullName={setNewFullName}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newPhone={newPhone}
        setNewPhone={setNewPhone}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        newJobTitle={newJobTitle}
        setNewJobTitle={setNewJobTitle}
        newDepartment={newDepartment}
        setNewDepartment={setNewDepartment}
        newProfession={newProfession}
        setNewProfession={setNewProfession}
        newRole={newRole}
        setNewRole={setNewRole}
        departmentOptions={departmentOptions}
        isSubmittingCreate={isSubmittingCreate}
        handleCreateUser={handleCreateUser}
        handleGenerateRandomPassword={handleGenerateRandomPassword}
        editingUser={editingUser}
        editFullName={editFullName}
        setEditFullName={setEditFullName}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editJobTitle={editJobTitle}
        setEditJobTitle={setEditJobTitle}
        editProfession={editProfession}
        setEditProfession={setEditProfession}
        editDepartmentId={editDepartmentId}
        setEditDepartmentId={setEditDepartmentId}
        editBio={editBio}
        setEditBio={setEditBio}
        departments={departments}
        isSubmittingUpdate={isSubmittingUpdate}
        handleUpdateUser={handleUpdateUser}
        handleCloseEditUser={handleCloseEditUser}
        selectedUserForDelete={selectedUserForDelete}
        setSelectedUserForDelete={setSelectedUserForDelete}
        handleDeleteUser={handleDeleteUser}
        actionLoadingId={actionLoadingId}
        isCreateDeptModalOpen={isCreateDeptModalOpen}
        setIsCreateDeptModalOpen={setIsCreateDeptModalOpen}
        editingDept={editingDept}
        setEditingDept={setEditingDept}
        deletingDept={deletingDept}
        setDeletingDept={setDeletingDept}
        deptName={deptName}
        setDeptName={setDeptName}
        deptCode={deptCode}
        setDeptCode={setDeptCode}
        deptDescription={deptDescription}
        setDeptDescription={setDeptDescription}
        isSubmittingDept={isSubmittingDept}
        handleSubmitCreateDept={handleSubmitCreateDept}
        handleSubmitEditDept={handleSubmitEditDept}
        handleConfirmDeleteDept={handleConfirmDeleteDept}
        isTransferModalOpen={isTransferModalOpen}
        setIsTransferModalOpen={setIsTransferModalOpen}
        transferUserList={transferUserList}
        transferTargetDeptId={transferTargetDeptId}
        setTransferTargetDeptId={setTransferTargetDeptId}
        users={users}
        isSubmittingTransfer={isSubmittingTransfer}
        handleConfirmTransfer={handleConfirmTransfer}
      />
    </div>
  );
};
