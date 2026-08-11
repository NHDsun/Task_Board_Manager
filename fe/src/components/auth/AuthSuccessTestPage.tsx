import { CheckCircle2, LogOut, ShieldCheck, User as UserIcon, Sparkles } from 'lucide-react';
import { DarkSunLogo } from '../common/DarkSunLogo';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthSuccessTestPage = () => {
  const { user, token, logout } = useAuthStore();

  return (
    <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden solar-grid-pattern">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-linear-to-tr from-emerald-500/15 via-amber-500/10 to-purple-600/15 rounded-full blur-[140px] pointer-events-none animate-ambient-float-1" />

      <div className="w-full max-w-lg solar-glass-card rounded-3xl p-8 relative z-10 space-y-6 border-t-2 border-t-emerald-400/50 shadow-2xl">
        <div className="text-center space-y-2 relative">
          <div className="inline-block relative">
            <DarkSunLogo size={72} className="mb-3" />
            <Sparkles className="w-5 h-5 text-emerald-400 absolute -top-1 -right-2 animate-bounce" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-amber-200 to-purple-400 uppercase">
            XÁC THỰC THÀNH CÔNG
          </h1>
          <p className="text-xs font-medium text-slate-400">
            [MÀN HÌNH THỬ NGHIỆM TẠM THỜI - TỰ ĐỘNG THAY THẾ BỞI KANBAN BOARD]
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 shadow-inner">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-bold">Đăng nhập hệ thống thành công!</p>
            <p className="text-[11px] text-emerald-300/80">Phiên làm việc JWT Token đã được xác thực an toàn.</p>
          </div>
        </div>

        {user && (
          <div className="space-y-3 bg-[#0B1120]/80 p-5 rounded-2xl border border-amber-500/15 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{user.fullName}</h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 tracking-wider">
                {user.globalRole}
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Trạng thái phiên:
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  🟢 Active Session
                </span>
              </div>
              {token && (
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    JWT Access Token Preview:
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 bg-slate-900/90 p-2 rounded-lg break-all border border-slate-800">
                    {token.substring(0, 45)}...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-xs font-bold text-red-300 hover:text-red-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất khỏi hệ thống</span>
        </button>
      </div>
    </div>
  );
};
