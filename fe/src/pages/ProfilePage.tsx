import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { profileService, type PersonalStatsResponse } from '../services/profile';
import type { UserStatusSignal, Profession } from '../types/auth';
import {
  Shield,
  Briefcase,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  Video,
  LogOut,
  X,
  Camera,
  Image as ImageIcon,
  Upload,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  Activity
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate?: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUser, logout } = useAuthStore();

  // 1. Modals & UI States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // 2. Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 3. Stats State (Real dynamic data from Backend)
  const [stats, setStats] = useState<PersonalStatsResponse>({
    completedTasks: 0,
    overdueTasks: 0,
    inProgressTasks: 0,
    totalAssignedTasks: 0,
  });

  // 4. Form Data State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    jobTitle: user?.jobTitle || '',
    profession: (user?.profession || 'DEV') as Profession,
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    coverImage: user?.coverImage || '',
  });

  // 5. Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Synchronize Form Data whenever `user` changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        profession: (user.profession || 'DEV') as Profession,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        coverImage: user.coverImage || '',
      });
    }
  }, [user]);

  // 6. Fetch Profile & Personal Stats from Backend on mount
  const loadData = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const [profileRes, statsRes] = await Promise.allSettled([
        profileService.getProfile(),
        profileService.getPersonalStats(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        updateUser(profileRes.value);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }
    } catch {
      // Fallback gracefully
    } finally {
      setIsLoadingStats(false);
    }
  }, [updateUser]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const statusSignal: UserStatusSignal = user?.statusSignal || 'ONLINE';
  const customStatus = user?.customStatus || '🟢 Đang làm việc trên Bảng Solaris...';

  const getStatusColor = (signal: UserStatusSignal) => {
    switch (signal) {
      case 'ONLINE': return 'bg-emerald-500 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20';
      case 'BUSY': return 'bg-rose-500 text-rose-300 border-rose-500/50 shadow-rose-500/20';
      case 'IN_MEETING': return 'bg-purple-500 text-purple-300 border-purple-500/50 shadow-purple-500/20';
      case 'AWAY': return 'bg-amber-500 text-amber-300 border-amber-500/50 shadow-amber-500/20';
      default: return 'bg-slate-500 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (signal: UserStatusSignal) => {
    switch (signal) {
      case 'ONLINE': return 'Đang trực tuyến';
      case 'BUSY': return 'Đang bận';
      case 'IN_MEETING': return 'Trong cuộc họp';
      case 'AWAY': return 'Vắng mặt';
      default: return 'Ngoại tuyến';
    }
  };

  // 📁 XỬ LÝ UPLOAD FILE ẢNH ĐẠI DIỆN VỚI GIỚI HẠN DUNG LƯỢNG
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        showToast('Kích thước file ảnh đại diện quá lớn (tối đa 2.5MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 📁 XỬ LÝ UPLOAD FILE ẢNH BÌA VỚI GIỚI HẠN DUNG LƯỢNG
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Kích thước file ảnh bìa quá lớn (tối đa 3MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ⚡ EVENT SUBMIT PROFILE CẬP NHẬT TRỰC TIẾP VÀO CSDL POSTGRESQL
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        jobTitle: formData.jobTitle.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatarUrl,
        coverImage: formData.coverImage,
        ...(user.globalRole === 'ADMIN' ? { profession: formData.profession } : {}),
      };

      const updatedUser = await profileService.updateProfile(payload);
      updateUser(updatedUser);
      showToast('Đã lưu và đồng bộ thông tin hồ sơ thành công!', 'success');
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi cập nhật hồ sơ';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 🔄 CHUYỂN TRẠNG THÁI STATUS SIGNAL TỨC THÌ
  const handleSelectStatusSignal = async (signal: UserStatusSignal) => {
    setIsStatusDropdownOpen(false);
    if (!user || user.statusSignal === signal) return;

    try {
      const res = await profileService.updateStatusSignal({ statusSignal: signal });
      updateUser({ statusSignal: res.statusSignal });
      showToast(`Đã chuyển trạng thái sang ${getStatusLabel(signal)}`, 'info');
    } catch {
      showToast('Không thể cập nhật trạng thái làm việc', 'error');
    }
  };

  // 🔒 XỬ LÝ ĐỔI MẬT KHẨU
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu mới và xác nhận mật khẩu không khớp nhau!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await profileService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      showToast(res.message || 'Đổi mật khẩu thành công!', 'success');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Mật khẩu hiện tại không chính xác';
      showToast(errorMsg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Toast Feedback Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-fade-in transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Activity className="w-5 h-5 text-amber-400 shrink-0" />}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Glass Bento Wrapper */}
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">

        {/* 🌠 Cosmic Cover Banner Header */}
        <div className="solar-glass-card rounded-3xl overflow-hidden border border-amber-500/30 bg-[#0F172A]/80 shadow-2xl relative">
          <div className="h-56 md:h-64 w-full relative overflow-hidden group">
            <img
              src={user?.coverImage || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80'}
              alt="Cosmic Cover Banner"
              className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
            
            {/* Quick Camera Hover Button for Cover Banner */}
            <button
              onClick={() => {
                setFormData({
                  fullName: user?.fullName || '',
                  phone: user?.phone || '',
                  jobTitle: user?.jobTitle || '',
                  profession: (user?.profession || 'DEV') as Profession,
                  bio: user?.bio || '',
                  avatarUrl: user?.avatarUrl || '',
                  coverImage: user?.coverImage || '',
                });
                setIsEditModalOpen(true);
              }}
              className="absolute bottom-4 left-4 px-3.5 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:border-amber-400 hover:text-white"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              Tải Ảnh Bìa Mới
            </button>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900/80 backdrop-blur-md border border-amber-500/40 text-amber-300">
                PRO PROFILE
              </span>
              
              {/* ⚡ NÚT CHỈNH SỬA PROFILE */}
              <button
                onClick={() => {
                  setFormData({
                    fullName: user?.fullName || '',
                    phone: user?.phone || '',
                    jobTitle: user?.jobTitle || '',
                    profession: (user?.profession || 'DEV') as Profession,
                    bio: user?.bio || '',
                    avatarUrl: user?.avatarUrl || '',
                    coverImage: user?.coverImage || '',
                  });
                  setIsEditModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Chỉnh Sửa Profile
              </button>
            </div>
          </div>

          {/* Profile Header Info Overlay */}
          <div className="px-6 md:px-10 pb-8 -mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* 3D Avatar Pulse Circle */}
              <div className="relative group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-slate-900 flex items-center justify-center relative">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 via-amber-400 to-purple-600 flex items-center justify-center text-slate-950 font-black text-4xl tracking-widest shadow-inner">
                      {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'HD'}
                    </div>
                  )}
                  {/* Overlay camera icon on hover */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 mb-1 text-amber-400" />
                    <span className="text-[10px] font-bold">Thay Đổi Avatar</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0F172A] shadow-md animate-pulse" />
              </div>

              {/* Name & Titles */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {user?.fullName || 'Người Dùng Solaris'}
                  </h1>

                  <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    {user?.globalRole || 'EMPLOYEE'}
                  </span>

                  <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    {user?.profession || 'DEV'}
                  </span>
                </div>

                <p className="text-slate-300 font-medium text-sm">
                  {user?.jobTitle || 'Chuyên viên Tác Nghiệp Hệ Thống'}
                </p>

                {/* 🔄 Interactive Status Signal Dropdown */}
                <div className="flex items-center gap-3 pt-1 relative">
                  <div className="relative">
                    <button
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold border shadow-lg cursor-pointer transition-all hover:scale-105 ${getStatusColor(statusSignal)}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                      <span>{getStatusLabel(statusSignal)}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    {/* Popover options */}
                    {isStatusDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 py-2 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                        <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                          Chọn trạng thái làm việc
                        </div>
                        {(['ONLINE', 'BUSY', 'IN_MEETING', 'AWAY'] as UserStatusSignal[]).map((sig) => (
                          <button
                            key={sig}
                            onClick={() => void handleSelectStatusSignal(sig)}
                            className="w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-800/80 text-slate-200 cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  sig === 'ONLINE'
                                    ? 'bg-emerald-400'
                                    : sig === 'BUSY'
                                    ? 'bg-rose-400'
                                    : sig === 'IN_MEETING'
                                    ? 'bg-purple-400'
                                    : 'bg-amber-400'
                                }`}
                              />
                              {getStatusLabel(sig)}
                            </span>
                            {statusSignal === sig && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 hidden sm:inline-block">
                    {customStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Workspace Switch Buttons */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3">
              <button
                onClick={() => onNavigate?.('/tasks')}
                className="solar-corona-btn px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              >
                Vào Bảng Task Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onNavigate?.('/meetings')}
                className="px-6 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              >
                <Video className="w-4 h-4 text-purple-400" />
                Mở Phòng Họp WebRTC
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 Bento Stats & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Contact & Security Card */}
          <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-amber-500/20 space-y-6">
            <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Thông Tin Liên Hệ & Tổ Chức
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-xs">{user?.email || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{user?.phone || 'Chưa thiết lập SĐT'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Khối Nghiệp Vụ: <strong className="text-white">{user?.profession || 'DEV'}</strong></span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Tiểu sử ngắn (Bio)</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{user?.bio || 'Chưa cập nhật tiểu sử làm việc.'}"
              </p>
            </div>

            {/* 🔒 NÚT ĐỔI MẬT KHẨU & ĐĂNG XUẤT */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-400" />
                Bảo Mật & Đổi Mật Khẩu
              </button>

              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Đăng Xuất Phiên Làm Việc
              </button>
            </div>
          </div>

          {/* Right Column (Span 2): Productivity Stats & Personal Metrics */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Thống Kê Tác Nghiệp Thời Gian Thực (Live Metrics)
              </h2>
              {isLoadingStats && (
                <span className="text-xs text-amber-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang đồng bộ...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Task Hoàn Thành */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">HOÀN THÀNH</span>
                </div>
                <span className="text-2xl font-extrabold text-white">{stats.completedTasks}</span>
                <p className="text-[11px] text-slate-400">Task Hoàn Tất</p>
              </div>

              {/* Task Trễ Hạn */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-rose-500/40 space-y-1">
                <div className="flex items-center justify-between text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">TRỄ HẠN</span>
                </div>
                <span className="text-2xl font-extrabold text-rose-300">{stats.overdueTasks}</span>
                <p className="text-[11px] text-slate-400">Task Quá Hạn</p>
              </div>

              {/* Task Đang Thực Hiện */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between text-amber-400">
                  <Zap className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">ĐANG LÀM</span>
                </div>
                <span className="text-2xl font-extrabold text-amber-300">{stats.inProgressTasks}</span>
                <p className="text-[11px] text-slate-400">Task Đang Xử Lý</p>
              </div>

              {/* Tổng Task Được Giao */}
              <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/80 border border-purple-500/40 space-y-1">
                <div className="flex items-center justify-between text-purple-400">
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">TỔNG TASK</span>
                </div>
                <span className="text-2xl font-extrabold text-purple-300">{stats.totalAssignedTasks}</span>
                <p className="text-[11px] text-slate-400">Nhiệm Vụ Đã Nhận</p>
              </div>
            </div>

            {/* Badges & Achievements Card */}
            <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-amber-500/20 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Huy Hiệu Solaris & Thành Tích Uy Tín
              </h3>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  🔥 Solar Focus Master
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5">
                  ⚡ {user?.profession || 'Core'} Expert
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  🎙️ Voice Cockpit Pioneer
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 📝 MODAL CHỈNH SỬA PROFILE CÁ NHÂN */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative space-y-6 animate-solar-warp-in max-h-[90vh] overflow-y-auto">
              
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-extrabold text-white">Chỉnh Sửa Hồ Sơ Cá Nhân</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Nhập Liệu */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                
                {/* 📁 UPLOAD FILE ẢNH ĐẠI DIỆN */}
                <div className="space-y-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <label className="font-bold text-amber-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    Ảnh Đại Diện (Tối đa 2.5MB)
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-900 shrink-0 flex items-center justify-center">
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-amber-400 text-xs">HD</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        Chọn File Ảnh Từ Máy
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                        />
                      </label>
                      
                      {formData.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                          className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Gỡ ảnh đại diện
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 📁 UPLOAD FILE ẢNH BÌA */}
                <div className="space-y-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <label className="font-bold text-amber-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    Ảnh Bìa Vũ Trụ (Tối đa 3MB)
                  </label>

                  {formData.coverImage && (
                    <div className="h-20 w-full rounded-xl overflow-hidden border border-slate-800">
                      <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <label className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    {formData.coverImage ? 'Thay Đổi Ảnh Bìa' : 'Chọn File Ảnh Bìa Từ Máy'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Họ và Tên */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">Họ và Tên</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Số Điện Thoại */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ví dụ: +84 988 123 456"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Chức Danh Công Việc */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">Chức Danh Công Việc (Job Title)</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Ví dụ: Senior Frontend Developer"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Khối Chuyên Môn */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-300 block">Khối Chuyên Môn (Profession)</label>
                    {user?.globalRole !== 'ADMIN' && (
                      <span className="text-[10px] text-amber-400 font-mono italic">
                        🔒 Chỉ ADMIN mới được sửa
                      </span>
                    )}
                  </div>

                  <select
                    disabled={user?.globalRole !== 'ADMIN'}
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value as Profession })}
                    className={`w-full p-3 rounded-xl border text-white bg-slate-950 focus:outline-none ${
                      user?.globalRole !== 'ADMIN'
                        ? 'opacity-50 cursor-not-allowed border-slate-800/80 bg-slate-900 text-slate-400'
                        : 'border-slate-800 focus:border-amber-500 cursor-pointer'
                    }`}
                  >
                    <option value="DEV">DEV (Lập trình viên)</option>
                    <option value="PRODUCT_OWNER">PRODUCT_OWNER (Quản lý sản phẩm)</option>
                    <option value="TESTER">TESTER (Kiểm thử phần mềm)</option>
                    <option value="DESIGNER">DESIGNER (Thiết kế Giao diện)</option>
                    <option value="BA">BA (Phân tích nghiệp vụ)</option>
                    <option value="DEVOPS">DEVOPS (Vận hành hạ tầng)</option>
                    <option value="MARKETING">MARKETING (Tiếp thị & Phát triển)</option>
                  </select>
                </div>

                {/* Bio / Phương Châm */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">Tiểu Sử / Phương Châm Làm Việc</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Chia sẻ phương châm tác nghiệp của bạn..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Nút Hành Động */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang Lưu Vào CSDL...
                      </>
                    ) : (
                      'Lưu Thay Đổi'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white cursor-pointer transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🔒 MODAL ĐỔI MẬT KHẨU */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative space-y-6 animate-solar-warp-in">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-extrabold text-white">Bảo Mật & Đổi Mật Khẩu</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                {/* Mật khẩu hiện tại */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">Mật Khẩu Hiện Tại</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      required
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      placeholder="Nhập mật khẩu đang dùng"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">Mật Khẩu Mới</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-300 block">Xác Nhận Mật Khẩu Mới</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang Cập Nhật...
                      </>
                    ) : (
                      'Xác Nhận Đổi Mật Khẩu'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
