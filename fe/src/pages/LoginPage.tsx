import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, Sparkles } from 'lucide-react';
import { DarkSunLogo } from '../components/common/DarkSunLogo';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { EmailLoginForm } from '../components/auth/EmailLoginForm';
import { LoginTransitionWarp } from '../components/auth/LoginTransitionWarp';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { AuthResponse, LoginPayload, User } from '../types/auth';

export const LoginPage = () => {
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warpData, setWarpData] = useState<{ user: User; accessToken: string } | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLoginSubmit = async (payload: LoginPayload) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const endpoint = payload.googleToken ? '/auth/google' : '/auth/login';
      const response = await api.post<AuthResponse | { data: AuthResponse }>(endpoint, payload);
      const resPayload = 'data' in response.data && response.data.data ? response.data.data : (response.data as AuthResponse);
      if (resPayload && resPayload.user && resPayload.accessToken) {
        // Trigger 0.75s Sci-fi Warp Animation directly before setting auth state!
        setWarpData({ user: resPayload.user, accessToken: resPayload.accessToken });
      } else {
        setErrorMessage('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
        const msg = responseData?.message;
        if (Array.isArray(msg)) {
          setErrorMessage(msg.join(', '));
        } else {
          setErrorMessage(msg || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
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

  const handleWarpComplete = () => {
    if (warpData) {
      setAuth(warpData.user, warpData.accessToken);
    }
  };

  // Render Sci-fi Warp Animation when login succeeds
  if (warpData) {
    return <LoginTransitionWarp onComplete={handleWarpComplete} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden solar-grid-pattern">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/15 via-purple-600/10 to-transparent rounded-full blur-[140px] pointer-events-none animate-ambient-float-1" />
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none animate-ambient-float-2" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none animate-ambient-float-1" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-amber-500/10 rounded-full animate-solar-rotate pointer-events-none opacity-60">
        <div className="absolute -top-3 left-1/2 w-6 h-6 bg-amber-400 rounded-full blur-md shadow-[0_0_20px_#f59e0b]" />
        <div className="absolute -bottom-3 left-1/2 w-4 h-4 bg-purple-500 rounded-full blur-md shadow-[0_0_15px_#8b5cf6]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="solar-glass-card rounded-3xl p-8 backdrop-blur-2xl bg-[#0F172A]/80 border-t-2 border-t-amber-400/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <DarkSunLogo className="w-24 h-24 mb-1 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-purple-200 to-amber-100 bg-clip-text text-transparent">
                SOLARIS TASK BOARD
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
                Voice-Assisted Task Management System
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-accordion-expand">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <GoogleOAuthButton onSuccess={handleGoogleSuccess} />

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60" />
              </div>
              <span className="relative bg-[#0F172A] px-4 text-xs font-mono uppercase tracking-widest text-slate-400">
                hoặc dùng tài khoản
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEmailFormOpen(!isEmailFormOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#1E293B]/60 hover:bg-[#1E293B] border border-amber-500/20 hover:border-amber-500/40 text-slate-200 text-sm font-medium transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>Đăng nhập bằng Email & Mật khẩu</span>
              </div>
              {isEmailFormOpen ? (
                <ChevronUp className="w-4 h-4 text-amber-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
              )}
            </button>

            {isEmailFormOpen && (
              <div className="animate-accordion-expand pt-2">
                <EmailLoginForm isOpen={isEmailFormOpen} onSubmit={handleLoginSubmit} isLoading={isLoading} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
