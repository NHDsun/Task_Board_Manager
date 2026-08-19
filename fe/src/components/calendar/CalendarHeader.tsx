import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Filter,
  Users,
  FolderKanban,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { TaskItem } from '../kanban/KanbanCard';

export type CalendarViewMode = 'MONTH' | 'WEEK' | 'DAY';

interface MemberUser {
  id: string;
  fullName: string;
  avatar?: string;
  profession?: string;
  role?: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  projects: ProjectOption[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  members: MemberUser[];
  selectedAssigneeId: string;
  onAssigneeChange: (assigneeId: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  tasks: TaskItem[];
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  projects,
  selectedProjectId,
  onProjectChange,
  members,
  selectedAssigneeId,
  onAssigneeChange,
  selectedPriority,
  onPriorityChange,
  tasks,
}) => {
  // 📆 Điều hướng Thời Gian
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'WEEK') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'WEEK') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // 📝 Format Tiêu Đề Thời Gian
  const formatHeaderTitle = () => {
    const month = currentDate.toLocaleString('vi-VN', { month: 'long' });
    const year = currentDate.getFullYear();

    if (viewMode === 'MONTH') {
      return `${month.charAt(0).toUpperCase() + month.slice(1)} năm ${year}`;
    }

    if (viewMode === 'WEEK') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `Tuần: ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}/${endOfWeek.getFullYear()}`;
    }

    return currentDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // 📊 Thống Kê Nhanh Trong Kỳ
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-4">
      {/* 🚀 Top Control Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0F172A]/90 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cụm 1: Tiêu đề & Điều hướng Tháng/Tuần/Ngày */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
            <CalendarIcon className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                SOLARIS TIMELINE
              </span>
              <span className="text-xs text-slate-400">Lịch Làm Việc & Tiến Độ</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {formatHeaderTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
              title="Thời gian trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 hover:text-white hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hôm Nay</span>
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
              title="Thời gian sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cụm 2: Chế độ Xem (Tháng / Tuần / Ngày) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
          {[
            { id: 'MONTH', label: 'Tháng', icon: CalendarDays },
            { id: 'WEEK', label: 'Tuần (Sprint)', icon: CalendarIcon },
            { id: 'DAY', label: 'Hôm Nay', icon: Clock },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onViewModeChange(mode.id as CalendarViewMode)}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 scale-102'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔍 Filter & Quick Stats Ribbon */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Bộ Lọc Đa Chiều (8 cột) */}
        <div className="lg:col-span-8 p-3.5 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 flex items-center gap-3 flex-wrap shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Bộ Lọc:</span>
          </div>

          {/* Lọc Theo Dự Án */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => onProjectChange(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200">
                🌐 Tất cả dự án
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0F172A] text-slate-200">
                  📁 {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Theo Thành Viên */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedAssigneeId}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200">
                👥 Toàn bộ nhân sự
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0F172A] text-slate-200">
                  👤 {m.fullName} ({m.profession || 'DEV'})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Theo Độ Ưu Tiên */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200">
                ⚡ Mọi mức ưu tiên
              </option>
              <option value="URGENT" className="bg-[#0F172A] text-rose-400">
                🔥 Khẩn cấp (URGENT)
              </option>
              <option value="IMPORTANT" className="bg-[#0F172A] text-amber-400">
                ⭐ Quan trọng (IMPORTANT)
              </option>
              <option value="NORMAL" className="bg-[#0F172A] text-blue-400">
                🔹 Bình thường (NORMAL)
              </option>
              <option value="LOW" className="bg-[#0F172A] text-slate-400">
                ☕ Thấp (LOW)
              </option>
            </select>
          </div>
        </div>

        {/* Bảng Chỉ Số Nhanh (4 cột) */}
        <div className="lg:col-span-4 p-3 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 flex items-center justify-between gap-2 shadow-md">
          <div className="flex-1 text-center border-r border-slate-800/80 pr-2">
            <span className="text-[10px] text-slate-400 font-medium block">Tổng Việc</span>
            <span className="text-base font-black text-white">{totalTasks}</span>
          </div>

          <div className="flex-1 text-center border-r border-slate-800/80 pr-2">
            <span className="text-[10px] text-amber-400 font-medium block">Đang Làm</span>
            <span className="text-base font-black text-amber-400">{inProgressTasks}</span>
          </div>

          <div className="flex-1 text-center border-r border-slate-800/80 pr-2">
            <span className="text-[10px] text-emerald-400 font-medium block">Đã Xong</span>
            <span className="text-base font-black text-emerald-400">{completedTasks}</span>
          </div>

          <div className="flex-1 text-center">
            <span className="text-[10px] text-rose-400 font-medium block">Trễ Hạn</span>
            <span className="text-base font-black text-rose-400">{overdueTasks}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
