import React from 'react';
import { ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';

export interface SolarNotification {
  isOpen: boolean;
  type?: 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
}

export const SolarNotificationModal: React.FC<SolarNotification> = ({
  isOpen,
  type = 'warning',
  title,
  message,
  onClose,
  confirmText,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          border: 'border-emerald-500/40',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          title: title || 'Thành Công',
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-cyan-400',
          border: 'border-cyan-500/40',
          glow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          title: title || 'Thông Báo',
        };
      default:
        return {
          icon: ShieldAlert,
          iconColor: 'text-amber-400',
          border: 'border-amber-500/40',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          title: title || 'Cảnh Báo Hệ Thống',
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-md solar-glass-card p-6 rounded-3xl bg-[#0F172A]/95 border ${styles.border} ${styles.glow} relative overflow-hidden space-y-5 animate-solar-warp-in`}>
        {/* Background Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider uppercase ${styles.badge}`}>
              {styles.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Message Content */}
        <div className="py-2">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {onConfirm ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="solar-corona-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer"
              >
                {confirmText || 'Xác Nhận'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="solar-corona-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer"
            >
              Đã Hiểu (Close)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
