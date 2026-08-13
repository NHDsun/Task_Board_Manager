import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteTaskConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  isSubmitting?: boolean;
}

export const DeleteTaskConfirmModal: React.FC<DeleteTaskConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)] relative overflow-hidden space-y-6 animate-solar-warp-in">
        {/* Glow Header background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Icon & Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Xác Nhận Xóa Nhiệm Vụ</h2>
            <p className="text-xs text-rose-300 font-mono">Dành riêng cho Cấp Quản Lý & Admin</p>
          </div>
        </div>

        {/* Warning Body */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-xs space-y-2">
          <p className="text-slate-300">
            Bạn có chắc chắn muốn xóa vĩnh viễn Nhiệm Vụ:
          </p>
          <p className="font-extrabold text-rose-300 text-sm bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/40 break-words">
            "{taskTitle}"
          </p>
          <p className="text-[11px] text-slate-400 italic">
            ⚠️ Lưu ý: Hành động này sẽ xóa hoàn toàn Task và toàn bộ bình luận, lịch sử chuyển giao khỏi CSDL PostgreSQL và không thể hoàn tác!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 cursor-pointer transition-all"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-rose-950/50 flex items-center gap-2 cursor-pointer transition-all border border-rose-400/30"
          >
            <Trash2 className="w-4 h-4" />
            {isSubmitting ? 'Đang Xóa...' : 'Xác Nhận Xóa Vĩnh Viễn'}
          </button>
        </div>
      </div>
    </div>
  );
};
