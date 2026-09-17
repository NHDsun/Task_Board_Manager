import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useScheduleStore } from '../store/useScheduleStore';
import { profileService, type PersonalStatsResponse } from '../services/profile';
import type { UserStatusSignal, Profession } from '../types/auth';
import { DEFAULT_COVER, getAvatarUrl } from '../utils/avatar';
import {
  Briefcase,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  Camera,
  Key,
  Eye,
  EyeOff,
  Loader2,
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  AlertTriangle,
  Upload,
  Home,
  Plane,
  Palmtree,
  Image as ImageIcon,
  ChevronDown,
  Check,
} from 'lucide-react';
import { CreateLeaveRequestModal } from '../components/schedule/CreateLeaveRequestModal';

export type WorkLocationType = 'OFFICE' | 'WFH' | 'ON_SITE' | 'LEAVE';

const WORK_LOCATIONS: Array<{
  id: WorkLocationType;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  badgeBg: string;
  textColor: string;
  dotColor: string;
}> = [
  {
    id: 'OFFICE',
    label: 'Tại Văn Phòng',
    subLabel: 'Office HQ',
    icon: Building2,
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    textColor: 'text-emerald-300',
    dotColor: 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]',
  },
  {
    id: 'WFH',
    label: 'Làm Từ Xa (WFH)',
    subLabel: 'Remote Working',
    icon: Home,
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    textColor: 'text-amber-300',
    dotColor: 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]',
  },
  {
    id: 'ON_SITE',
    label: 'Đi Công Tác',
    subLabel: 'On-Site / Business Trip',
    icon: Plane,
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    textColor: 'text-blue-300',
    dotColor: 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]',
  },
  {
    id: 'LEAVE',
    label: 'Nghỉ Phép',
    subLabel: 'On Leave',
    icon: Palmtree,
    badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    textColor: 'text-rose-300',
    dotColor: 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.8)]',
  },
];

interface ProfilePageProps {
  onNavigate?: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user: authUser, updateUser } = useAuthStore();
  const { viewingUserId, setViewingUserId, getUserById, syncWithAuthUser } = useUserStore();

  const isSelf = !viewingUserId || viewingUserId === authUser?.id;
  const viewingDirectoryUser = viewingUserId ? getUserById(viewingUserId) : null;

  // Active user data being displayed
  const user = isSelf
    ? authUser
    : {
        id: viewingDirectoryUser?.id || viewingUserId || 'u-unknown',
        fullName: viewingDirectoryUser?.fullName || 'Nhân sự Solaris',
        email: viewingDirectoryUser?.email || 'user@solaris.io',
        phone: viewingDirectoryUser?.phone || '',
        avatarUrl: viewingDirectoryUser?.avatarUrl || viewingDirectoryUser?.avatar,
        avatar: viewingDirectoryUser?.avatar || viewingDirectoryUser?.avatarUrl,
        coverImage: viewingDirectoryUser?.coverImage,
        globalRole: viewingDirectoryUser?.globalRole || 'EMPLOYEE',
        profession: viewingDirectoryUser?.profession || 'DEV',
        jobTitle: viewingDirectoryUser?.jobTitle || 'Chuyên viên Phát triển',
        bio: viewingDirectoryUser?.bio || '',
        statusSignal: viewingDirectoryUser?.statusSignal || 'ONLINE',
        customStatus: viewingDirectoryUser?.customStatus,
      };

  // 1. Modals & UI States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2. Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 3. Stats State (Dynamic for self or viewed user)
  const [stats, setStats] = useState<PersonalStatsResponse>({
    completedTasks: viewingDirectoryUser?.tasksCount?.completed || 0,
    overdueTasks: viewingDirectoryUser?.tasksCount?.overdue || 0,
    inProgressTasks: viewingDirectoryUser?.tasksCount?.inProgress || 0,
    totalAssignedTasks: viewingDirectoryUser?.tasksCount?.total || 0,
  });

  // 4. Form Data State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    jobTitle: user?.jobTitle || '',
    profession: (user?.profession || 'DEV') as Profession,
    bio: user?.bio || '',
    avatarUrl: getAvatarUrl(user),
    coverImage: user?.coverImage || DEFAULT_COVER,
  });

  // 5. Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 6. Work Location State (Auto-displayed for Employee, Editable for Admin only)
  const { getWorkLocationForDate, setUserDailyWorkLocation } = useScheduleStore();
  const isAdmin = authUser?.globalRole === 'ADMIN';
  const targetUserId = user?.id || 'u-self';

  // Lấy vị trí làm việc hôm nay từ schedule store (Lịch làm việc là Nguồn Sự Thật)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [locationResult, setLocationResult] = useState(() => getWorkLocationForDate(targetUserId, todayDateStr));
  const currentWorkLocation = locationResult.workType;
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Đồng bộ tự động khi user hoặc store thay đổi (Lịch duyệt/xếp bởi Admin -> Tự động hiển thị ra Profile)
  useEffect(() => {
    const res = getWorkLocationForDate(targetUserId, todayDateStr);
    setLocationResult(res);
  }, [targetUserId, todayDateStr, getWorkLocationForDate]);

  // 7. File Upload Refs & Handlers for Avatar and Cover Image (Direct Upload, No Raw URL needed)
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Tệp ảnh đại diện vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        showToast('📸 Đã tải ảnh đại diện lên thành công!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Tệp ảnh bìa vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, coverImage: reader.result as string }));
        showToast('🖼️ Đã tải ảnh bìa lên thành công!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Chỉ Admin được chỉ định vị trí trực tiếp
  const handleSelectWorkLocation = (loc: WorkLocationType) => {
    if (!isAdmin) return;
    setIsLocationDropdownOpen(false);
    const locInfo = WORK_LOCATIONS.find((l) => l.id === loc);

    setUserDailyWorkLocation(targetUserId, loc, undefined, {
      adminId: authUser?.id || 'admin',
      adminName: authUser?.fullName || 'Admin',
    });
    showToast(`👑 [Admin] Đã chỉ định vị trí làm việc cho ${user?.fullName || 'nhân sự'}: ${locInfo?.label || loc}`, 'success');

    const updated = getWorkLocationForDate(targetUserId, todayDateStr);
    setLocationResult(updated);
  };

  // Close location dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize Form Data whenever `user` changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        profession: (user.profession || 'DEV') as Profession,
        bio: user.bio || '',
        avatarUrl: getAvatarUrl(user),
        coverImage: user.coverImage || DEFAULT_COVER,
      });
    }
  }, [user]);

  // 6. Fetch Profile & Personal Stats from Backend on mount (only for self)
  const loadData = useCallback(async () => {
    if (!isSelf) return;
    try {
      const [profileRes, statsRes] = await Promise.allSettled([
        profileService.getProfile(),
        profileService.getPersonalStats(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        updateUser(profileRes.value);
        syncWithAuthUser(profileRes.value);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }
    } catch {
      // Fallback
    }
  }, [isSelf, updateUser, syncWithAuthUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 7. Handlers for Updating Profile & Syncing Everywhere
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelf) return;
    try {
      setIsSaving(true);
      const updated = await profileService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        profession: formData.profession,
        bio: formData.bio,
        avatar: formData.avatarUrl,
        coverImage: formData.coverImage,
      });

      updateUser(updated);
      syncWithAuthUser(updated);
      setIsEditModalOpen(false);
      showToast('🎉 Đã cập nhật hồ sơ và đồng bộ toàn hệ thống thành công!', 'success');
    } catch {
      const localUpdated = { ...authUser, ...formData, avatar: formData.avatarUrl };
      updateUser(localUpdated as any);
      syncWithAuthUser(localUpdated as any);
      setIsEditModalOpen(false);
      showToast('🎉 Đã cập nhật hồ sơ và đồng bộ toàn hệ thống!', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu mới xác nhận không khớp!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Mật khẩu mới phải từ 6 ký tự trở lên!', 'error');
      return;
    }

    try {
      setIsChangingPassword(true);
      await profileService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      showToast('🔒 Đổi mật khẩu thành công!', 'success');
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Helper badge styles
  const getStatusColor = (signal?: UserStatusSignal) => {
    switch (signal) {
      case 'ONLINE':
        return 'bg-emerald-400 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
      case 'BUSY':
        return 'bg-rose-500 border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.8)]';
      case 'IN_MEETING':
        return 'bg-purple-500 border-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse';
      case 'AWAY':
        return 'bg-amber-400 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]';
      default:
        return 'bg-slate-500 border-slate-600';
    }
  };

  const getStatusText = (signal?: UserStatusSignal) => {
    switch (signal) {
      case 'ONLINE':
        return 'Đang Trực Tuyến (Online)';
      case 'BUSY':
        return 'Bận Việc (Busy)';
      case 'IN_MEETING':
        return 'Đang Họp (In Meeting)';
      case 'AWAY':
        return 'Vắng Mặt (Away)';
      default:
        return 'Ngoại Tuyến (Offline)';
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      case 'MANAGER':
        return 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      default:
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const tasksOnTime = Math.max(0, stats.completedTasks - stats.overdueTasks);
  const activeAvatar = getAvatarUrl(user);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {/* 🍞 Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3.5 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-white text-xs font-bold shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl flex items-center gap-3 animate-solar-drop-snap">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 🔙 Viewing Other User Banner */}
      {!isSelf && (
        <div className="solar-glass-card p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#0F172A] to-blue-950/80 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-purple-300 font-bold block">
                Chế độ xem hồ sơ nhân sự (View-Only Mode)
              </span>
              <p className="text-xs text-slate-400">
                Bạn đang xem thông tin và khối lượng công việc của: <strong className="text-white">{user?.fullName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => showToast(`💬 Đang mở hộp thoại trò chuyện với ${user?.fullName}...`, 'info')}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Gửi Tin Nhắn
            </button>
            <button
              onClick={() => setViewingUserId(null)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay Lại Hồ Sơ Của Tôi
            </button>
          </div>
        </div>
      )}

      {/* 🌌 Hero Cover & Identity Card */}
      <div className="solar-glass-card rounded-3xl bg-[#0F172A]/90 border border-amber-500/30 shadow-2xl relative z-20">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-900 rounded-t-3xl">
          <img
            src={user?.coverImage || DEFAULT_COVER}
            alt="Cover"
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-[#0F172A]" />

          {/* Edit Cover Action (Only Self) */}
          {isSelf && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-slate-200 text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" /> Đổi Ảnh Bìa
            </button>
          )}
        </div>

        {/* Identity & Profile Overview */}
        <div className="px-6 sm:px-10 pb-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar with Status Ring */}
            <div className="relative group">
              <img
                src={activeAvatar}
                alt="Avatar"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-[#0F172A] shadow-2xl bg-slate-900"
              />
              <span
                className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-3 border-[#0F172A] ${getStatusColor(
                  user?.statusSignal as UserStatusSignal
                )}`}
                title={getStatusText(user?.statusSignal as UserStatusSignal)}
              />
              {isSelf && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                >
                  <Edit3 className="w-5 h-5 text-amber-400" />
                </button>
              )}
            </div>

            {/* Identity Info */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  {user?.fullName || 'Chưa cập nhật họ tên'}
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h1>
                <span className={`px-3 py-1 rounded-xl text-xs font-black border tracking-wider ${getRoleBadge(user?.globalRole)}`}>
                  {user?.globalRole || 'EMPLOYEE'}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                {user?.jobTitle || 'Chuyên viên Phát triển Hệ thống'} • <span className="text-amber-400 font-mono">{user?.profession || 'DEV'}</span>
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {user?.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" /> Engineering Core
                </span>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="flex items-center gap-3 self-stretch md:self-end justify-end flex-wrap">
            {/* 📍 Work Location Status Badge (Interactive for Admin only, Auto-displayed for Employees) */}
            <div className="relative" ref={locationDropdownRef}>
              <div
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 shadow-inner transition-all ${
                  WORK_LOCATIONS.find((l) => l.id === currentWorkLocation)?.badgeBg || 'bg-slate-900 border-slate-700 text-slate-200'
                } ${isAdmin ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'cursor-default'}`}
                onClick={() => isAdmin && setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                title={
                  isAdmin
                    ? `Admin: Nhấp để chỉ định vị trí làm việc cho ${user?.fullName || 'nhân sự'}`
                    : `Vị trí hôm nay của ${user?.fullName || 'bạn'} (Tự động cập nhật theo lịch làm việc đã duyệt)`
                }
              >
                <span className={`w-2.5 h-2.5 rounded-full ${WORK_LOCATIONS.find((l) => l.id === currentWorkLocation)?.dotColor || 'bg-slate-400'}`} />
                {(() => {
                  const activeLoc = WORK_LOCATIONS.find((l) => l.id === currentWorkLocation);
                  const LocIcon = activeLoc?.icon || Building2;
                  return (
                    <span className="flex items-center gap-1.5 font-bold tracking-tight">
                      <LocIcon className="w-3.5 h-3.5 shrink-0" />
                      {activeLoc?.label || 'Tại Văn Phòng'}
                    </span>
                  );
                })()}

                {/* Source Badge Title (Ví dụ: [Đã Duyệt WFH], [Lịch Phân Công]) */}
                {locationResult.sourceTitle && locationResult.source !== 'DEFAULT' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono font-bold border border-amber-500/30">
                    ✓ {locationResult.sourceTitle}
                  </span>
                )}

                {isAdmin && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-mono font-extrabold border border-amber-500/50 flex items-center gap-0.5">
                    ADMIN SỬA 👑 <ChevronDown className="w-3 h-3 text-amber-400" />
                  </span>
                )}
              </div>

              {/* Location Selection Dropdown (Only for Admin) */}
              {isAdmin && isLocationDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-[#0F172A] border border-amber-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 animate-solar-drop-snap space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{`Chỉ định vị trí cho ${user?.fullName || 'nhân sự'}`}</span>
                    <span className="text-amber-400 font-mono text-[10px]">Admin Role</span>
                  </div>
                  {WORK_LOCATIONS.map((loc) => {
                    const Icon = loc.icon;
                    const isSelected = currentWorkLocation === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectWorkLocation(loc.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected ? 'bg-amber-500/20 border border-amber-500/40 text-white' : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${loc.badgeBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-white">{loc.label}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{loc.subLabel}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nộp đơn xin nghỉ phép / WFH (Dành cho Employee tự gửi đơn cho Manager) */}
            {isSelf && !isAdmin && (
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Gửi đơn xin nghỉ hoặc WFH đến Quản lý"
              >
                <Palmtree className="w-3.5 h-3.5 text-amber-400" />
                <span>Nộp Đơn Phép / WFH</span>
              </button>
            )}

            {isSelf ? (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Chỉnh Sửa Hồ Sơ
                </button>

                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Đổi mật khẩu"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate?.('/tasks')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
              >
                <FolderKanban className="w-4 h-4" /> Xem Bảng Nhiệm Vụ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 4-CARD PRECISE METRIC GRID: TỔNG TASK • ĐANG LÀM • ĐÚNG HẠN • TRỄ HẠN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng Nhiệm Vụ</span>
            <span className="text-2xl font-black text-white font-mono">{stats.totalAssignedTasks}</span>
          </div>
        </div>

        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang Triển Khai</span>
            <span className="text-2xl font-black text-amber-300 font-mono">{stats.inProgressTasks}</span>
          </div>
        </div>

        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đúng Hạn (On-Time)</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{tasksOnTime}</span>
          </div>
        </div>

        <div className="solar-glass-card p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Trễ Hạn (Overdue)</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{stats.overdueTasks}</span>
          </div>
        </div>
      </div>

      {/* 📝 Bio & Assigned Projects Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio & Contact */}
        <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Giới Thiệu Bản Thân
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            {user?.bio || 'Chưa có thông tin giới thiệu bản thân.'}
          </p>

          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Vị trí hôm nay:</span>
              <span className={`font-bold flex items-center gap-1.5 ${WORK_LOCATIONS.find((l) => l.id === currentWorkLocation)?.textColor || 'text-emerald-400'}`}>
                {(() => {
                  const loc = WORK_LOCATIONS.find((l) => l.id === currentWorkLocation);
                  const Icon = loc?.icon || Building2;
                  return (
                    <>
                      <Icon className="w-3.5 h-3.5" />
                      {loc?.label || 'Văn phòng (Office HQ)'}
                    </>
                  );
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Khối phòng ban:</span>
              <span className="text-white font-bold">
                {typeof user?.department === 'string'
                  ? user.department
                  : (user?.department && typeof user.department === 'object' ? user.department.name : '') || viewingDirectoryUser?.department || 'Chưa phân bổ'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Projects & Recent Tasks (2 cols) */}
        <div className="lg:col-span-2 solar-glass-card p-6 rounded-3xl bg-[#0F172A]/90 border border-slate-800 space-y-5">
          <h3 className="text-sm font-extrabold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-amber-400" /> Các Dự Án Phụ Trách &amp; Tham Gia
            </span>
            <span className="text-xs text-amber-400 font-mono">
              {((user as any)?.assignedProjects || viewingDirectoryUser?.assignedProjects || []).length} Dự án
            </span>
          </h3>

          {(() => {
            const rawProjects = (user as any)?.assignedProjects || viewingDirectoryUser?.assignedProjects || [];
            if (!rawProjects || rawProjects.length === 0) {
              return (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400">Chưa tham gia dự án nào trong hệ thống.</p>
                  {isSelf && (
                    <button
                      onClick={() => onNavigate?.('/tasks')}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <FolderKanban className="w-3.5 h-3.5" /> Khám Phá Bảng Nhiệm Vụ
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {rawProjects.map((proj: any, idx: number) => {
                  const isObj = typeof proj === 'object' && proj !== null;
                  const projName = isObj ? proj.name : proj;
                  const projRole = isObj ? proj.roleInProject || 'Thành viên cốt lõi' : 'Thành viên cốt lõi';
                  const projDesc = isObj ? proj.description : '';

                  return (
                    <div
                      key={isObj ? proj.id || idx : idx}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-white text-xs truncate">{projName}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-amber-400/90 font-mono">Vai trò: {projRole}</span>
                            {projDesc && (
                              <span className="text-[10px] text-slate-400 truncate hidden sm:inline">• {projDesc}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold shrink-0">
                        Đang hoạt động
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 🚀 EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Chỉnh Sửa Hồ Sơ Cá Nhân</h2>
                  <p className="text-xs text-slate-400">Tự động đồng bộ với Bảng Kanban và Danh bạ nhân sự</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Họ Và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0988 123 456"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Chức Danh Công Việc</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="VD: Senior Frontend Architect"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 📸 DIRECT FILE UPLOADS: AVATAR & COVER IMAGE (NO URL REQUIRED) */}
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleCoverFileChange}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Ảnh Đại Diện</label>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <img
                      src={formData.avatarUrl || DEFAULT_COVER}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 shrink-0 bg-slate-950"
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
                    >
                      <Upload className="w-3.5 h-3.5 shrink-0" /> Tải Ảnh Lên
                    </button>
                  </div>
                </div>

                {/* Cover Image Picker */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Ảnh Bìa Hồ Sơ</label>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <img
                      src={formData.coverImage || DEFAULT_COVER}
                      alt="Cover Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950"
                    />
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
                    >
                      <ImageIcon className="w-3.5 h-3.5 shrink-0" /> Tải Ảnh Bìa
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Giới Thiệu Bản Thân (Bio)</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Mô tả ngắn gọn về chuyên môn, sở thích hoặc phương châm làm việc..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Lưu &amp; Đồng Bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔒 CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 p-6 sm:p-8 space-y-6 relative animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Đổi Mật Khẩu</h2>
                  <p className="text-xs text-slate-400">Bảo vệ tài khoản với mật khẩu mạnh</p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mật Khẩu Cũ</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="w-full p-3 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mật Khẩu Mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full p-3 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Xác Nhận Mật Khẩu Mới</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer transition-all"
                >
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác Nhận Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 Modal Nộp Đơn Nghỉ / WFH (Dành cho Employee) */}
      <CreateLeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSuccess={() => {
          const res = getWorkLocationForDate(targetUserId, todayDateStr);
          setLocationResult(res);
          showToast('✅ Đã gửi đơn thành công! Đang chờ Quản lý duyệt.', 'success');
        }}
      />
    </div>
  );
};
