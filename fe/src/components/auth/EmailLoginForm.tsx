import { useState, useTransition, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import type { LoginPayload } from '../../types/auth';

interface EmailLoginFormProps {
  isOpen: boolean;
  onSubmit: (data: LoginPayload) => Promise<void>;
  isLoading?: boolean;
}

export const EmailLoginForm = ({ isOpen, onSubmit, isLoading = false }: EmailLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      onSubmit({ email, password });
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 pt-4 border-t border-amber-500/10 animate-accordion-expand"
    >
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Địa chỉ Email
        </label>
        <div className="relative">
          <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nhanvien@company.com"
            className="w-full bg-[#131B2E] border border-amber-500/20 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-[#131B2E] border border-amber-500/20 rounded-xl pl-11 pr-11 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-amber-500/30 text-amber-500 focus:ring-amber-500/20 bg-[#131B2E]"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <a href="#forgot" className="text-amber-400 hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full solar-corona-btn py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider shadow-lg disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-slate-900 border-t-amber-900 rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 fill-slate-900" />
            <span>Xác Nhận Đăng Nhập</span>
          </>
        )}
      </button>
    </form>
  );
};
