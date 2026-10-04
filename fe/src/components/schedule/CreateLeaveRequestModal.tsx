import React, { useState } from 'react';
import {
  X,
  Calendar,
  Send,
  Home,
  Palmtree,
  Stethoscope,
  Plane,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useScheduleStore, type LeaveType, type WorkShift } from '../../store/useScheduleStore';

interface CreateLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LEAVE_TYPE_OPTIONS: Array<{
  id: LeaveType;
  label: string;
  icon: any;
  color: string;
  desc: string;
}> = [
  {
    id: 'WFH',
    label: 'Làm Việc Từ Xa (WFH)',
    icon: Home,
    color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/40',
    desc: 'Làm việc tại nhà nhưng vẫn online và xử lý công việc đầy đủ',
  },
  {
    id: 'ANNUAL_LEAVE',
    label: 'Nghỉ Phép Năm',
    icon: Palmtree,
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
    desc: 'Nghỉ phép theo chế độ phép năm có hưởng lương',
  },
  {
    id: 'SICK_LEAVE',
    label: 'Nghỉ Ốm Đau',
    icon: Stethoscope,
    color: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
    desc: 'Nghỉ ốm theo chế độ bảo hiểm y tế hoặc dưỡng bệnh',
  },
  {
    id: 'UNPAID_LEAVE',
    label: 'Nghỉ Không Lương',
    icon: Clock,
    color: 'text-slate-400 bg-slate-500/20 border-slate-500/40',
    desc: 'Nghỉ việc riêng không hưởng lương',
  },
  {
    id: 'OTHER',
    label: 'Đi Công Tác / Lý Do Khác',
    icon: Plane,
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
    desc: 'Đi công tác ngoài văn phòng hoặc sự vụ đột xuất',
  },
];

export const CreateLeaveRequestModal: React.FC<CreateLeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const { addLeaveRequest } = useScheduleStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const [leaveType, setLeaveType] = useState<LeaveType>('WFH');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [shift, setShift] = useState<WorkShift>('FULL_DAY');
  const [reason, setReason] = useState('');
  const [handoverPlan, setHandoverPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do xin nghỉ / làm việc từ xa!');
      return;
    }

    if (startDate > endDate) {
      setErrorMsg('Ngày bắt đầu không được lớn hơn ngày kết thúc!');
      return;
    }

    setIsSubmitting(true);

    try {
      addLeaveRequest({
        userId: authUser?.id || 'u-self',
        userName: authUser?.fullName || 'Nhân viên Solaris',
        userAvatar: authUser?.avatar,
        departmentName: 'Engineering',
        type: leaveType,
        startDate,
        endDate,
        shift,
        reason: reason.trim(),
        handoverPlan: handoverPlan.trim() || undefined,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gửi đơn thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Tạo Đơn Xin Phép / WFH <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Gửi đề xuất đến Quản lý. Khi được duyệt, lịch làm việc &amp; profile sẽ tự động cập nhật.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Chọn loại đơn */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Loại hình đề xuất <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEAVE_TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = leaveType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLeaveType(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? `${opt.color} shadow-lg scale-101 ring-1 ring-amber-400/40`
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-black/40 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black block text-white">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Chọn khoảng thời gian & Ca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Từ Ngày <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Đến Ngày <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Khung Giờ / Ca <span className="text-rose-400">*</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as WorkShift)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="FULL_DAY">🌕 Cả ngày (Full-Day)</option>
                <option value="MORNING">🌅 Buổi sáng (0.5 ngày)</option>
                <option value="AFTERNOON">🌆 Buổi chiều (0.5 ngày)</option>
              </select>
            </div>
          </div>

          {/* 3. Lý do chi tiết */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Lý Do Chi Tiết <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Cần làm việc tại nhà để xử lý việc gia đình / Xin nghỉ phép năm đi du lịch..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* 4. Kế hoạch bàn giao công việc / Xử lý Task */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Kế Hoạch Bàn Giao &amp; Đề Xuất Task
              </span>
              <span className="text-[10px] text-slate-400 font-normal font-mono">Không bắt buộc</span>
            </label>
            <textarea
              rows={3}
              value={handoverPlan}
              onChange={(e) => setHandoverPlan(e.target.value)}
              placeholder="VD: Bàn giao các task khẩn cho anh Tuấn; các task Sprint vẫn đảm bảo nộp đúng hạn qua PR..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang Gửi...' : 'Gửi Đơn Phê Duyệt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
