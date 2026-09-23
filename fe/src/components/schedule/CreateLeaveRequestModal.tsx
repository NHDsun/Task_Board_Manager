import React, { useState, useEffect, useMemo } from 'react';
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
  Briefcase,
  ShieldCheck,
  Ban,
  ListOrdered,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useScheduleStore,
  type LeaveType,
  type WorkShift,
} from '../../store/useScheduleStore';
import { useUserStore } from '../../store/useUserStore';
import { api } from '../../services/api';
import type { Task } from '../../types';
import {
  calculateLeaveImpact,
  calculateLeaveDays,
} from '../../services/workloadDispatcher';

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

/**
 * Modal dialog for submitting and tracking employee leave/WFH requests.
 * Includes automated workload impact analysis, smart handover recommendations,
 * and my-requests management with cancellation capability.
 */
export const CreateLeaveRequestModal: React.FC<CreateLeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const {
    addLeaveRequest,
    workSchedules,
    leaveRequests,
    cancelLeaveRequest,
    fetchSchedulesAndLeaves,
  } = useScheduleStore();
  const { users: directoryUsers, fetchUsers } = useUserStore();

  const [modalTab, setModalTab] = useState<'NEW' | 'HISTORY'>('NEW');
  const todayStr = new Date().toISOString().split('T')[0];
  const [leaveType, setLeaveType] = useState<LeaveType>('WFH');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [shift, setShift] = useState<WorkShift>('FULL_DAY');
  const [reason, setReason] = useState('');
  const [handoverPlan, setHandoverPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Fetch tasks and users when modal opens
  useEffect(() => {
    if (isOpen) {
      if (directoryUsers.length === 0) {
        fetchUsers();
      }
      fetchSchedulesAndLeaves();
      setIsLoadingTasks(true);
      api
        .get('/tasks')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setMyTasks(list);
        })
        .catch(() => {})
        .finally(() => setIsLoadingTasks(false));
    }
  }, [isOpen]);

  // Compute workload impact in real-time based on selected date range
  const leaveDays = useMemo(() => calculateLeaveDays(startDate, endDate), [startDate, endDate]);

  const impactItems = useMemo(() => {
    if (!authUser?.id || !startDate || !endDate) return [];
    return calculateLeaveImpact(
      myTasks,
      authUser.id,
      startDate,
      endDate,
      directoryUsers,
      workSchedules,
      leaveType
    );
  }, [myTasks, authUser?.id, startDate, endDate, directoryUsers, workSchedules, leaveType]);

  const urgentImpacts = impactItems.filter((i) => i.recommendedAction === 'TRANSFER');
  const standardImpacts = impactItems.filter((i) => i.recommendedAction === 'PAUSE_EXTEND');

  // Filter requests submitted by this user
  const myRequests = useMemo(() => {
    if (!authUser?.id) return [];
    return leaveRequests.filter((r) => r.userId === authUser.id);
  }, [leaveRequests, authUser?.id]);

  // Auto-generate handover plan text
  const handleAutoGenerateHandoverPlan = () => {
    if (leaveType === 'WFH') {
      setHandoverPlan('Làm việc từ xa (WFH) - Duy trì trực tuyến, tự quản lý và tiếp tục xử lý toàn bộ công việc đúng tiến độ.');
      return;
    }

    if (impactItems.length === 0) {
      setHandoverPlan('Hiện tại không có Task nào bị ảnh hưởng trong thời gian xin nghỉ.');
      return;
    }

    const lines: string[] = [];
    lines.push(`📋 KẾ HOẠCH BÀN GIAO & ĐIỀU PHỐI (${leaveDays} ngày nghỉ):`);

    if (urgentImpacts.length > 0) {
      lines.push('\n🔴 Task khẩn / đến hạn cần bàn giao:');
      urgentImpacts.forEach((imp, idx) => {
        const candidate = imp.recommendedAssignee?.fullName || 'Đồng nghiệp cùng team';
        lines.push(`  ${idx + 1}. [${imp.task.title}] ➔ Đề xuất chuyển cho: ${candidate}`);
      });
    }

    if (standardImpacts.length > 0) {
      lines.push('\n🟡 Task tiêu chuẩn đề xuất tạm dừng & gia hạn:');
      standardImpacts.forEach((imp, idx) => {
        lines.push(`  ${idx + 1}. [${imp.task.title}] ➔ Tạm dừng, gia hạn thêm +${leaveDays} ngày sau khi quay lại.`);
      });
    }

    setHandoverPlan(lines.join('\n'));
  };

  const handleCancelMyRequest = async (requestId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn xin phép này không?')) return;
    setCancellingId(requestId);
    try {
      await cancelLeaveRequest(requestId, authUser?.id || '');
      await fetchSchedulesAndLeaves();
      setErrorMsg(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy đơn');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      await addLeaveRequest({
        userId: authUser?.id || 'u-self',
        userName: authUser?.fullName || 'Nhân viên Solaris',
        userAvatar: authUser?.avatar,
        departmentName: authUser?.department?.name || 'Toàn công ty',
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
      <div className="w-full max-w-3xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-5 relative overflow-hidden animate-solar-warp-in max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Quản Lý Đơn Xin Phép / WFH <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Nộp đơn xin nghỉ, phân tích tác động công việc tự động và theo dõi lịch sử đơn đã nộp.
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

        {/* Tab Switcher: Nộp Đơn Mới vs Đơn Của Tôi */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setModalTab('NEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              modalTab === 'NEW'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tạo Đơn Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              modalTab === 'HISTORY'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Đơn Của Tôi ({myRequests.length})</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{errorMsg}</span>
              {errorMsg.includes('đã có đơn xin nghỉ') && (
                <p className="text-[11px] text-slate-400 font-normal">
                  💡 Bạn đã có đơn xin nghỉ trong ngày này. Hãy bấm vào tab <strong>"Đơn Của Tôi"</strong> để xem lại hoặc hủy đơn cũ nếu muốn nộp lại.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: FORM TẠO ĐƠN MỚI */}
        {modalTab === 'NEW' && (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
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
                  <option value="FULL_DAY">🌕 Cả ngày ({leaveDays} ngày)</option>
                  <option value="MORNING">🌅 Buổi sáng (0.5 ngày)</option>
                  <option value="AFTERNOON">🌆 Buổi chiều (0.5 ngày)</option>
                </select>
              </div>
            </div>

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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none placeholder:text-slate-500 resize-none font-sans"
              />
            </div>

            {/* ⚡ SMART WORKLOAD IMPACT ANALYSIS PREVIEW PANEL */}
            {leaveType === 'WFH' ? (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        Chế Độ Làm Việc Từ Xa (WFH)
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          Vẫn tiếp tục làm việc
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Khi làm việc từ xa (WFH), bạn vẫn trực tuyến và chịu trách nhiệm toàn bộ công việc như bình thường. Không cần bàn giao task hay dời hạn.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoGenerateHandoverPlan}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Tự Động Điền Kế Hoạch WFH
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        Phân Tích Tác Động Công Việc Tự Động
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {impactItems.length} Task Bị Ảnh Hưởng
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Hệ thống tự động phát hiện các công việc cần điều phối trong thời gian nghỉ {startDate} ➔ {endDate}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoGenerateHandoverPlan}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/40 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Tự Động Điền Kế Hoạch Bàn Giao
                  </button>
                </div>

                {isLoadingTasks ? (
                  <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                    Đang phân tích dữ liệu công việc...
                  </div>
                ) : impactItems.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Không có Task nào đang thực hiện trùng hạn trong khoảng thời gian này. Tiến độ dự án hoàn toàn an toàn!</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {impactItems.map((item) => {
                      const isUrgent = item.recommendedAction === 'TRANSFER';
                      return (
                        <div
                          key={item.task.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                            isUrgent
                              ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                                  isUrgent
                                    ? 'bg-rose-500 text-slate-950'
                                    : 'bg-slate-800 text-amber-300 border border-slate-700'
                                }`}
                              >
                                {item.task.priority}
                              </span>
                              <span className="font-bold text-white truncate">{item.task.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                              <span>Hạn chót: {item.task.dueDate?.split('T')[0] || 'Chưa đặt'}</span>
                              <span>•</span>
                              <span>Trạng thái: {item.task.status}</span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {isUrgent ? (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold text-[10px] block">
                                  ⚡ Khuyến nghị: Bàn giao
                                </span>
                                {item.recommendedAssignee && (
                                  <span className="text-[10px] text-amber-300 font-mono block">
                                    Gợi ý: {item.recommendedAssignee.fullName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-[10px] block">
                                  ⏸️ Tạm dừng &amp; Dời +{leaveDays} ngày
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none placeholder:text-slate-500 resize-none font-sans"
              />
            </div>

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
        )}

        {/* TAB 2: LỊCH SỬ ĐƠN CỦA TÔI */}
        {modalTab === 'HISTORY' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {myRequests.length === 0 ? (
              <div className="py-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Bạn chưa nộp đơn xin nghỉ hoặc WFH nào.</p>
              </div>
            ) : (
              myRequests.map((req) => {
                const opt = LEAVE_TYPE_OPTIONS.find((o) => o.id === req.type) || LEAVE_TYPE_OPTIONS[0];
                const Icon = opt.icon;
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED' || req.status === 'APPROVED_MODIFIED';

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-black/40 text-amber-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {req.startDate} ➔ {req.endDate} ({req.shift === 'FULL_DAY' ? 'Cả ngày' : req.shift === 'MORNING' ? 'Sáng' : 'Chiều'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : req.status === 'CANCELLED'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Đã Phê Duyệt
                            </>
                          ) : req.status === 'REJECTED' ? (
                            <>
                              <XCircle className="w-3 h-3" /> Đã Từ Chối
                            </>
                          ) : req.status === 'CANCELLED' ? (
                            <>
                              <Ban className="w-3 h-3" /> Đã Hủy
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Chờ Phê Duyệt
                            </>
                          )}
                        </span>

                        {(isPending || isApproved) && (
                          <button
                            type="button"
                            onClick={() => handleCancelMyRequest(req.id)}
                            disabled={cancellingId === req.id}
                            className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                          >
                            <Ban className="w-3 h-3" />
                            <span>{cancellingId === req.id ? 'Đang hủy...' : 'Hủy Đơn'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800/80 text-xs text-slate-300 italic">
                      "{req.reason}"
                    </div>

                    {req.responseNote && (
                      <div className="text-[11px] text-amber-300 font-sans">
                        <strong>Phản hồi từ Quản lý:</strong> {req.responseNote}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
