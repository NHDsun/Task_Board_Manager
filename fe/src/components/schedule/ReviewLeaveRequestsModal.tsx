import React, { useState } from 'react';
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
  Sparkles,
  FileText,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useScheduleStore,
  type LeaveRequestRecord,
  type LeaveType,
  type WorkShift,
} from '../../store/useScheduleStore';

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

export const ReviewLeaveRequestsModal: React.FC<ReviewLeaveRequestsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const { leaveRequests, reviewLeaveRequest } = useScheduleStore();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [selectedReq, setSelectedReq] = useState<LeaveRequestRecord | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedStartDate, setModifiedStartDate] = useState('');
  const [modifiedEndDate, setModifiedEndDate] = useState('');
  const [modifiedShift, setModifiedShift] = useState<WorkShift>('FULL_DAY');

  if (!isOpen) return null;

  const filteredRequests = leaveRequests.filter((req) => {
    if (activeTab === 'PENDING') return req.status === 'PENDING';
    if (activeTab === 'APPROVED') return req.status === 'APPROVED' || req.status === 'APPROVED_MODIFIED';
    return true;
  });

  const handleSelectToReview = (req: LeaveRequestRecord) => {
    setSelectedReq(req);
    setResponseNote(req.responseNote || '');
    setModifiedStartDate(req.approvedStartDate || req.startDate);
    setModifiedEndDate(req.approvedEndDate || req.endDate);
    setModifiedShift(req.shift || 'FULL_DAY');
    setIsModifying(false);
  };

  const handleApprove = () => {
    if (!selectedReq) return;
    reviewLeaveRequest(
      selectedReq.id,
      isModifying ? 'APPROVED_MODIFIED' : 'APPROVED',
      authUser?.id || 'admin',
      authUser?.fullName || 'Quản lý Duyệt',
      responseNote.trim() || undefined,
      isModifying ? { startDate: modifiedStartDate, endDate: modifiedEndDate } : undefined,
      isModifying ? modifiedShift : selectedReq.shift
    );
    setSelectedReq(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl solar-glass-card rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-6 relative overflow-hidden animate-solar-warp-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Phê Duyệt &amp; Điều Chỉnh Đơn Phép / WFH
              </h2>
              <p className="text-xs text-slate-400">
                Khi duyệt đơn, lịch làm việc của nhân sự &amp; profile sẽ tự động cập nhật ngay lập tức.
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

        {/* Tab Filters */}
        <div className="flex items-center gap-2 shrink-0">
          {[
            { id: 'PENDING', label: 'Chờ Phê Duyệt', count: leaveRequests.filter((r) => r.status === 'PENDING').length },
            { id: 'APPROVED', label: 'Đã Duyệt', count: leaveRequests.filter((r) => r.status === 'APPROVED' || r.status === 'APPROVED_MODIFIED').length },
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
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-black/30 text-slate-950' : 'bg-slate-800 text-amber-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto flex-1 pr-1">
          {/* List column (5 cols) */}
          <div className="md:col-span-5 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Không có đơn nào trong danh sách</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const badge = getLeaveTypeBadge(req.type);
                const Icon = badge.icon;
                const isSelected = selectedReq?.id === req.id;
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
                      <span className={`font-bold ${
                        req.status === 'APPROVED' || req.status === 'APPROVED_MODIFIED'
                          ? 'text-emerald-400'
                          : req.status === 'REJECTED'
                          ? 'text-rose-400'
                          : 'text-amber-400 animate-pulse'
                      }`}>
                        {req.status === 'APPROVED' ? '✓ Đã Duyệt' : req.status === 'APPROVED_MODIFIED' ? '✓ Đã Điều Chỉnh' : req.status === 'REJECTED' ? '✕ Đã Từ Chối' : '⏳ Chờ Duyệt'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details & Review Action Column (7 cols) */}
          <div className="md:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
            {selectedReq ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{selectedReq.userName}</h3>
                    <p className="text-[11px] text-slate-400">Phòng ban: {selectedReq.departmentName || 'Engineering'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getLeaveTypeBadge(selectedReq.type).color}`}>
                    {getLeaveTypeBadge(selectedReq.type).label}
                  </span>
                </div>

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
                        <FileText className="w-3.5 h-3.5 text-amber-400" /> Kế hoạch bàn giao công việc:
                      </span>
                      <p className="text-slate-200 bg-black/40 p-2.5 rounded-xl border border-slate-800 mt-1 whitespace-pre-line">
                        {selectedReq.handoverPlan}
                      </p>
                    </div>
                  )}

                  {/* Khoảng thời gian & Ca làm việc */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Thời gian &amp; Ca áp dụng:</span>
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

                  {/* Chú thích của Quản lý */}
                  {selectedReq.status === 'PENDING' && (
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">
                        Chú thích / Phản hồi của Quản lý:
                      </label>
                      <textarea
                        rows={2}
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder="VD: Đồng ý duyệt, nhớ bàn giao task khẩn cho Tuấn..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none placeholder:text-slate-600 resize-none"
                      />
                    </div>
                  )}

                  {selectedReq.responseNote && selectedReq.status !== 'PENDING' && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300">
                      <span className="font-bold text-slate-400 block">Ghi chú duyệt của {selectedReq.approverName}:</span>
                      {selectedReq.responseNote}
                    </div>
                  )}
                </div>

                {/* Phê duyệt / Từ chối actions */}
                {selectedReq.status === 'PENDING' ? (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Từ Chối
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isModifying ? 'Duyệt Với Ngày Đã Chỉnh' : 'Duyệt Đơn Này'}
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
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs">Chọn một đơn từ danh sách bên trái để xem chi tiết và phê duyệt</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
