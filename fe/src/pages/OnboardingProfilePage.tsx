import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { profileService } from '../services/profile';
import type { Profession } from '../types/auth';
import { getAvatarUrl } from '../utils/avatar';
import {
  Sparkles,
  User,
  Phone,
  Briefcase,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Globe,
  Loader2,
} from 'lucide-react';

interface OnboardingProfilePageProps {
  onComplete: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export const OnboardingProfilePage: React.FC<OnboardingProfilePageProps> = ({ onComplete }) => {
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const syncWithAuthUser = useUserStore((state) => state.syncWithAuthUser);

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || 'Software Engineer');
  const [department, setDepartment] = useState('Engineering');
  const [profession, setProfession] = useState<Profession>((currentUser?.profession as Profession) || 'DEV');
  const [workMode, setWorkMode] = useState<'OFFICE' | 'REMOTE'>('OFFICE');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(getAvatarUrl(currentUser));

  // New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Update Profile
      try {
        await profileService.updateProfile({
          fullName,
          phone,
          jobTitle,
          profession,
          bio,
          avatar: avatarUrl,
        });
      } catch {
        // Fallback for local
      }

      // 2. Change Password if provided
      if (newPassword) {
        try {
          await profileService.changePassword({ newPassword });
        } catch {
          // Local fallback
        }
      }

      // 3. Mark Onboarding as completed
      const updatedUser = {
        ...currentUser,
        fullName,
        phone,
        jobTitle,
        profession,
        bio,
        avatar: avatarUrl,
        avatarUrl,
        workMode,
        isFirstLogin: false,
      };

      updateUser(updatedUser as any);
      syncWithAuthUser(updatedUser as any);
      localStorage.setItem(`solaris_onboarded_${currentUser?.id}`, 'true');

      onComplete();
    } catch {
      setErrorMsg('Có lỗi xảy ra trong quá trình hoàn thiện hồ sơ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 🌌 Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-3xl w-full solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_80px_rgba(245,158,11,0.25)] p-6 sm:p-10 space-y-8 relative z-10 animate-solar-warp-in">
        {/* Header Title */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Chào Mừng Thành Viên Mới
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Thiết Lập Hồ Sơ Cá Nhân Lần Đầu Tiên
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Xin chào <strong className="text-amber-300">{currentUser?.fullName || currentUser?.email}</strong>! Vui lòng cập nhật thông tin nhận diện và đổi mật khẩu mới để bắt đầu làm việc trên Solaris Platform.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Avatar Selector */}
          <div className="space-y-3">
            <label className="text-slate-300 font-bold block">1. Chọn Ảnh Đại Diện (Avatar)</label>
            <div className="flex items-center gap-4 flex-wrap">
              <img
                src={avatarUrl}
                alt="Selected Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-lg bg-slate-900 shrink-0"
              />
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {AVATAR_PRESETS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-10 h-10 rounded-xl object-cover border-2 cursor-pointer transition-all hover:scale-110 ${
                      avatarUrl === url ? 'border-amber-400 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Họ Và Tên *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Số Điện Thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0988 123 456"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Chức Danh Công Việc
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="VD: Senior Frontend Architect"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Phòng Ban Trực Thuộc
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Engineering">Engineering (Khối Công Nghệ)</option>
                <option value="Product & Planning">Product &amp; Planning (Sản Phẩm)</option>
                <option value="Design & UX">Design &amp; UX (Thiết Kế Trải Nghiệm)</option>
                <option value="QA & Testing">QA &amp; Testing (Kiểm Thử)</option>
                <option value="Operations & SRE">Operations &amp; SRE (Vận Hành)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Chuyên Môn Cốt Lõi</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value as Profession)}
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

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> Chế Độ Làm Việc
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as 'OFFICE' | 'REMOTE')}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="OFFICE">Văn Phòng Trực Tiếp (Office HQ)</option>
                <option value="REMOTE">Làm Việc Từ Xa (Remote Work)</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">Giới Thiệu Bản Thân / Phương Châm Làm Việc</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Chia sẻ ngắn gọn về sở trường, kinh nghiệm hoặc câu châm ngôn bạn tâm đắc..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Password Reset Section */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Thiết Lập Mật Khẩu Mới Cho Tài Khoản (Khuyên Dùng)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span>Hoàn Tất Thiết Lập &amp; Bắt Đầu Làm Việc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
