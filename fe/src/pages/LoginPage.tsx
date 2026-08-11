import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { DarkSunLogo } from '../components/common/DarkSunLogo';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { EmailLoginForm } from '../components/auth/EmailLoginForm';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { AuthResponse, LoginPayload } from '../types/auth';

export const LoginPage = () => {
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLoginSubmit = async (payload: LoginPayload) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post<AuthResponse>('/auth/login', payload);
      setAuth(response.data.user, response.data.accessToken);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        setErrorMessage(responseData?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      } else {
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: { access_token?: string }) => {
    if (!response.access_token) return;
    await handleLoginSubmit({ googleToken: response.access_token });
  };

  return (
    <div className="min-h-screen w-full bg-[#070A12] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md solar-glass-card rounded-3xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <DarkSunLogo size={64} className="mb-3" />
          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-purple-400">
            SOLARIS TASK BOARD
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống quản lý công việc thông minh hỗ trợ giọng nói
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <GoogleOAuthButton onSuccess={handleGoogleSuccess} />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-amber-500/10 w-full" />
            <span className="bg-[#0F172A] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest absolute">
              HOẶC
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEmailFormOpen(!isEmailFormOpen)}
            className="w-full py-3 px-4 rounded-xl bg-[#131B2E] border border-amber-500/20 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-400 flex items-center justify-between transition-all cursor-pointer"
          >
            <span>📧 Đăng nhập bằng Email & Mật khẩu</span>
            {isEmailFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <EmailLoginForm
            isOpen={isEmailFormOpen}
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
