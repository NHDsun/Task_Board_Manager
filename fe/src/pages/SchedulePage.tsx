import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { CalendarHeader, type CalendarViewMode } from '../components/calendar/CalendarHeader';
import { MonthCalendarView } from '../components/calendar/MonthCalendarView';
import { WeekTimelineView } from '../components/calendar/WeekTimelineView';
import { DayScheduleView } from '../components/calendar/DayScheduleView';
import { TaskDetailModal } from '../components/kanban/TaskDetailModal';
import { NotificationCenter } from '../components/navigation/NotificationCenter';
import type { TaskItem } from '../components/kanban/KanbanCard';

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

export const SchedulePage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🗓️ Lịch Trình State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('MONTH');

  // 🔍 Bộ Lọc State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // 🎯 Modal Chi Tiết Task
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 🔄 Tải Dữ Liệu Ban Đầu
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/profile/users').catch(() => ({ data: [] })),
      ]);

      const taskList = Array.isArray(tasksRes.data)
        ? tasksRes.data
        : Array.isArray(tasksRes.data?.data)
        ? tasksRes.data.data
        : [];
      setTasks(taskList);

      const projectList = Array.isArray(projectsRes.data)
        ? projectsRes.data
        : Array.isArray(projectsRes.data?.data)
        ? projectsRes.data.data
        : [];
      setProjects(projectList);

      const userList = Array.isArray(usersRes.data)
        ? usersRes.data
        : Array.isArray(usersRes.data?.data)
        ? usersRes.data.data
        : [];
      setMembers(userList);
    } catch (err) {
      console.error('Lỗi tải dữ liệu lịch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ⚡ Lắng Nghe Sự Kiện WebSockets Realtime
  useEffect(() => {
    const handleTaskUpdated = (updatedTask: TaskItem) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );
      if (selectedTaskForDetail?.id === updatedTask.id) {
        setSelectedTaskForDetail((prev) => (prev ? { ...prev, ...updatedTask } : null));
      }
    };

    const handleTaskCreated = (newTask: TaskItem) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
    };

    const handleTaskDeleted = (data: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== data.id));
      if (selectedTaskForDetail?.id === data.id) {
        setIsDetailModalOpen(false);
      }
    };

    socketService.on('task:updated', handleTaskUpdated);
    socketService.on('task:created', handleTaskCreated);
    socketService.on('task:deleted', handleTaskDeleted);

    return () => {
      socketService.off('task:updated', handleTaskUpdated);
      socketService.off('task:created', handleTaskCreated);
      socketService.off('task:deleted', handleTaskDeleted);
    };
  }, [selectedTaskForDetail?.id]);

  // 🔍 Áp Dụng Bộ Lọc Đa Tiêu Chí
  const filteredTasks = tasks.filter((task) => {
    if (selectedProjectId !== 'ALL') {
      const p = projects.find((proj) => proj.id === selectedProjectId);
      const matchId = task.projectId === selectedProjectId;
      const matchName = p && task.projectName === p.name;
      if (!matchId && !matchName) return false;
    }

    if (selectedAssigneeId !== 'ALL') {
      const isDirectAssignee = task.assigneeId === selectedAssigneeId;
      const isSubtaskAssignee = task.subtasks?.some(
        (st) => st.assignee?.id === selectedAssigneeId || st.assigneeId === selectedAssigneeId
      );
      if (!isDirectAssignee && !isSubtaskAssignee) return false;
    }

    if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  const handleOpenDetailModal = (task: TaskItem) => {
    setSelectedTaskForDetail(task);
    setIsDetailModalOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setViewMode('DAY');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 🚀 Top Action Bar & Notification Center */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
            ⚡ SOLARIS WORK SCHEDULE
          </span>
        </div>
        <NotificationCenter
          onSelectTaskId={(id) => {
            const target = tasks.find((t) => t.id === id);
            if (target) {
              setSelectedTaskForDetail(target);
              setIsDetailModalOpen(true);
            }
          }}
        />
      </div>

      {/* 🚀 Header Lịch Làm Việc */}
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        members={members}
        selectedAssigneeId={selectedAssigneeId}
        onAssigneeChange={setSelectedAssigneeId}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        tasks={filteredTasks}
      />

      {/* 📅 Nội Dung Chế Độ Xem (Month / Week / Day) */}
      {isLoading ? (
        <div className="solar-glass-card p-16 rounded-3xl bg-[#0F172A]/80 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-amber-300 font-mono tracking-widest uppercase animate-pulse">
            Đang Đồng Bộ Lịch Tác Nghiệp Solaris...
          </p>
        </div>
      ) : (
        <div className="transition-all duration-300">
          {viewMode === 'MONTH' && (
            <MonthCalendarView
              currentDate={currentDate}
              tasks={filteredTasks}
              onSelectTask={handleOpenDetailModal}
              onSelectDate={handleDateSelect}
            />
          )}

          {viewMode === 'WEEK' && (
            <WeekTimelineView
              currentDate={currentDate}
              tasks={filteredTasks}
              members={
                selectedAssigneeId === 'ALL'
                  ? members
                  : members.filter((m) => m.id === selectedAssigneeId)
              }
              onSelectTask={handleOpenDetailModal}
              onSelectDate={handleDateSelect}
            />
          )}

          {viewMode === 'DAY' && (
            <DayScheduleView
              currentDate={currentDate}
              tasks={filteredTasks}
              onSelectTask={handleOpenDetailModal}
            />
          )}
        </div>
      )}

      {/* 📋 Modal Chi Tiết Task Khi Nhấp Vào Bất Kỳ Task Nào */}
      {selectedTaskForDetail && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          task={selectedTaskForDetail}
          onStatusChange={async (taskId: string, newStatus: TaskItem['status']) => {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
            fetchData();
          }}
          onDeleteTask={async (task: TaskItem) => {
            await api.delete(`/tasks/${task.id}`);
            setIsDetailModalOpen(false);
            fetchData();
          }}
          onUpdateTask={(updatedTask: TaskItem) => {
            setSelectedTaskForDetail(updatedTask);
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
          }}
        />
      )}
    </div>
  );
};
