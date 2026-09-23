import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  Palmtree,
  Stethoscope,
  Plane,
  Edit3,
  FileText,
  User,
  Briefcase,
  ArrowRight,
  RefreshCw,
  Check,
  Zap,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useScheduleStore,
  normalizeLeaveStatus,
  type LeaveRequestRecord,
  type LeaveType,
  type WorkShift,
} from '../../store/useScheduleStore';
import { useUserStore } from '../../store/useUserStore';
import { api } from '../../services/api';
import type { Task } from '../../types';
import {
  calculateLeaveImpact,
  executeDispatchPlan,
  type TaskImpactItem,
  type DispatchActionType,
} from '../../services/workloadDispatcher';

interface ReviewLeaveRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getLeaveTypeBadge = (type: LeaveType) => {
  switch (type) {
    case 'WFH':
      return {
        label: 'Làm Từ Xa (WFH)',
        icon: Home,
        color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      };
    case 'ANNUAL_LEAVE':
      return {
        label: 'Phép Năm',
        icon: Palmtree,
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    case 'SICK_LEAVE':
      return {
        label: 'Nghỉ Ốm',
        icon: Stethoscope,
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      };
    default:
      return {
        label: 'Công Tác / Khác',
        icon: Plane,
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      };
  }
};

/**
 * Enhanced Cockpit Modal dialog allowing managers to review, approve, modify,
 * and automatically dispatch workload when approving employee leave requests.
 */
export const ReviewLeaveRequestsModal: React.FC<ReviewLeaveRequestsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const { leaveRequests, reviewLeaveRequest, workSchedules, fetchSchedulesAndLeaves } = useScheduleStore();
  const { users: directoryUsers, fetchUsers } = useUserStore();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [selectedReq, setSelectedReq] = useState<LeaveRequestRecord | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedStartDate, setModifiedStartDate] = useState('');
  const [modifiedEndDate, setModifiedEndDate] = useState('');
  const [modifiedShift, setModifiedShift] = useState<WorkShift>('FULL_DAY');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [impactPlan, setImpactPlan] = useState<TaskImpactItem[]>([]);
  const [isExecutingDispatch, setIsExecutingDispatch] = useState(false);
  const [dispatchResultNotice, setDispatchResultNotice] = useState<string | null>(null);

  // Load all tasks, schedules, leaves and users for impact evaluation
  const loadInitialData = async () => {
    setIsLoadingTasks(true);
    try {
      await Promise.all([
        directoryUsers.length === 0 ? fetchUsers() : Promise.resolve(),
        fetchSchedulesAndLeaves(),
        api
          .get('/tasks')
          .then((res) => {
            const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
            setTasks(list);
          })
          .catch(() => {}),
      ]);
    } catch (err) {
      console.error('Lỗi nạp danh sách tasks và đơn nghỉ phép:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const filteredRequests = leaveRequests.filter((req) => {
    const s = normalizeLeaveStatus(req.status);
    if (activeTab === 'PENDING') return s === 'PENDING';
    if (activeTab === 'APPROVED') return s === 'APPROVED' || s === 'APPROVED_MODIFIED';
    return true;
  });

  const handleSelectToReview = (req: LeaveRequestRecord) => {
    setSelectedReq(req);
    setResponseNote(req.responseNote || '');
    const start = req.approvedStartDate || req.startDate;
    const end = req.approvedEndDate || req.endDate;
    setModifiedStartDate(start);
    setModifiedEndDate(end);
    setModifiedShift(req.shift || 'FULL_DAY');
    setIsModifying(false);
    setDispatchResultNotice(null);

    // Compute initial dispatch plan for this user
    const impacts = calculateLeaveImpact(
      tasks,
      req.userId,
      start,
      end,
      directoryUsers,
      workSchedules,
      req.type
    );
    setImpactPlan(impacts);
  };

  // Re-calculate impact when dates are modified
  useEffect(() => {
    if (selectedReq) {
      const start = isModifying ? modifiedStartDate : selectedReq.approvedStartDate || selectedReq.startDate;
      const end = isModifying ? modifiedEndDate : selectedReq.approvedEndDate || selectedReq.endDate;
      if (start && end) {
        const impacts = calculateLeaveImpact(
          tasks,
          selectedReq.userId,
          start,
          end,
          directoryUsers,
          workSchedules,
          selectedReq.type
        );
        setImpactPlan(impacts);
      }
    }
  }, [isModifying, modifiedStartDate, modifiedEndDate, tasks, directoryUsers, workSchedules, selectedReq]);

  // Handler to update an action for a specific task
  const handleUpdateTaskAction = (taskId: string, action: DispatchActionType) => {
    setImpactPlan((prev) =>
      prev.map((item) => (item.task.id === taskId ? { ...item, selectedAction: action } : item))
    );
  };

  // Handler to change target assignee
  const handleUpdateTaskAssignee = (taskId: string, newAssigneeId: string) => {
    setImpactPlan((prev) =>
      prev.map((item) =>
        item.task.id === taskId ? { ...item, selectedAssigneeId: newAssigneeId } : item
      )
    );
  };

  // Handler to change extended days
  const handleUpdateTaskExtendDays = (taskId: string, days: number) => {
    setImpactPlan((prev) =>
      prev.map((item) =>
        item.task.id === taskId ? { ...item, selectedExtendDays: Math.max(1, days) } : item
      )
    );
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setIsExecutingDispatch(true);

    try {
      // 1. Approve Leave Request in backend
      await reviewLeaveRequest(
        selectedReq.id,
        isModifying ? 'APPROVED_MODIFIED' : 'APPROVED',
        authUser?.id || 'admin',
        authUser?.fullName || 'Quản lý Duyệt',
        responseNote.trim() || undefined,
        isModifying ? { startDate: modifiedStartDate, endDate: modifiedEndDate } : undefined,
        isModifying ? modifiedShift : selectedReq.shift
      );

      // 2. Execute Automated Dispatch Plan if there are affected tasks
      if (impactPlan.length > 0) {
        const result = await executeDispatchPlan(
          impactPlan,
          {
            id: selectedReq.id,
            userId: selectedReq.userId,
            userName: selectedReq.userName,
            startDate: isModifying ? modifiedStartDate : selectedReq.startDate,
            endDate: isModifying ? modifiedEndDate : selectedReq.endDate,
          },
          {
            id: authUser?.id,
            fullName: authUser?.fullName,
          }
        );

        setDispatchResultNotice(
          `🚀 Đã duyệt đơn và hoàn tất tự động điều phối: ${result.transferredCount} task bàn giao, ${result.pausedCount} task tạm dừng & dời hạn.`
        );
      }

      // Reload tasks list to reflect new assignees and statuses
      const res = await api.get('/tasks');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTasks(list);

      setSelectedReq(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi trong quá trình phê duyệt và điều phối');
    } finally {
      setIsExecutingDispatch(false);
    }
  };

  const handleReject = () => {
    if (!selectedReq) return;
    reviewLeaveRequest(
      selectedReq.id,
      'REJECTED',
      authUser?.id || 'admin',
      authUser?.fullName || 'Quản lý Duyệt',
      responseNote.trim() || 'Không được phê duyệt'
    );
    setSelectedReq(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/40 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Cockpit Phê Duyệt &amp; Điều Phối Công Việc Thông Minh
              </h2>
              <p className="text-xs text-slate-400">
                Tự động đánh giá tải việc, đề xuất bàn giao và dời deadline đồng loạt khi duyệt đơn nghỉ phép / WFH.
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

        {/* Global Result Banner */}
        {dispatchResultNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{dispatchResultNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          {[
            {
              id: 'PENDING',
              label: 'Chờ Phê Duyệt',
              count: leaveRequests.filter((r) => normalizeLeaveStatus(r.status) === 'PENDING').length,
            },
            {
              id: 'APPROVED',
              label: 'Đã Duyệt',
              count: leaveRequests.filter((r) => {
                const s = normalizeLeaveStatus(r.status);
                return s === 'APPROVED' || s === 'APPROVED_MODIFIED';
              }).length,
            },
            { id: 'ALL', label: 'Tất Cả', count: leaveRequests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === tab.id ? 'bg-black/30 text-slate-950' : 'bg-slate-800 text-amber-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto flex-1 pr-1">
          {/* LEFT COLUMN: REQUESTS LIST */}
          <div className="md:col-span-4 space-y-2.5 overflow-y-auto max-h-[560px] pr-1">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {activeTab === 'PENDING'
                    ? 'Hiện không có đơn nào đang chờ duyệt.'
                    : 'Không có đơn nào trong danh sách.'}
                </p>
                {activeTab === 'PENDING' && leaveRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('APPROVED')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Xem {leaveRequests.length} đơn đã duyệt</span> ➔
                  </button>
                )}
              </div>
            ) : (
              filteredRequests.map((req) => {
                const badge = getLeaveTypeBadge(req.type);
                const Icon = badge.icon;
                const isSelected = selectedReq?.id === req.id;
                const normStatus = normalizeLeaveStatus(req.status);
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectToReview(req)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {req.userAvatar ? (
                          <img src={req.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-white">{req.userName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 italic">
                      "{req.reason}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{req.startDate} ➔ {req.endDate}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                          {req.shift === 'MORNING' ? '🌅 Sáng' : req.shift === 'AFTERNOON' ? '🌆 Chiều' : '🌕 Cả ngày'}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          normStatus === 'APPROVED' || normStatus === 'APPROVED_MODIFIED'
                            ? 'text-emerald-400'
                            : normStatus === 'REJECTED'
                            ? 'text-rose-400'
                            : normStatus === 'CANCELLED'
                            ? 'text-slate-400'
                            : 'text-amber-400 animate-pulse'
                        }`}
                      >
                        {normStatus === 'APPROVED'
                          ? '✓ Đã Duyệt'
                          : normStatus === 'APPROVED_MODIFIED'
                          ? '✓ Đã Điều Chỉnh'
                          : normStatus === 'REJECTED'
                          ? '✕ Đã Từ Chối'
                          : normStatus === 'CANCELLED'
                          ? '⊘ Đã Hủy'
                          : '⏳ Chờ Duyệt'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: DISPATCHER COCKPIT */}
          <div className="md:col-span-8 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between overflow-y-auto max-h-[560px]">
            {selectedReq ? (
              <div className="space-y-4">
                {/* Header Profile & Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      {selectedReq.userName}
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                        {selectedReq.departmentName || 'Engineering'}
                      </span>
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getLeaveTypeBadge(selectedReq.type).color}`}>
                    {getLeaveTypeBadge(selectedReq.type).label}
                  </span>
                </div>

                {/* Reason & Handover Plan from Employee */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Lý do xin nghỉ / WFH:</span>
                    <p className="text-slate-200 bg-black/40 p-2.5 rounded-xl border border-slate-800 mt-1">
                      {selectedReq.reason}
                    </p>
                  </div>

                  {selectedReq.handoverPlan && (
                    <div>
                      <span className="text-slate-400 font-bold block flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-amber-400" /> Kế hoạch bàn giao của nhân sự:
                      </span>
                      <p className="text-slate-200 bg-black/40 p-2.5 rounded-xl border border-slate-800 mt-1 whitespace-pre-line font-sans leading-relaxed">
                        {selectedReq.handoverPlan}
                      </p>
                    </div>
                  )}

                  {/* Dates & Shift Adjustment Card */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Thời gian &amp; Ca áp dụng:
                      </span>
                      {selectedReq.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => setIsModifying(!isModifying)}
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> {isModifying ? 'Hủy chỉnh sửa' : 'Điều chỉnh ngày & ca'}
                        </button>
                      )}
                    </div>

                    {isModifying ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block">Từ ngày</label>
                            <input
                              type="date"
                              value={modifiedStartDate}
                              onChange={(e) => setModifiedStartDate(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">Đến ngày</label>
                            <input
                              type="date"
                              value={modifiedEndDate}
                              onChange={(e) => setModifiedEndDate(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Ca làm việc điều chỉnh</label>
                          <select
                            value={modifiedShift}
                            onChange={(e) => setModifiedShift(e.target.value as any)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                          >
                            <option value="FULL_DAY">🌕 Cả ngày (Full-Day)</option>
                            <option value="MORNING">🌅 Buổi sáng (0.5 ngày)</option>
                            <option value="AFTERNOON">🌆 Buổi chiều (0.5 ngày)</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="font-mono text-amber-300 font-bold">
                          {selectedReq.approvedStartDate || selectedReq.startDate} ➔ {selectedReq.approvedEndDate || selectedReq.endDate}
                        </div>
                        <div className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {selectedReq.shift === 'MORNING'
                            ? '🌅 Ca Sáng (0.5 ngày)'
                            : selectedReq.shift === 'AFTERNOON'
                            ? '🌆 Ca Chiều (0.5 ngày)'
                            : '🌕 Cả Ngày (Full-Day)'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🚀 SMART WORKLOAD DISPATCHER MATRIX / WFH BANNER */}
                  {normalizeLeaveStatus(selectedReq.status) === 'PENDING' && (
                    selectedReq.type === 'WFH' ? (
                      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                            <Home className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                              Chế Độ Làm Việc Từ Xa (WFH)
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                Tiếp tục làm việc bình thường
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Nhân sự vẫn trực tuyến và chịu trách nhiệm toàn bộ công việc tại nhà. Hệ thống không yêu cầu bàn giao hay hoãn thời hạn task.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-purple-950/20 border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                Bộ Điều Phối Công Việc Thông Minh
                                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                                  {impactPlan.length} Task Cần Xử Lý
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                Hệ thống tự động đề xuất phương án tối ưu dựa trên phòng ban, chuyên môn và tải việc
                              </p>
                            </div>
                          </div>
                        </div>

                        {isLoadingTasks ? (
                          <div className="py-3 text-center text-xs text-slate-400 animate-pulse flex items-center justify-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang đồng bộ ma trận điều phối...
                          </div>
                        ) : impactPlan.length === 0 ? (
                          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Nhân sự này không có Task nào đang dở dang trong thời gian nghỉ. Tiến độ an toàn!</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {impactPlan.map((item) => {
                              const isUrgent = item.recommendedAction === 'TRANSFER';
                              return (
                                <div
                                  key={item.task.id}
                                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black ${
                                            isUrgent
                                              ? 'bg-rose-500 text-slate-950'
                                              : 'bg-slate-800 text-amber-300 border border-slate-700'
                                          }`}
                                        >
                                          {item.task.priority}
                                        </span>
                                        <span className="font-bold text-white text-xs truncate">
                                          {item.task.title}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                                        <span>Hạn chót: {item.task.dueDate?.split('T')[0] || 'Chưa đặt'}</span>
                                        <span>•</span>
                                        <span>Trạng thái: {item.task.status}</span>
                                      </div>
                                    </div>

                                    {/* Action Switcher */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTaskAction(item.task.id, 'TRANSFER')}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                          item.selectedAction === 'TRANSFER'
                                            ? 'bg-rose-500 text-slate-950 font-black shadow-md'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        ⚡ Bàn Giao
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTaskAction(item.task.id, 'PAUSE_EXTEND')}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                          item.selectedAction === 'PAUSE_EXTEND'
                                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        ⏸️ Dời Hạn
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTaskAction(item.task.id, 'KEEP')}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                          item.selectedAction === 'KEEP'
                                            ? 'bg-slate-200 text-slate-950 font-black'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        🛡️ Giữ
                                      </button>
                                    </div>
                                  </div>

                                  {/* Detailed Control Row based on Action */}
                                  {item.selectedAction === 'TRANSFER' && (
                                    <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3 text-amber-400" /> Chuyển giao cho:
                                      </span>
                                      <select
                                        value={item.selectedAssigneeId || ''}
                                        onChange={(e) => handleUpdateTaskAssignee(item.task.id, e.target.value)}
                                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none focus:border-amber-500 font-sans"
                                      >
                                        {item.candidates.map((cand) => (
                                          <option key={cand.user.id} value={cand.user.id}>
                                            {cand.user.fullName} ({cand.user.profession}) — Điểm: {cand.score}% ({cand.activeTaskCount} task)
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  {item.selectedAction === 'PAUSE_EXTEND' && (
                                    <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-amber-400" /> Tự động chuyển PAUSED &amp; Gia hạn thêm:
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="number"
                                          min={1}
                                          max={30}
                                          value={item.selectedExtendDays}
                                          onChange={(e) =>
                                            handleUpdateTaskExtendDays(item.task.id, parseInt(e.target.value) || 1)
                                          }
                                          className="w-14 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[11px] text-amber-300 font-bold">ngày</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {normalizeLeaveStatus(selectedReq.status) === 'PENDING' && (
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">
                        Chú thích / Phản hồi của Quản lý:
                      </label>
                      <textarea
                        rows={2}
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder={
                          selectedReq.type === 'WFH'
                            ? 'VD: Đồng ý duyệt làm việc từ xa, đảm bảo hoàn thành task đúng tiến độ...'
                            : 'VD: Đồng ý duyệt, hệ thống đã tự động điều phối các task khẩn...'
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none placeholder:text-slate-600 resize-none font-sans"
                      />
                    </div>
                  )}

                  {selectedReq.responseNote && normalizeLeaveStatus(selectedReq.status) !== 'PENDING' && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300">
                      <span className="font-bold text-slate-400 block">Ghi chú duyệt của {selectedReq.approverName || 'Quản lý'}:</span>
                      {selectedReq.responseNote}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                {normalizeLeaveStatus(selectedReq.status) === 'PENDING' ? (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={handleReject}
                      disabled={isExecutingDispatch}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Từ Chối Đơn
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isExecutingDispatch}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingDispatch ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Đang Phê Duyệt &amp; Điều Phối...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {selectedReq.type === 'WFH'
                              ? 'Phê Duyệt Đơn WFH'
                              : impactPlan.length > 0
                              ? `Phê Duyệt & Tự Động Điều Phối (${impactPlan.length} Task)`
                              : 'Phê Duyệt Đơn Này'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 text-center text-xs text-slate-400 font-mono">
                    Đơn này đã được xử lý bởi <span className="text-white font-bold">{selectedReq.approverName || 'Quản lý'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2 m-auto">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs">Chọn một đơn từ danh sách bên trái để xem chi tiết, phân tích tác động và điều phối công việc</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
