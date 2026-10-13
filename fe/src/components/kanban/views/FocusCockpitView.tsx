import React from 'react';
import {
  Target,
  Zap,
  ExternalLink,
  CheckCircle2,
  Pause,
  Paperclip,
  Inbox,
  Sparkles,
  Play,
} from 'lucide-react';
import type { TaskItem } from '../KanbanCard';

interface FocusCockpitViewProps {
  user: any;
  filteredTasks: TaskItem[];
  focusFilterMode: 'ALL' | 'URGENT' | 'IN_PROGRESS';
  setFocusFilterMode: (v: 'ALL' | 'URGENT' | 'IN_PROGRESS') => void;
  onOpenTransferInbox: () => void;
  onSelectTaskForDetail: (t: TaskItem) => void;
  onConfirmDoneTask: (task: { taskId: string; taskTitle: string }) => void;
  onPauseTask: (t: TaskItem) => void;
  onQuickRequest: (t: TaskItem) => void;
  onActivateHeroTask: (t: TaskItem, oldHeroTask?: TaskItem) => void;
  onCompleteTodaySubtask: (heroTask: TaskItem, subtask: any, index: number) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, isDone: boolean) => void;
}

export const FocusCockpitView: React.FC<FocusCockpitViewProps> = ({
  user,
  filteredTasks,
  focusFilterMode,
  setFocusFilterMode,
  onOpenTransferInbox,
  onSelectTaskForDetail,
  onConfirmDoneTask,
  onPauseTask,
  onQuickRequest,
  onActivateHeroTask,
  onCompleteTodaySubtask,
  onToggleSubtask,
}) => {
  const priorityWeight: Record<string, number> = { URGENT: 1, IMPORTANT: 2, NORMAL: 3, LOW: 4 };

  let myFocusTasks = filteredTasks.filter((t) => {
    if (t.progress >= 100 || t.status === 'DONE') return false;
    if (!user) return true;
    return (
      t.assigneeId === user.id ||
      t.assignee?.id === user.id ||
      t.assignee?.email === user.email ||
      t.subtasks?.some((st) => st.assigneeId === user.id || (st.assignee as any)?.id === user.id)
    );
  });

  const isManagement = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';
  const allPendingTasks = filteredTasks.filter((t) => t.status !== 'DONE');
  const allUrgentTasks = allPendingTasks.filter(
    (t) => t.priority === 'URGENT' || t.subtasks?.some((st) => st.isUrgent && !st.isDone)
  );
  const allInReviewTasks = filteredTasks.filter((t) => t.status === 'IN_REVIEW');
  const allBlockedTasks = filteredTasks.filter((t) => t.status === 'BLOCKED');

  if (focusFilterMode === 'URGENT') {
    myFocusTasks = myFocusTasks.filter(
      (t) =>
        t.subtasks?.some((st) => st.isUrgent && !st.isDone) ||
        t.priority === 'URGENT' ||
        t.priority === 'IMPORTANT'
    );
  } else if (focusFilterMode === 'IN_PROGRESS') {
    myFocusTasks = myFocusTasks.filter((t) => t.status === 'IN_PROGRESS');
  }

  myFocusTasks.sort((a, b) => {
    const aHasUrgent = a.subtasks?.some((st) => st.isUrgent && !st.isDone) ? 0 : 1;
    const bHasUrgent = b.subtasks?.some((st) => st.isUrgent && !st.isDone) ? 0 : 1;
    if (aHasUrgent !== bHasUrgent) return aHasUrgent - bHasUrgent;
    return (priorityWeight[a.priority] || 3) - (priorityWeight[b.priority] || 3);
  });

  const heroTask = myFocusTasks.find((t) => t.status === 'IN_PROGRESS');
  const queueTasks = myFocusTasks.filter((t) => t.id !== heroTask?.id);

  return (
    <div className="space-y-6 pb-12">
      <div className="solar-glass-card p-4 md:p-5 rounded-2xl bg-[#0F172A]/90 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              🎯 Focus Cockpit
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Tập Trung Cao Độ
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Không gian tập trung xử lý dứt điểm công việc trọng tâm hôm nay mà không bị xao nhãng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setFocusFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              focusFilterMode === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Tất Cả ({myFocusTasks.length})
          </button>
          <button
            onClick={() => setFocusFilterMode('URGENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              focusFilterMode === 'URGENT'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            🚨 Khẩn Cấp
          </button>
          <button
            onClick={() => setFocusFilterMode('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              focusFilterMode === 'IN_PROGRESS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            ⚡ Đang Làm
          </button>
        </div>
      </div>

      {isManagement && (
        <div className="solar-glass-card px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="text-red-400 font-bold">🚨 {allUrgentTasks.length}</span> Khẩn Cấp
            </span>
            <span className="text-slate-600">•</span>
            <button
              onClick={onOpenTransferInbox}
              className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>📬 {allInReviewTasks.length}</span> Chờ Duyệt Bàn Giao
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="text-rose-400 font-bold">⚠️ {allBlockedTasks.length}</span> Tắc Nghẽn
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">🚀 {allPendingTasks.length}</span> Tổng Đang Chạy
            </span>
          </div>
        </div>
      )}

      {heroTask ? (
        <div className="solar-glass-card p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#0F172A] to-purple-600/10 border-2 border-amber-400/60 shadow-xl relative space-y-5 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-black bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current" /> HERO FOCUS #1
              </span>
              <span className="text-xs text-amber-300/90 font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                📁 {heroTask.projectName || 'Solaris Core'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase ${
                  heroTask.priority === 'URGENT'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : heroTask.priority === 'IMPORTANT'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {heroTask.priority === 'URGENT' ? '🚨 URGENT' : heroTask.priority === 'IMPORTANT' ? '⭐ IMPORTANT' : 'NORMAL'}
              </span>
              <span className="text-xs font-mono text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                📅 Hạn: <strong className="text-emerald-300">{heroTask.dueDate || 'Chưa đặt'}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2
              onClick={() => onSelectTaskForDetail(heroTask)}
              className="text-xl md:text-2xl font-black text-white hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-2 group"
            >
              <span>{heroTask.title}</span>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition-colors" />
            </h2>
            {heroTask.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {heroTask.description}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Tiến độ công việc:</span>
              <span className="text-amber-300 font-bold">
                {heroTask.progress}% ({heroTask.subtasks?.filter((s) => s.isDone).length || 0}/{heroTask.subtasks?.length || 0} việc con hoàn tất)
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ width: `${heroTask.progress}%` }}
              />
            </div>
          </div>

          {heroTask.subtasks && heroTask.subtasks.length > 0 && (() => {
            const subtaskList = heroTask.subtasks;
            let firstPendingIdx = subtaskList.findIndex((s) => {
              if (s.isDone) return false;
              const effId = s.assigneeId || heroTask.assigneeId || (heroTask.assignee as any)?.id;
              return Boolean(user && effId === user.id);
            });
            if (firstPendingIdx === -1) {
              firstPendingIdx = subtaskList.findIndex((s) => !s.isDone);
            }
            const isAllDone = subtaskList.every((s) => s.isDone);
            const activeSubtask = firstPendingIdx !== -1 ? subtaskList[firstPendingIdx] : null;
            const effActiveAssigneeId = activeSubtask?.assigneeId || heroTask.assigneeId || (heroTask.assignee as any)?.id;
            const isWorkerDoingHeroTask = Boolean(
              user &&
                (effActiveAssigneeId === user.id ||
                  (!activeSubtask?.assigneeId && (heroTask.assignee as any)?.id === user.id) ||
                  (!activeSubtask?.assigneeId && (heroTask.assignee as any)?.email && user.email === (heroTask.assignee as any).email))
            );

            return (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                {isAllDone ? (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/50 flex items-center justify-center gap-2 text-emerald-300 text-xs font-bold">
                    <span>🏆</span> Hoàn tất 100% tất cả việc con! Hãy đánh dấu hoàn thành Task.
                  </div>
                ) : activeSubtask ? (
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-black block">
                        🎯 VIỆC CON TIẾP THEO CẦN LÀM:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">
                          {activeSubtask.title}
                        </h4>
                        {activeSubtask.assignee && (
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                            👤 {activeSubtask.assignee.fullName}
                          </span>
                        )}
                        {activeSubtask.isUrgent && (
                          <span className="text-[9px] font-mono font-black text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                            🚨 GẤP
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {!isWorkerDoingHeroTask ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center gap-1.5">
                          🔒 Chỉ người nhận mới tick được
                        </span>
                      ) : activeSubtask.approvalStatus === 'PENDING' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                          ⏳ Đang chờ quản lý duyệt
                        </span>
                      ) : activeSubtask.approvalStatus === 'REJECTED' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-rose-300 font-bold bg-rose-950/60 px-2 py-1 rounded-lg border border-rose-500/40">
                            ❌ Chưa đạt
                          </span>
                          <button
                            onClick={() => onCompleteTodaySubtask(heroTask, activeSubtask, firstPendingIdx)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-all"
                          >
                            🔄 Gửi Duyệt Lại
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onCompleteTodaySubtask(heroTask, activeSubtask, firstPendingIdx)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Xong Việc Con Này
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  {subtaskList.map((st) => {
                    const itemEffAssigneeId = st.assigneeId || heroTask.assigneeId || (heroTask.assignee as any)?.id;
                    const isWorkerForThisItem = Boolean(
                      user &&
                        (itemEffAssigneeId === user.id ||
                          (!st.assigneeId && (heroTask.assignee as any)?.id === user.id) ||
                          (!st.assigneeId && (heroTask.assignee as any)?.email && user.email === (heroTask.assignee as any).email))
                    );
                    const canToggleThis = isWorkerForThisItem && !st.isDone && st.approvalStatus !== 'PENDING';

                    return (
                      <div
                        key={st.id}
                        onClick={() => canToggleThis && onToggleSubtask(heroTask.id, st.id, true)}
                        className={`p-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-all ${
                          st.isDone
                            ? 'opacity-40 text-slate-500 line-through bg-slate-950/20'
                            : canToggleThis
                            ? 'hover:bg-slate-900 cursor-pointer text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={st.isDone}
                            disabled={!canToggleThis}
                            onChange={() => {}}
                            className={`w-3.5 h-3.5 rounded text-amber-500 accent-amber-500 ${canToggleThis ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          />
                          <span className="truncate">{st.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                          {st.assignee && (
                            <span className="text-slate-400">@{st.assignee.fullName.replace(/\s*\([^)]*\)/g, '')}</span>
                          )}
                          {st.isDone ? (
                            <span className="text-emerald-400 font-bold">✓ Xong</span>
                          ) : st.approvalStatus === 'PENDING' ? (
                            <span className="text-amber-400">⏳ Chờ duyệt</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center gap-2.5 pt-1 flex-wrap">
            <button
              onClick={() => onConfirmDoneTask({ taskId: heroTask.id, taskTitle: heroTask.title })}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Đánh Dấu Hoàn Thành
            </button>

            <button
              onClick={() => onPauseTask(heroTask)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Pause className="w-3.5 h-3.5" /> Tạm Dừng
            </button>

            <button
              onClick={() => onSelectTaskForDetail(heroTask)}
              className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Paperclip className="w-3.5 h-3.5" /> Tệp & Chi Tiết
            </button>

            <button
              onClick={() => onQuickRequest(heroTask)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
            >
              <Inbox className="w-3.5 h-3.5" /> Bàn Giao / Trợ Giúp
            </button>
          </div>
        </div>
      ) : (
        <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-amber-500/20 text-center space-y-2">
          <Target className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">Chưa Có Task Nào Đang Thực Hiện (IN_PROGRESS)</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Hãy chọn một việc từ Hàng chờ hôm nay bên dưới và nhấn <strong className="text-amber-300 font-mono">"▶️ Bắt Đầu Làm"</strong> để đưa lên Hero Focus!
          </p>
        </div>
      )}

      {queueTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Hàng Chờ Công Việc Hôm Nay ({queueTasks.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {queueTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTaskForDetail(t)}
                className="solar-glass-card p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-2.5 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-500 animate-pulse'
                          : t.priority === 'IMPORTANT'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    <span className="text-[11px] font-mono text-amber-300/80 truncate">
                      📁 {t.projectName || 'Dự án'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                    📅 {t.dueDate || 'Chưa đặt'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {t.title}
                </h4>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{t.progress}%</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivateHeroTask(t, heroTask);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Bắt Đầu Làm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
