import React from 'react';
import {
  ListTodo,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import type { TaskItem, SubtaskItem } from '../KanbanCard';

interface TaskSubtasksSectionProps {
  task: TaskItem;
  subtasks: SubtaskItem[];
  canManageSubtasks: boolean;
  isWorkerDoingTask: boolean;
  isAdminOrManager: boolean;
  currentUser: any;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (v: string) => void;
  newSubtaskIsUrgent: boolean;
  setNewSubtaskIsUrgent: (v: boolean) => void;
  newSubtaskAssigneeId: string;
  setNewSubtaskAssigneeId: (v: string) => void;
  newSubtaskDays: number;
  setNewSubtaskDays: (v: number) => void;
  newSubtaskStartDate: string;
  setNewSubtaskStartDate: (v: string) => void;
  dbUsers: any[];
  isAddingSubtask: boolean;
  onAddSubtask: (e?: React.FormEvent) => void;
  onToggleSubtask: (subtaskId: string, currentDone: boolean) => void;
  onToggleUrgentSubtask: (subtaskId: string, currentUrgent?: boolean) => void;
  onReviewSubtask: (subtaskId: string, action: 'APPROVE' | 'REJECT' | 'REOPEN') => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export const TaskSubtasksSection: React.FC<TaskSubtasksSectionProps> = ({
  task,
  subtasks,
  canManageSubtasks,
  isWorkerDoingTask,
  isAdminOrManager,
  currentUser,
  newSubtaskTitle,
  setNewSubtaskTitle,
  newSubtaskIsUrgent,
  setNewSubtaskIsUrgent,
  newSubtaskAssigneeId,
  setNewSubtaskAssigneeId,
  newSubtaskDays,
  setNewSubtaskDays,
  newSubtaskStartDate,
  setNewSubtaskStartDate,
  dbUsers,
  isAddingSubtask,
  onAddSubtask,
  onToggleSubtask,
  onToggleUrgentSubtask,
  onReviewSubtask,
  onDeleteSubtask,
}) => {
  return (
    <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-sm">
            Danh Sách Task Con (Subtasks) ({subtasks.filter((st) => st.isDone).length}/{subtasks.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              task.progress === 100
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {task.progress}% Hoàn thành
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              task.progress === 100
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {subtasks.map((st, idx) => {
          const firstPendingIdx = subtasks.findIndex((s) => !s.isDone);
          const isToday = idx === firstPendingIdx;
          const effectiveAssigneeId = st.assigneeId || task.assigneeId || task.assignee?.id;
          const isWorkerForThisSubtask = Boolean(
            currentUser &&
            (effectiveAssigneeId === currentUser.id ||
              (task.assignee?.email && !st.assigneeId && currentUser.email === task.assignee.email))
          );
          const isTaskPausedOrBlocked = task.status === 'PAUSED' || task.status === 'BLOCKED';
          const canToggleSubtask =
            isWorkerForThisSubtask && !st.isDone && st.approvalStatus !== 'PENDING' && !isTaskPausedOrBlocked;

          const schedStr = (() => {
            const currentDays = Number(st.estimatedDays || 1);
            let sDate: Date;

            if (st.startDate) {
              sDate = new Date(st.startDate);
              sDate.setHours(0, 0, 0, 0);
            } else {
              const base = task.startDate
                ? new Date(task.startDate)
                : new Date(task.createdAt || Date.now());
              base.setHours(0, 0, 0, 0);
              let startOffset = 0;
              const list = task.subtasks || [];
              for (let i = 0; i < idx; i++) {
                startOffset += Number(list[i]?.estimatedDays || 1);
              }
              sDate = new Date(base);
              sDate.setDate(sDate.getDate() + startOffset);
            }

            const eDate = new Date(sDate);
            eDate.setDate(eDate.getDate() + currentDays);
            const fmt = (d: Date) =>
              `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            return currentDays === 1 ? fmt(sDate) : `${fmt(sDate)} - ${fmt(eDate)}`;
          })();

          return (
            <div
              key={st.id || idx}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group/sub ${
                st.isDone
                  ? 'opacity-40 grayscale select-none pointer-events-none cursor-not-allowed bg-slate-950/40 border-slate-800/40 text-slate-500'
                  : st.isUrgent
                    ? 'bg-red-950/20 border-red-500/60 text-slate-100 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                    : isToday
                      ? 'bg-gradient-to-r from-amber-500/15 via-purple-600/10 to-slate-900/90 border-amber-500/50 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200 shadow-sm'
              }`}
            >
              <div
                onClick={() => canToggleSubtask && onToggleSubtask(st.id, st.isDone)}
                title={
                  st.isDone
                    ? '🔒 Task con này đã hoàn thành'
                    : canToggleSubtask
                      ? 'Nhấn để gửi xác thực hoàn thành'
                      : '🔒 Chỉ người trực tiếp làm task mới có quyền tick hoàn thành'
                }
                className={`flex items-center gap-3 flex-1 min-w-0 ${canToggleSubtask ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
              >
                <button
                  type="button"
                  disabled={!canToggleSubtask}
                  className={`shrink-0 text-slate-400 group-hover/sub:text-amber-400 transition-colors ${canToggleSubtask ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  {st.isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Square
                      className={`w-4 h-4 ${canToggleSubtask ? 'text-slate-500 group-hover/sub:text-amber-400' : 'text-slate-600'}`}
                    />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-amber-300/80 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-bold">
                      📅 {schedStr}
                    </span>
                    <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                      ⏳ {st.estimatedDays || 1} ngày
                    </span>
                    <span
                      className={`text-xs font-medium leading-relaxed ${
                        st.isDone ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {st.assignee && (
                  <span
                    className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1"
                    title={`Phụ trách: ${st.assignee.fullName}`}
                  >
                    👤 {st.assignee.fullName.replace(/\s*\([^)]*\)/g, '')}
                  </span>
                )}

                {canManageSubtasks && !st.isDone && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUrgentSubtask(st.id, st.isUrgent);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                      st.isUrgent
                        ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-red-300 hover:border-red-500/40'
                    }`}
                    title="Đặt/Hủy mức độ khẩn cấp (URGENT) cho Task con này"
                  >
                    {st.isUrgent ? '🚨 GẤP' : '⚪ Bình thường'}
                  </button>
                )}

                {st.approvalStatus === 'PENDING' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold animate-pulse">
                      ⏳ Chờ Duyệt
                    </span>
                    {isAdminOrManager && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReviewSubtask(st.id, 'APPROVE');
                          }}
                          className="px-2 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm"
                          title="Duyệt hoàn thành Task con này"
                        >
                          ✓ Duyệt
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReviewSubtask(st.id, 'REJECT');
                          }}
                          className="px-2 py-0.5 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer"
                          title="Từ chối và gửi lý do"
                        >
                          ❌ Từ Chối
                        </button>
                      </>
                    )}
                  </div>
                )}

                {st.approvalStatus === 'REJECTED' && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono font-bold max-w-[180px] truncate"
                      title={`Lý do từ chối: ${st.rejectionReason || 'Cần kiểm tra lại'}`}
                    >
                      ❌ Chưa đạt: {st.rejectionReason || 'Cần sửa'}
                    </span>
                    {isWorkerDoingTask && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSubtask(st.id, false);
                        }}
                        className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[10px] font-mono font-black transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        title="Gửi lại yêu cầu xác thực sau khi đã chỉnh sửa xong"
                      >
                        🔄 Gửi Duyệt Lại
                      </button>
                    )}
                  </div>
                )}

                {isToday &&
                  !st.isDone &&
                  !st.isUrgent &&
                  st.approvalStatus !== 'PENDING' &&
                  st.approvalStatus !== 'REJECTED' && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-black ${
                        firstPendingIdx === 0
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {firstPendingIdx === 0 ? `🔥 HÔM NAY (${schedStr})` : `📅 LỊCH: ${schedStr}`}
                    </span>
                  )}

                {st.isDone && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                      ✓ Xong
                    </span>
                    {isAdminOrManager && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReviewSubtask(st.id, 'REOPEN');
                        }}
                        className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm"
                        title="Quản lý mở lại Task con này để nhân sự sửa lại"
                      >
                        ↩️ Mở Lại
                      </button>
                    )}
                  </div>
                )}

                {canManageSubtasks && (
                  <button
                    onClick={() => onDeleteSubtask(st.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-0 group-hover/sub:opacity-100 cursor-pointer"
                    title="Xóa Task con này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {subtasks.length === 0 && (
          <p className="text-slate-500 italic py-2 text-xs text-center">
            Task này chưa có Task con. Hãy nhập bên dưới để chia nhỏ quy trình làm việc!
          </p>
        )}
      </div>

      {canManageSubtasks && (
        <form onSubmit={onAddSubtask} className="flex items-center gap-2 pt-1 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="+ Thêm Task con mới... (Nhấn Enter để tạo)"
              className="w-full p-2.5 pl-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 focus:border-amber-500 text-white placeholder-slate-500 focus:outline-none text-xs font-medium transition-all"
            />
          </div>
          <select
            value={newSubtaskAssigneeId}
            onChange={(e) => setNewSubtaskAssigneeId(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-amber-500 cursor-pointer max-w-[140px] truncate"
            title="Chỉ định nhân sự thực hiện Task con này"
          >
            {dbUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#0F172A] text-slate-200">
                👤 {u.fullName}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newSubtaskStartDate}
            onChange={(e) => setNewSubtaskStartDate(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            title="Ngày bắt đầu Task con"
          />
          <select
            value={newSubtaskDays}
            onChange={(e) => setNewSubtaskDays(Number(e.target.value))}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            title="Thời gian làm việc ước lượng (ngày)"
          >
            <option value={1}>1 ngày</option>
            <option value={2}>2 ngày</option>
            <option value={3}>3 ngày</option>
            <option value={4}>4 ngày</option>
            <option value={5}>5 ngày</option>
          </select>
          <button
            type="button"
            onClick={() => setNewSubtaskIsUrgent(!newSubtaskIsUrgent)}
            className={`px-3 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              newSubtaskIsUrgent
                ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-red-300'
            }`}
          >
            🚨 {newSubtaskIsUrgent ? 'Việc Gấp' : 'Đặt Gấp?'}
          </button>
          <button
            type="submit"
            disabled={!newSubtaskTitle.trim() || isAddingSubtask}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Task Con
          </button>
        </form>
      )}

      {!isWorkerDoingTask && (
        <div className="pt-2 border-t border-slate-800/80 text-slate-500 italic text-[11px] flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Chỉ người trực tiếp thực hiện Task mới có quyền đánh dấu hoàn thành Task con.</span>
        </div>
      )}
    </div>
  );
};
