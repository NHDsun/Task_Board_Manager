import React from 'react';
import { Paperclip } from 'lucide-react';
import type { TaskItem } from '../KanbanCard';

interface TaskTransferCardProps {
  task: TaskItem;
}

export const TaskTransferCard: React.FC<TaskTransferCardProps> = ({ task }) => {
  if (task.status !== 'IN_REVIEW' && !task.transferInfo) return null;

  return (
    <div className="solar-glass-card p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-950 to-amber-950/60 border border-purple-500/60 space-y-4 animate-fade-in shadow-2xl">
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
        <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-purple-400" />
          THÔNG TIN CHUYỂN GIAO TASK (TASK TRANSFER DETAIL)
        </span>
        {task.status === 'IN_REVIEW' ? (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold animate-pulse">
            TRẠNG THÁI: IN_REVIEW (CHỜ DUYỆT BÀI)
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
            BÀN GIAO THÀNH CÔNG
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2">
          <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block">
            NGƯỜI CHUYỂN GIAO (SENDER):
          </span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400 bg-slate-950 flex items-center justify-center font-extrabold text-amber-400 text-sm shrink-0">
              {task.transferInfo?.senderAvatar ? (
                <img src={task.transferInfo.senderAvatar} alt="Sender" className="w-full h-full object-cover" />
              ) : task.createdBy?.avatar ? (
                <img src={task.createdBy.avatar} alt="Sender" className="w-full h-full object-cover" />
              ) : (
                <span>
                  {task.transferInfo?.senderName
                    ? task.transferInfo.senderName.slice(0, 2).toUpperCase()
                    : task.createdBy?.fullName
                      ? task.createdBy.fullName.slice(0, 2).toUpperCase()
                      : 'SD'}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">
                {task.transferInfo?.senderName || task.createdBy?.fullName || 'Người khởi tạo'}
              </h4>
              <span className="text-[10px] text-amber-300 font-mono">Người khởi tạo / Gửi bàn giao</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/40 space-y-2">
          <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider block">
            NGƯỜI TIẾP NHẬN (RECEIVER):
          </span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-400 bg-slate-950 flex items-center justify-center font-extrabold text-blue-400 text-sm shrink-0">
              {task.transferInfo?.receiverAvatar ? (
                <img
                  src={task.transferInfo.receiverAvatar}
                  alt="Receiver"
                  className="w-full h-full object-cover"
                />
              ) : task.assignee?.avatar ? (
                <img src={task.assignee.avatar} alt="Receiver" className="w-full h-full object-cover" />
              ) : (
                <span>
                  {task.transferInfo?.receiverName
                    ? task.transferInfo.receiverName.slice(0, 2).toUpperCase()
                    : task.assignee?.fullName
                      ? task.assignee.fullName.slice(0, 2).toUpperCase()
                      : 'RC'}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">
                {task.transferInfo?.receiverName || task.assignee?.fullName || 'Người tiếp nhận'}
              </h4>
              <span className="text-[10px] text-blue-300 font-mono">Người được chỉ định tiếp nhận</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 space-y-1">
        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
          Lý do / Ghi chú chuyển giao:
        </span>
        <p className="italic text-xs text-white">
          "{task.transferInfo?.note || 'Yêu cầu chuyển giao và bàn giao Task tác nghiệp.'}"
        </p>
      </div>
    </div>
  );
};
