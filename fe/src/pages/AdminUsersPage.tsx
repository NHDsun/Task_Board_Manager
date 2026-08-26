import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  Building2,
  Mail,
  Phone,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  UserCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { GlobalRole, Profession, UserStatusSignal } from '../types/auth';
import { UserProfileModal, type UserProfileData } from '../components/common/UserProfileModal';
import { useUserStore, type DirectoryUser } from '../store/useUserStore';
import { DEFAULT_AVATAR, getAvatarUrl } from '../utils/avatar';

const DEPARTMENTS = ['Tất Cả', 'Engineering', 'Product & Planning', 'Design & UX', 'QA & Testing', 'Operations & SRE'];

export const AdminUsersPage: React.FC = () => {
  const users = useUserStore((state) => state.users);
  const addUser = useUserStore((state) => state.addUser);
  const updateDirectoryUser = useUserStore((state) => state.updateDirectoryUser);
  const deleteUser = useUserStore((state) => state.deleteUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Tất Cả');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfileData | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<DirectoryUser | null>(null);
  const [selectedUserForLock, setSelectedUserForLock] = useState<DirectoryUser | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<DirectoryUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for New User
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Solaris@2026');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newProfession, setNewProfession] = useState<Profession>('DEV');
  const [newRole, setNewRole] = useState<GlobalRole>('EMPLOYEE');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Sol@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    showToast(`🔑 Đã tạo mật khẩu ngẫu nhiên: ${pass}`);
  };

  // 🔍 Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = selectedRole === 'ALL' || u.globalRole === selectedRole;
      const matchDept = selectedDepartment === 'Tất Cả' || u.department === selectedDepartment;
      const matchStatus = selectedStatus === 'ALL' || u.statusSignal === selectedStatus;

      return matchQuery && matchRole && matchDept && matchStatus;
    });
  }, [users, searchQuery, selectedRole, selectedDepartment, selectedStatus]);

  // 📊 KPI Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const online = users.filter((u) => u.statusSignal === 'ONLINE' || u.statusSignal === 'BUSY').length;
    const managers = users.filter((u) => u.globalRole === 'MANAGER').length;
    const active = users.filter((u) => u.isActive).length;
    return { total, online, managers, active };
  }, [users]);

  // 🛠️ Action Handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showToast('⚠️ Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu khởi tạo!');
      return;
    }

    const newUser: DirectoryUser = {
      id: `u-${Date.now()}`,
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '0900 000 000',
      avatarUrl: DEFAULT_AVATAR,
      avatar: DEFAULT_AVATAR,
      globalRole: newRole,
      profession: newProfession,
      jobTitle: newJobTitle.trim() || 'Software Engineer',
      department: newDepartment,
      statusSignal: 'ONLINE',
      isActive: true,
      joinedDate: new Date().toLocaleDateString('vi-VN'),
      projectsCount: 1,
      tasksCount: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
      workMode: 'OFFICE',
    };

    addUser(newUser);
    setIsCreateModalOpen(false);
    showToast(`✅ Đã khởi tạo nhân sự mới: ${newUser.fullName} (Mật khẩu: ${newPassword})`);

    // Reset Form
    setNewFullName('');
    setNewEmail('');
    setNewPassword('Solaris@2026');
    setNewPhone('');
    setNewJobTitle('');
  };

  const handleOpenProfile = (u: DirectoryUser) => {
    setSelectedProfileUser({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      avatarUrl: getAvatarUrl(u),
      avatar: getAvatarUrl(u),
      globalRole: u.globalRole,
      profession: u.profession,
      jobTitle: u.jobTitle,
      department: u.department,
      statusSignal: u.statusSignal,
      joinedDate: u.joinedDate,
      projectsCount: u.projectsCount,
      tasksCount: u.tasksCount,
      bio: u.bio || `Chuyên gia ${u.jobTitle} phụ trách các giải pháp phân hệ ${u.department} tại Solaris Platform.`,
      workMode: u.workMode || 'OFFICE',
    });
  };

  const handleUpdateRole = (userId: string, newRoleValue: GlobalRole) => {
    updateDirectoryUser(userId, { globalRole: newRoleValue });
    setSelectedUserForRole(null);
    showToast(`✅ Đã cập nhật vai trò phân quyền thành công!`);
  };

  const handleToggleLock = (user: DirectoryUser) => {
    updateDirectoryUser(user.id, { isActive: !user.isActive });
    setSelectedUserForLock(null);
    showToast(`✅ Đã cập nhật trạng thái hoạt động của tài khoản!`);
  };

  const handleDeleteUser = (user: DirectoryUser) => {
    deleteUser(user.id);
    setSelectedUserForDelete(null);
    showToast(`🗑️ Đã xóa vĩnh viễn tài khoản nhân sự: ${user.fullName}`);
  };

  const handleResetPassword = (u: DirectoryUser) => {
    showToast(`🔑 Đã cấp lại mật khẩu mặc định (Solaris@2026) cho ${u.fullName}!`);
  };

  // Helper Badge Colors
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

  const getStatusSignalDot = (signal: UserStatusSignal) => {
    switch (signal) {
      case 'ONLINE':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
      case 'BUSY':
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
      case 'IN_MEETING':
        return 'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse';
      case 'AWAY':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
      case 'OFFLINE':
        return 'bg-slate-500';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in relative">
      {/* 🍞 Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-white text-xs font-bold shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl flex items-center gap-2 animate-solar-drop-snap">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 🌟 Header Banner */}
      <div className="solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/90 border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Trung Tâm Quản Lý Nhân Sự
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                  ADMIN ONLY
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Khu vực đặc quyền dành cho Admin: Khởi tạo tài khoản, phân quyền RBAC và quản lý tiến độ task đúng hạn/trễ hạn.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="relative z-10 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all cursor-pointer transform hover:-translate-y-0.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm Nhân Sự Mới
        </button>
      </div>

      {/* 📊 KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng Nhân Sự</span>
            <span className="text-2xl font-black text-white font-mono">{metrics.total}</span>
          </div>
        </div>

        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang Trực Tuyến</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{metrics.online}</span>
          </div>
        </div>

        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Cấp Quản Lý (PM)</span>
            <span className="text-2xl font-black text-purple-300 font-mono">{metrics.managers}</span>
          </div>
        </div>

        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tài Khoản Hoạt Động</span>
            <span className="text-2xl font-black text-amber-300 font-mono">{metrics.active}</span>
          </div>
        </div>
      </div>

      {/* 🔍 Smart Toolbar & Filter Cluster */}
      <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, chức danh..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL">Tất cả Vai trò</option>
            <option value="ADMIN">ADMIN (Quản trị viên)</option>
            <option value="MANAGER">MANAGER (Quản lý)</option>
            <option value="EMPLOYEE">EMPLOYEE (Nhân viên)</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                Phòng: {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="ONLINE">Trực tuyến (Online)</option>
            <option value="BUSY">Bận việc (Busy)</option>
            <option value="IN_MEETING">Đang họp (Meeting)</option>
            <option value="AWAY">Vắng mặt (Away)</option>
            <option value="OFFLINE">Ngoại tuyến (Offline)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Thẻ Bento"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Bảng Doanh Nghiệp"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 🎴 VIEW 1: BENTO CARD GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const onTime = Math.max(0, user.tasksCount.completed - user.tasksCount.overdue);
            const userAvatar = getAvatarUrl(user);

            return (
              <div
                key={user.id}
                onClick={() => handleOpenProfile(user)}
                className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/90 border border-slate-800/80 hover:border-amber-500/60 shadow-xl space-y-5 transition-all duration-200 group relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              >
                {/* Active Indicator Top Stripe */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4">
                  {/* Avatar + Role Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={userAvatar}
                          alt={user.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-amber-400/80 transition-colors shadow-md"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0F172A] ${getStatusSignalDot(
                            user.statusSignal
                          )}`}
                          title={`Trạng thái: ${user.statusSignal}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base text-white group-hover:text-amber-300 transition-colors truncate">
                          {user.fullName}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">{user.jobTitle}</p>
                        <span className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {user.department}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider border shrink-0 ${getRoleBadge(
                        user.globalRole
                      )}`}
                    >
                      {user.globalRole}
                    </span>
                  </div>

                  {/* Contact Snippets */}
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* 🎯 ON-TIME vs OVERDUE TASK METRICS */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/70 p-3 rounded-2xl border border-slate-800 text-center font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> Đang Làm
                      </span>
                      <span className="font-extrabold text-amber-300 text-xs">{user.tasksCount.inProgress}</span>
                    </div>

                    <div className="space-y-0.5 border-x border-slate-800">
                      <span className="text-[10px] text-emerald-400 block font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Đúng Hạn
                      </span>
                      <span className="font-extrabold text-emerald-300 text-xs">{onTime}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-rose-400 block font-bold flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> Trễ Hạn
                      </span>
                      <span className="font-extrabold text-rose-400 text-xs">{user.tasksCount.overdue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div
                  className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleOpenProfile(user)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:text-amber-300"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> Xem Hồ Sơ
                  </button>

                  <button
                    onClick={() => setSelectedUserForRole(user)}
                    className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                    title="Đổi vai trò phân quyền"
                  >
                    <Shield className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleResetPassword(user)}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                    title="Cấp lại mật khẩu mặc định"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedUserForLock(user)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      user.isActive
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                    title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  >
                    {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  {!user.isActive && (
                    <button
                      onClick={() => setSelectedUserForDelete(user)}
                      className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-solar-drop-snap"
                      title="Xóa vĩnh viễn tài khoản"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📋 VIEW 2: ENTERPRISE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="solar-glass-card rounded-3xl bg-[#0F172A]/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0A0F1D] text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">Nhân Sự</th>
                  <th className="py-4 px-4">Chức Danh &amp; Phòng Ban</th>
                  <th className="py-4 px-4">Vai Trò (RBAC)</th>
                  <th className="py-4 px-4">Trực Tuyến</th>
                  <th className="py-4 px-4">Đúng Hạn / Trễ Hạn</th>
                  <th className="py-4 px-4">Trạng Thái</th>
                  <th className="py-4 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredUsers.map((user) => {
                  const onTime = Math.max(0, user.tasksCount.completed - user.tasksCount.overdue);
                  const userAvatar = getAvatarUrl(user);

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenProfile(user)}
                      className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={userAvatar}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 group-hover:border-amber-400 transition-colors"
                          />
                          <div>
                            <span className="font-extrabold text-white font-sans block group-hover:text-amber-300 transition-colors">
                              {user.fullName}
                            </span>
                            <span className="text-[10px] text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-200 font-sans font-medium block">{user.jobTitle}</span>
                        <span className="text-[10px] text-amber-400/80">{user.department}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border inline-block ${getRoleBadge(
                            user.globalRole
                          )}`}
                        >
                          {user.globalRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className={`w-2.5 h-2.5 rounded-full ${getStatusSignalDot(user.statusSignal)}`} />
                          <span className="text-slate-300">{user.statusSignal}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            ✓ {onTime} Đúng hạn
                          </span>
                          {user.tasksCount.overdue > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                              ⚠ {user.tasksCount.overdue} Trễ
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {user.isActive ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                            Hoạt Động
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                            Đã Khóa
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenProfile(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 text-amber-400" />
                          </button>
                          <button
                            onClick={() => setSelectedUserForRole(user)}
                            className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 transition-colors cursor-pointer"
                            title="Phân quyền"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedUserForLock(user)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors cursor-pointer"
                            title="Khóa / Mở"
                          >
                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          {!user.isActive && (
                            <button
                              onClick={() => setSelectedUserForDelete(user)}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                              title="Xóa vĩnh viễn tài khoản"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" />
                            </button>
                          )}
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

      {/* 🌟 UNIVERSAL USER PROFILE MODAL */}
      <UserProfileModal
        user={selectedProfileUser}
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        onSendMessage={(u) => showToast(`💬 Đang mở hộp thoại chat với ${u.fullName}...`)}
      />

      {/* 🚀 MODAL 1: CREATE NEW USER MODAL (WITH PASSWORD FIELD & GENERATOR) */}
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
                  <p className="text-xs text-slate-400">Cấp tài khoản đăng nhập, mật khẩu ban đầu và phân bổ phòng ban</p>
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

              {/* 🔑 MẬT KHẨU KHỞI TẠO BAN ĐẦU */}
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
                    {DEPARTMENTS.filter((d) => d !== 'Tất Cả').map((dept) => (
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all"
                >
                  Xác Nhận Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛡️ MODAL 2: EDIT ROLE ELEVATION MODAL */}
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
              Chọn cấp độ đặc quyền mới cho nhân sự. Lưu ý: Cấp quyền <span className="text-rose-400 font-bold">ADMIN</span> sẽ cho phép người dùng truy cập toàn bộ CSDL và Thùng rác hệ thống.
            </p>

            <div className="space-y-2 text-xs">
              {(['EMPLOYEE', 'MANAGER', 'ADMIN'] as GlobalRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleUpdateRole(selectedUserForRole.id, r)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
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

      {/* 🔒 MODAL 3: LOCK / UNLOCK USER MODAL */}
      {selectedUserForLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-rose-500/40 p-6 space-y-5 relative animate-solar-warp-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">
                {selectedUserForLock.isActive ? 'Xác Nhận Khóa Tài Khoản?' : 'Xác Nhận Mở Khóa Tài Khoản?'}
              </h3>
              <p className="text-xs text-slate-400">
                Nhân sự: <span className="text-white font-bold">{selectedUserForLock.fullName}</span> ({selectedUserForLock.email})
              </p>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              {selectedUserForLock.isActive
                ? 'Khi bị khóa, nhân viên sẽ lập tức bị hủy phiên đăng nhập và không thể truy cập vào bất kỳ dự án nào.'
                : 'Mở khóa sẽ khôi phục toàn bộ quyền truy cập và các task đang phụ trách của nhân viên.'}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedUserForLock(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={() => handleToggleLock(selectedUserForLock)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer ${
                  selectedUserForLock.isActive
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg'
                }`}
              >
                {selectedUserForLock.isActive ? 'Khóa Ngay' : 'Mở Khóa Ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL 4: PERMANENT DELETE USER MODAL (ONLY WHEN LOCKED) */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-rose-500/50 p-6 space-y-5 relative animate-solar-warp-in text-center shadow-[0_0_60px_rgba(244,63,94,0.3)]">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">
                Xác Nhận Xóa Vĩnh Viễn Tài Khoản?
              </h3>
              <p className="text-xs text-slate-400">
                Nhân sự: <span className="text-white font-bold">{selectedUserForDelete.fullName}</span> ({selectedUserForDelete.email})
              </p>
            </div>

            <p className="text-xs text-rose-300/90 bg-rose-950/40 p-3 rounded-2xl border border-rose-500/30 leading-relaxed">
              ⚠️ Hành động này sẽ xóa hoàn toàn tài khoản nhân sự khỏi hệ thống danh bạ. Dữ liệu này không thể khôi phục!
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSelectedUserForDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUserForDelete)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
