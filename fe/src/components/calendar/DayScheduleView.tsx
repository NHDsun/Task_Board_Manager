import React from 'react';
import {
  Clock,
  CheckCircle2,
  Flame,
  Star,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { TaskItem } from '../kanban/KanbanCard';

interface DayScheduleViewProps {
  currentDate: Date;
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
}

export const DayScheduleView: React.FC<DayScheduleViewProps> = ({
  currentDate,
  tasks,
  onSelectTask,
}) => {
  const selectedTime = new Date(currentDate);
  selectedTime.setHours(0, 0, 0, 0);

  // 🔍 Lọc danh sách Task thuộc về ngày đã chọn
  const dayTasks = tasks.filter((task) => {
    const start = task.startDate ? new Date(task.startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);

    const due = task.dueDate ? new Date(task.dueDate) : null;
    if (due) due.setHours(0, 0, 0, 0);

    if (start && due) {
      return (
        selectedTime.getTime() >= start.getTime() &&
        selectedTime.getTime() <= due.getTime()
      );
    }
    if (due) return selectedTime.getTime() === due.getTime();
    if (start) return selectedTime.getTime() === start.getTime();
    return false;
  });

  // 🎯 Tìm Hero Task #1 (Ưu tiên cao nhất chưa xong)
  const heroTask =
    dayTasks.find((t) => t.status !== 'DONE' && t.priority === 'URGENT') ||
    dayTasks.find((t) => t.status !== 'DONE' && t.priority === 'IMPORTANT') ||
    dayTasks.find((t) => t.status === 'IN_PROGRESS') ||
    dayTasks[0];

  const completedCount = dayTasks.filter((t) => t.status === 'DONE').length;
  const progressPercent =
    dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <Flame className="w-3 h-3 text-rose-400" /> Khẩn Cấp
          </span>
        );
      case 'IMPORTANT':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Star className="w-3 h-3 text-amber-400" /> Quan Trọng
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Clock className="w-3 h-3 text-blue-400" /> Tiêu Chuẩn
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ĐÃ XONG
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ĐANG LÀM
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
            TẠM DỪNG
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
            BỊ NGHẼN
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
            CHỜ DUYỆT 🔒
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700">
            CẦN LÀM
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🚀 Header Tổng Kết Ngày */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <span className="text-[10px] uppercase font-mono tracking-widest leading-none">
              {currentDate.toLocaleDateString('vi-VN', { weekday: 'short' })}
            </span>
            <span className="text-2xl leading-none mt-1">{currentDate.getDate()}</span>
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              LỊCH TRÌNH TÁC NGHIỆP TRONG NGÀY
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {currentDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h2>
          </div>
        </div>

        {/* Thanh Chỉ Số Hoàn Thành */}
        <div className="flex items-center gap-6 bg-slate-950/80 px-6 py-3.5 rounded-2xl border border-slate-800 shadow-inner">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Tiến độ ngày:</span>
            <span className="text-xl font-black text-amber-300 font-mono">
              {completedCount} / {dayTasks.length} Task ({progressPercent}%)
            </span>
          </div>

          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 📊 Bento Grid: Hero Focus Task & Schedule List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột Trái: Hero Focus Task #1 (5 cột) */}
        {heroTask ? (
          <div className="lg:col-span-5 solar-glass-card p-6 rounded-3xl bg-[#0F172A]/95 border border-amber-500/40 shadow-xl space-y-5 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-mono">
                    HERO FOCUS TASK #1
                  </span>
                </div>
                {getPriorityBadge(heroTask.priority)}
              </div>

              <div>
                <h3 className="text-lg font-black text-white hover:text-amber-300 transition-colors cursor-pointer" onClick={() => onSelectTask(heroTask)}>
                  {heroTask.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                  {heroTask.description || 'Không có mô tả chi tiết.'}
                </p>
              </div>

              {/* Tiến Độ Hero Task */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Tiến độ thực hiện:</span>
                  <span className="font-mono font-black text-amber-400">{heroTask.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all"
                    style={{ width: `${heroTask.progress}%` }}
                  />
                </div>
              </div>

              {/* Danh sách Task con (Minitasks) Preview */}
              {heroTask.subtasks && heroTask.subtasks.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                    <Layers className="w-3.5 h-3.5" />
                    Task Con ({heroTask.subtasks.filter((s) => s.isDone).length}/{heroTask.subtasks.length}):
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {heroTask.subtasks.map((st) => (
                      <div
                        key={st.id}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                          st.isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">{st.title}</span>
                        {st.isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectTask(heroTask)}
              className="solar-corona-btn w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all mt-4"
            >
              <span>Mở Chi Tiết Tác Nghiệp</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="lg:col-span-5 solar-glass-card p-8 rounded-3xl bg-[#0F172A]/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
            <Sparkles className="w-8 h-8 text-slate-600" />
            <p className="text-xs text-slate-400">Không có công việc nào lên lịch trong ngày này.</p>
          </div>
        )}

        {/* Cột Phải: Danh Sách Công Việc Lên Lịch Trong Ngày (7 cột) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Tất Cả Công Việc ({dayTasks.length})
            </h3>
          </div>

          {dayTasks.length === 0 ? (
            <div className="solar-glass-card p-12 rounded-3xl bg-[#0F172A]/80 border border-slate-800 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">Ngày Nghỉ Hoặc Chưa Lên Lịch</h4>
              <p className="text-xs text-slate-400">Bạn có thể chuyển sang chế độ Lịch Tháng hoặc chọn ngày khác để xem.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="solar-glass-card p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all cursor-pointer space-y-3 shadow-md group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 truncate">
                      {task.status === 'DONE' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : task.priority === 'URGENT' ? (
                        <Flame className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-300 font-bold">
                        {task.assignee?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-[11px] text-slate-300 font-medium">
                        {task.assignee?.fullName || 'Chưa phân công'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400">
                        Hạn: {task.dueDate || 'Chưa định'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
