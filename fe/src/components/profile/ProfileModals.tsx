import React from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Key,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { CreateLeaveRequestModal } from '../../components/schedule/CreateLeaveRequestModal';
import { DEFAULT_COVER } from '../../utils/avatar';

interface ProfileFormData {
  fullName: string;
  phone: string;
  jobTitle: string;
  profession?: any;
  avatarUrl: string;
  coverImage: string;
  bio: string;
}

interface ProfileModalsProps {
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  avatarFileInputRef: React.RefObject<HTMLInputElement | null>;
  coverFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  isSaving: boolean;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  passwordData: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordData: React.Dispatch<React.SetStateAction<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>>;
  showOldPassword: boolean;
  setShowOldPassword: (show: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (show: boolean) => void;
  handlePasswordChange: (e: React.FormEvent) => void;
  isChangingPassword: boolean;
  isLeaveModalOpen: boolean;
  setIsLeaveModalOpen: (open: boolean) => void;
  onLeaveSuccess: () => void;
}

export const ProfileModals: React.FC<ProfileModalsProps> = ({
  isEditModalOpen,
  setIsEditModalOpen,
  formData,
  setFormData,
  avatarFileInputRef,
  coverFileInputRef,
  handleAvatarFileChange,
  handleCoverFileChange,
  handleSaveProfile,
  isSaving,
  isPasswordModalOpen,
  setIsPasswordModalOpen,
  passwordData,
  setPasswordData,
  showOldPassword,
  setShowOldPassword,
  showNewPassword,
  setShowNewPassword,
  handlePasswordChange,
  isChangingPassword,
  isLeaveModalOpen,
  setIsLeaveModalOpen,
  onLeaveSuccess,
}) => {
  return (
    <>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto animate-solar-warp-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Chỉnh Sửa Hồ Sơ</h2>
                  <p className="text-xs text-slate-400">Cập nhật thông tin nhận diện tài khoản cá nhân</p>
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
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0988 123 456"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Chức Danh Công Việc</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="VD: Senior Frontend Architect"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <input
                type="file"
                ref={avatarFileInputRef as any}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <input
                type="file"
                ref={coverFileInputRef as any}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleCoverFileChange}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
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

      <CreateLeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSuccess={onLeaveSuccess}
      />
    </>
  );
};
