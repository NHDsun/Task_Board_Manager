import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, XCircle, Clock, ShieldAlert, Send, Ban, Filter, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

interface TaskTransferInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RequestItem {
  id: string;
  taskId: string;
  taskTitle: string;
  priority: string;
  type?: 'TRANSFER' | 'ASSIST' | 'SUBTASK_APPROVAL' | string;
  senderName?: string;
  senderAvatar?: string;
  receiverName?: string;
  receiverAvatar?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  note: string;
  createdAt: string;
}

export const TaskTransferInboxModal: React.FC<TaskTransferInboxModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [filterType, setFilterType] = useState<'ALL' | 'APPROVAL' | 'TRANSFER' | 'ASSIST'>('ALL');
  const [incomingRequests, setIncomingRequests] = useState<RequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      const [incRes, outRes] = await Promise.all([
        api.get('/tasks/requests/incoming'),
        api.get('/tasks/requests/outgoing'),
      ]);

      const incList = Array.isArray(incRes.data) ? incRes.data : incRes.data?.data || [];
      setIncomingRequests(incList);

      const outList = Array.isArray(outRes.data) ? outRes.data : outRes.data?.data || [];
      setOutgoingRequests(outList);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllRequests();
    }
  }, [isOpen]);

  const handleRespond = async (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
    setProcessingId(requestId);
    try {
      await api.patch(`/tasks/requests/${requestId}/respond`, { action, reason });
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
      fetchAllRequests();
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể phản hồi yêu cầu';
      alert(errMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await api.patch(`/tasks/requests/${requestId}/cancel`);
      fetchAllRequests();
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể hủy yêu cầu';
      alert(errMsg);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  const roleName = (() => {
    if (currentUser?.globalRole === 'ADMIN' || (currentUser as any)?.role === 'ADMIN') return 'Quản Trị Viên (Admin)';
    if (currentUser?.globalRole === 'MANAGER' || (currentUser as any)?.role === 'MANAGER') return 'Quản Lý Dự Án';
    return 'Nhân Viên';
  })();

  const isApprovalReq = (r: RequestItem) => r.type === 'SUBTASK_APPROVAL' || r.note?.includes('[Xác thực hoàn thành]');
  const isTransferReq = (r: RequestItem) => r.type === 'TRANSFER' || (!isApprovalReq(r) && !r.note?.includes('hỗ trợ'));
  const isAssistReq = (r: RequestItem) => r.type === 'ASSIST' || r.note?.includes('hỗ trợ');

  const filteredIncoming = incomingRequests.filter((r) => {
    if (filterType === 'APPROVAL') return isApprovalReq(r);
    if (filterType === 'TRANSFER') return isTransferReq(r);
    if (filterType === 'ASSIST') return isAssistReq(r);
    return true;
  });

  const approvalCount = incomingRequests.filter(isApprovalReq).length;
  const transferCount = incomingRequests.filter(isTransferReq).length;
  const assistCount = incomingRequests.filter(isAssistReq).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden space-y-6 animate-solar-warp-in">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Trung Tâm Thông Báo & Yêu Cầu Tổng Hợp
              </h2>
              <p className="text-xs text-slate-400">
                Tài khoản: <strong className="text-amber-300">{currentUser?.fullName || 'Bạn'}</strong> ({roleName}) • Cập nhật thông báo theo thời gian thực
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: Incoming vs Outgoing */}
        <div className="flex items-center gap-3 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            Yêu Cầu & Thông Báo Đến ({incomingRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-purple-500 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            Yêu Cầu Bạn Đã Gửi ({outgoingRequests.length})
          </button>
        </div>

        {/* Quick Filter Chips for Incoming Requests */}
        {activeTab === 'incoming' && incomingRequests.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" /> Bộ lọc:
            </span>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                filterType === 'ALL'
                  ? 'bg-slate-200 text-slate-950 border-white'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Tất Cả ({incomingRequests.length})
            </button>
            <button
              onClick={() => setFilterType('APPROVAL')}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                filterType === 'APPROVAL'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                  : 'bg-slate-900 text-cyan-300/80 border-slate-800 hover:text-cyan-200'
              }`}
            >
              🔍 Duyệt Task Con ({approvalCount})
            </button>
            <button
              onClick={() => setFilterType('TRANSFER')}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                filterType === 'TRANSFER'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                  : 'bg-slate-900 text-amber-300/80 border-slate-800 hover:text-amber-200'
              }`}
            >
              🔄 Bàn Giao ({transferCount})
            </button>
            <button
              onClick={() => setFilterType('ASSIST')}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                filterType === 'ASSIST'
                  ? 'bg-purple-500 text-white border-purple-400 font-extrabold'
                  : 'bg-slate-900 text-purple-300/80 border-slate-800 hover:text-purple-200'
              }`}
            >
              🤝 Hỗ Trợ ({assistCount})
            </button>
          </div>
        )}

        {/* Request List Body */}
        <div className="space-y-4 max-h-[52vh] overflow-y-auto text-xs pr-1">
          {isLoading && (
            <div className="text-center py-8 text-amber-400 animate-pulse font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Đang tải danh sách thông báo & yêu cầu...
            </div>
          )}

          {/* TAB 1: INCOMING REQUESTS */}
          {activeTab === 'incoming' && !isLoading && (
            <>
              {filteredIncoming.length === 0 ? (
                <div className="text-center py-10 space-y-3 solar-glass-card rounded-2xl bg-slate-950/60 border border-slate-800">
                  <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">Không Có Yêu Cầu Nào Trong Hộp Thư</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-[11px]">
                    Hiện tại tài khoản của bạn không có thông báo duyệt bài hoặc yêu cầu bàn giao nào đang chờ xử lý.
                  </p>
                </div>
              ) : (
                filteredIncoming.map((r) => {
                  const isApproval = isApprovalReq(r);
                  const isAssist = isAssistReq(r);

                  return (
                    <div
                      key={r.id}
                      className={`solar-glass-card p-5 rounded-2xl bg-slate-950/80 border space-y-3 transition-all shadow-lg hover:border-amber-400 ${
                        isApproval
                          ? 'border-cyan-500/40 bg-gradient-to-r from-cyan-950/20 to-slate-950/80'
                          : isAssist
                          ? 'border-purple-500/40 bg-gradient-to-r from-purple-950/20 to-slate-950/80'
                          : 'border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400 bg-slate-900 flex items-center justify-center font-bold text-amber-400 shrink-0">
                            {r.senderAvatar ? (
                              <img src={r.senderAvatar} alt="Sender" className="w-full h-full object-cover" />
                            ) : (
                              <span>{r.senderName ? r.senderName.slice(0, 2).toUpperCase() : 'SD'}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono">Người Gửi Yêu Cầu:</span>
                            <h4 className="font-extrabold text-white text-sm">{r.senderName}</h4>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 pt-0.5">
                              <Clock className="w-3 h-3 text-amber-400" /> {r.createdAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isApproval ? (
                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-mono font-black text-[10px] animate-pulse flex items-center gap-1">
                              🔍 DUYỆT TASK CON
                            </span>
                          ) : isAssist ? (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/50 font-mono font-bold text-[10px] flex items-center gap-1">
                              🤝 NHỜ HỖ TRỢ
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono font-bold text-[10px] flex items-center gap-1">
                              🔄 BÀN GIAO TASK
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[9px]">
                            {r.priority}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-amber-300 block">
                          {isApproval ? 'Task Cần Nghiệm Thu Hoàn Thành:' : isAssist ? 'Task Cần Phối Hợp Hỗ Trợ:' : 'Task Chuyển Giao Quyền PhỤ Trách:'}
                        </span>
                        <p className="font-extrabold text-white text-sm">{r.taskTitle}</p>
                        <p className="text-slate-300 italic pt-1">"{r.note}"</p>
                      </div>

                      <div className="flex justify-end gap-3 pt-1">
                        <button
                          onClick={() => {
                            let reason = undefined;
                            if (isApproval) {
                              const input = window.prompt('Nhập lý do từ chối nghiệm thu Task con (bắt buộc để nhân viên sửa):');
                              if (input === null) return;
                              reason = input.trim() || 'Chưa đạt yêu cầu chất lượng';
                            }
                            handleRespond(r.id, 'REJECTED', reason);
                          }}
                          disabled={processingId === r.id}
                          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Từ Chối
                        </button>

                        <button
                          onClick={() => handleRespond(r.id, 'APPROVED')}
                          disabled={processingId === r.id}
                          className="solar-corona-btn px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-md disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          {isApproval ? '✓ Phê Duyệt Nghiệm Thu' : isAssist ? '✓ Đồng Ý Hỗ Trợ' : '✓ Tiếp Nhận Task'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: OUTGOING REQUESTS */}
          {activeTab === 'outgoing' && !isLoading && (
            <>
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-10 space-y-3 solar-glass-card rounded-2xl bg-slate-950/60 border border-slate-800">
                  <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">Chưa Gửi Yêu Cầu Nào</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-[11px]">
                    Bạn chưa gửi yêu cầu bàn giao hoặc yêu cầu duyệt nào cho đồng nghiệp.
                  </p>
                </div>
              ) : (
                outgoingRequests.map((r) => {
                  const statusConfig = {
                    PENDING: { label: 'Đang Chờ Duyệt', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
                    APPROVED: { label: 'Đã Phê Duyệt', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                    REJECTED: { label: 'Đã Từ Chối', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
                    CANCELLED: { label: 'Đã Hủy Yêu Cầu', color: 'text-slate-400 border-slate-700 bg-slate-900' },
                  }[r.status || 'PENDING'];

                  return (
                    <div
                      key={r.id}
                      className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3 hover:border-purple-400 transition-all shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-400 bg-slate-900 flex items-center justify-center font-bold text-purple-400 shrink-0">
                            {r.receiverAvatar ? (
                              <img src={r.receiverAvatar} alt="Receiver" className="w-full h-full object-cover" />
                            ) : (
                              <span>{r.receiverName ? r.receiverName.slice(0, 2).toUpperCase() : 'RC'}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-purple-300 font-mono">Người Tiếp Nhận:</span>
                            <h4 className="font-extrabold text-white text-sm">{r.receiverName}</h4>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 pt-0.5">
                              <Clock className="w-3 h-3 text-purple-400" /> {r.createdAt}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[10px] ${statusConfig.color}`}>
                          TRẠNG THÁI: {statusConfig.label}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-purple-300 block">Task Liên Quan:</span>
                        <p className="font-extrabold text-white text-sm">{r.taskTitle}</p>
                        <p className="text-slate-300 italic pt-1">"{r.note}"</p>
                      </div>

                      {/* NÚT HỦY DÀNH CHO TASK PENDING */}
                      {r.status === 'PENDING' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCancelRequest(r.id)}
                            disabled={processingId === r.id}
                            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-extrabold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" /> Hủy Yêu Cầu Đã Gửi
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end items-center gap-3">
          <button
            onClick={() => fetchAllRequests()}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm Mới
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold hover:text-white transition-all cursor-pointer text-xs"
          >
            Đóng Hộp Thư
          </button>
        </div>
      </div>
    </div>
  );
};
