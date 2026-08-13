import React, { useState, useEffect } from 'react';
import { X, Inbox, CheckCircle2, XCircle, Clock, ShieldAlert, Send, Ban } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

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
  if (!isOpen) return null;

  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incomingRequests, setIncomingRequests] = useState<RequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      const [incRes, outRes] = await Promise.all([
        fetch('http://localhost:3000/api/tasks/requests/incoming', {
          headers: { Authorization: `Bearer ${token || ''}` },
        }),
        fetch('http://localhost:3000/api/tasks/requests/outgoing', {
          headers: { Authorization: `Bearer ${token || ''}` },
        }),
      ]);

      if (incRes.ok) {
        const incData = await incRes.json();
        const incList = Array.isArray(incData) ? incData : incData?.data || [];
        setIncomingRequests(incList);
      }

      if (outRes.ok) {
        const outData = await outRes.json();
        const outList = Array.isArray(outData) ? outData : outData?.data || [];
        setOutgoingRequests(outList);
      }
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
  }, [isOpen, token]);

  const handleRespond = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
        fetchAllRequests();
        onSuccess();
      }
    } catch {
      // Ignore
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (res.ok) {
        fetchAllRequests();
        onSuccess();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Không thể hủy yêu cầu');
      }
    } catch {
      alert('Lỗi kết nối Server NestJS');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden space-y-6 animate-solar-warp-in">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Trung Tâm Yêu Cầu Chuyển Giao Task
              </h2>
              <p className="text-xs text-slate-400">
                Tài khoản: <strong className="text-amber-300">{currentUser?.fullName || 'Bạn'}</strong> • Đồng bộ CSDL PostgreSQL 100%
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
            <Inbox className="w-4 h-4" />
            Yêu Cầu Đến Bạn ({incomingRequests.length})
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

        {/* Request List Body */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto text-xs pr-1">
          {isLoading && (
            <div className="text-center py-8 text-amber-400 animate-pulse font-bold">
              Đang tải danh sách yêu cầu chuyển giao...
            </div>
          )}

          {/* TAB 1: INCOMING REQUESTS */}
          {activeTab === 'incoming' && !isLoading && (
            <>
              {incomingRequests.length === 0 ? (
                <div className="text-center py-10 space-y-3 solar-glass-card rounded-2xl bg-slate-950/60 border border-slate-800">
                  <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">Không Có Yêu Cầu Nào Gửi Đến</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-[11px]">
                    Hiện tại không có đồng nghiệp nào gửi yêu cầu bàn giao hoặc ủy quyền Task mới đến bạn.
                  </p>
                </div>
              ) : (
                incomingRequests.map((r) => (
                  <div
                    key={r.id}
                    className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3 hover:border-amber-400 transition-all shadow-lg"
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
                          <h4 className="font-extrabold text-white text-sm">{r.senderName}</h4>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> {r.createdAt}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-[10px]">
                        ƯU TIÊN: {r.priority}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-amber-300 block">Nhiệm Vụ Chuyển Giao:</span>
                      <p className="font-extrabold text-white text-sm">{r.taskTitle}</p>
                      <p className="text-slate-300 italic pt-1">"{r.note}"</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                      <button
                        onClick={() => handleRespond(r.id, 'REJECTED')}
                        disabled={processingId === r.id}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <XCircle className="w-4 h-4" /> Từ Chối
                      </button>

                      <button
                        onClick={() => handleRespond(r.id, 'APPROVED')}
                        disabled={processingId === r.id}
                        className="solar-corona-btn px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-950" /> Chấp Nhận Task
                      </button>
                    </div>
                  </div>
                ))
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
                    Bạn chưa gửi yêu cầu bàn giao Task nào cho đồng nghiệp.
                  </p>
                </div>
              ) : (
                outgoingRequests.map((r) => {
                  const statusConfig = {
                    PENDING: { label: 'Đang Chờ Duyệt', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
                    APPROVED: { label: 'Đã Chấp Nhận', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
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
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[10px] ${statusConfig.color}`}>
                          TRẠNG THÁI: {statusConfig.label}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-purple-300 block">Nhiệm Vụ Đã Gửi:</span>
                        <p className="font-extrabold text-white text-sm">{r.taskTitle}</p>
                        <p className="text-slate-300 italic pt-1">"{r.note}"</p>
                      </div>

                      {/* NÚT HỦY DÀNH CHO TASK PENDING */}
                      {r.status === 'PENDING' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCancelRequest(r.id)}
                            disabled={processingId === r.id}
                            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Ban className="w-4 h-4" /> Hủy Yêu Cầu Chuyển Giao
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
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold hover:text-white transition-all cursor-pointer"
          >
            Đóng Hộp Thư
          </button>
        </div>
      </div>
    </div>
  );
};
