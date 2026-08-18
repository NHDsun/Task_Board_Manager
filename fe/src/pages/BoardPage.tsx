import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuthStore } from '../store/useAuthStore';

// 🚀 Dedicated Fixed DND Portal Container (Zero Clipping + Zero Screen Shift + No Scrollbar Flash)
const getPortalRoot = () => {
  let element = document.getElementById('solar-dnd-portal');
  if (!element) {
    element = document.createElement('div');
    element.id = 'solar-dnd-portal';
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.right = '0';
    element.style.bottom = '0';
    element.style.overflow = 'hidden';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '999999';
    document.body.appendChild(element);
  }
  return element;
};
import { KanbanCard, type TaskItem } from '../components/kanban/KanbanCard';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { SolarNotificationModal } from '../components/common/SolarNotificationModal';
import { TaskRequestModal } from '../components/kanban/TaskRequestModal';
import { TaskDetailModal } from '../components/kanban/TaskDetailModal';
import { CreateProjectModal } from '../components/kanban/CreateProjectModal';
import { CreateTaskModal } from '../components/kanban/CreateTaskModal';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
  Inbox,
  Search,
  Kanban,
  GitMerge,
  Target,
  CheckCircle2,
  Filter,
  UserCheck,
  Pause,
  RefreshCw,
  PlusCircle,
  FolderPlus,
  Play,
  Sliders,
  Sparkles,
  Zap,
  Folder,
  Lock,
  Unlock,
  Archive,
  History,
} from 'lucide-react';

import { TaskTransferInboxModal } from '../components/kanban/TaskTransferInboxModal';
import { DeleteTaskConfirmModal } from '../components/kanban/DeleteTaskConfirmModal';

export const BoardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [activeView, setActiveView] = useState<'kanban' | 'pipeline' | 'focus' | 'audit'>('kanban');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTransferInboxOpen, setIsTransferInboxOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedPipelineProject, setSelectedPipelineProject] = useState<string>('ALL');
  const [focusFilterMode, setFocusFilterMode] = useState<'ALL' | 'URGENT' | 'IN_PROGRESS'>('ALL');
  const [isEditingPipelineStages, setIsEditingPipelineStages] = useState(false);
  const [isStageLockingEnabled, setIsStageLockingEnabled] = useState(true);
  const [activePipelineStages, setActivePipelineStages] = useState([
    { id: 'stage_1', name: '1. Yêu Cầu & Phân Tích', status: 'IN_PROGRESS', color: 'border-blue-500/40 text-blue-300' },
    { id: 'stage_2', name: '2. Thiết Kế UI/UX', status: 'IN_PROGRESS', color: 'border-purple-500/40 text-purple-300' },
    { id: 'stage_3', name: '3. Lập Trình Backend/Frontend', status: 'IN_PROGRESS', color: 'border-amber-500/40 text-amber-300' },
    { id: 'stage_4', name: '4. Kiểm Thử QA/QC', status: 'TODO', color: 'border-rose-500/40 text-rose-300' },
    { id: 'stage_5', name: '5. Chạy Thử Staging', status: 'TODO', color: 'border-cyan-500/40 text-cyan-300' },
    { id: 'stage_6', name: '6. Bàn Giao & Nghiệm Thu', status: 'DONE', color: 'border-emerald-500/40 text-emerald-300' },
  ]);
  const [newStageNameInput, setNewStageNameInput] = useState('');

  const [selectedTaskForRequest, setSelectedTaskForRequest] = useState<TaskItem | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<Array<any>>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // Dynamic Metadata States (Read from PostgreSQL DB)
  const [dbProjects, setDbProjects] = useState<Array<any>>([]);
  const [dbUsers, setDbUsers] = useState<Array<{ id: string; fullName: string }>>([]);

  // Multi-Criteria Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterProfession, setFilterProfession] = useState<string>('ALL');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/profile/users'),
        ]);

        setDbProjects(Array.isArray(projRes.data) ? projRes.data : projRes.data?.data || []);
        setDbUsers(Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || []);
      } catch {
        // Fallback
      }
    };

    fetchMetadata();
  }, [token]);

  // State xác nhận khi kéo Task vào cột DONE
  const [confirmDoneTask, setConfirmDoneTask] = useState<{
    taskId: string;
    taskTitle: string;
  } | null>(null);

  // Custom Solar Notification Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showNotification = (message: string, type: 'success' | 'warning' | 'info' = 'info', title = 'Thông Báo Hệ Thống') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // 🗄️ Task dataset fetched straight from PostgreSQL Database
  const [tasks, setTasks] = useState<Array<TaskItem & { assigneeId?: string }>>([]);

  // Fetch real task dataset from Backend API
  const fetchTasksFromBackend = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tasks?limit=300');
      const responseData = res.data;
      const taskArray = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
        ? responseData.data
        : [];
      setTasks(taskArray);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArchivedTasks = async () => {
    setIsLoadingArchived(true);
    try {
      const res = await api.get('/tasks/archived');
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setArchivedTasks(data);
    } catch {
      // Fallback
    } finally {
      setIsLoadingArchived(false);
    }
  };

  useEffect(() => {
    if (activeView === 'audit') {
      fetchArchivedTasks();
    }
  }, [activeView]);

  useEffect(() => {
    fetchTasksFromBackend();
  }, [token]);

  // ⚡ Socket.IO Real-time Connection & Rooms Integration
  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket server
    socketService.connect();

    // Listen for updates
    const handleSocketUpdate = () => {
      console.log('⚡ Real-time update received via Socket.IO');
      fetchTasksFromBackend();
    };

    socketService.on('task:created', handleSocketUpdate);
    socketService.on('task:updated', handleSocketUpdate);
    socketService.on('task:deleted', handleSocketUpdate);
    socketService.on('comment:created', handleSocketUpdate);

    // Auto-fetch latest task dataset on connection restored
    const unsubscribeReconnect = socketService.onReconnect(() => {
      console.log('🔄 Syncing full task state after connection restored');
      fetchTasksFromBackend();
    });

    return () => {
      socketService.off('task:created', handleSocketUpdate);
      socketService.off('task:updated', handleSocketUpdate);
      socketService.off('task:deleted', handleSocketUpdate);
      socketService.off('comment:created', handleSocketUpdate);
      unsubscribeReconnect();
    };
  }, [token]);

  // Join/leave project rooms dynamically when project filter changes
  useEffect(() => {
    if (!token) return;

    if (filterProject && filterProject !== 'ALL') {
      socketService.joinProject(filterProject);
      return () => {
        socketService.leaveProject(filterProject);
      };
    } else if (filterProject === 'ALL' && dbProjects.length > 0) {
      dbProjects.forEach((proj) => {
        socketService.joinProject(proj.id);
      });
      return () => {
        dbProjects.forEach((proj) => {
          socketService.leaveProject(proj.id);
        });
      };
    }
  }, [filterProject, token, dbProjects]);

  // 🔘 Handler toggle completion of a subtask directly from Card or Modal
  const handleToggleSubtask = async (taskId: string, subtaskId: string, isDone: boolean) => {
    // Optimistic UI update across all task lists
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const subtasks = (t.subtasks || []).map((st) =>
          st.id === subtaskId ? { ...st, isDone } : st
        );
        const completedCount = subtasks.filter((st) => st.isDone).length;
        const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : t.progress;
        return { ...t, subtasks, progress };
      })
    );

    try {
      const res = await api.patch(`/tasks/subtasks/${subtaskId}`, { isDone });
      const updatedTask = res.data?.data || res.data;
      if (updatedTask && updatedTask.id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t))
        );
        if (selectedTaskForDetail?.id === taskId) {
          setSelectedTaskForDetail((prev) => (prev ? { ...prev, ...updatedTask } : updatedTask));
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật việc con:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Không thể cập nhật việc con';
      showNotification(serverMsg, 'warning', 'Lỗi Cập Nhật Việc Con');
      fetchTasksFromBackend();
    }
  };

  // Handle Drag and Drop via @hello-pangea/dnd Library (Tối ưu phản hồi tức thì 0s trễ + Mô hình Retry)
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Drop outside any container
    if (!destination) return;

    // Drop in the exact same spot
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetStatus = destination.droppableId as TaskItem['status'];
    const taskToMove = tasks.find((t) => t.id === draggableId);
    if (!taskToMove) return;

    // 🔒 1. BỊ CẤM: Drag Ownership Rule (Khi đã giao việc, Task thuộc hoàn toàn về Assignee. Người tạo không được kéo thay, TRỪ ADMIN)
    const isAdmin = user?.globalRole === 'ADMIN';
    const hasAssignee = Boolean(taskToMove.assigneeId || taskToMove.assignee?.id || taskToMove.assignee?.email);
    const isTaskOwner = hasAssignee
      ? (taskToMove.assigneeId === user?.id ||
         taskToMove.assignee?.id === user?.id ||
         taskToMove.assignee?.email === user?.email)
      : (taskToMove as any).createdById === user?.id;

    if (!isAdmin && !isTaskOwner) {
      showNotification(
        `Task này đã được giao cho ${taskToMove.assignee?.fullName || 'thành viên khác'}! Bạn không có quyền kéo thả Task của người khác (Chỉ Admin hoặc chính người được giao mới có quyền).`,
        'warning',
        'Quyền Hạn Bị Từ Chối (Drag Ownership)'
      );
      return;
    }

    // 🔒 2. BỊ CẤM: Cột IN_REVIEW bị khóa 2 chiều -> HIỆN THÔNG BÁO CẢNH BÁO
    if (taskToMove.status === 'IN_REVIEW' || targetStatus === 'IN_REVIEW') {
      showNotification(
        'Cột CHỜ DUYỆT BÀI (IN_REVIEW) là tự động! Không thể kéo thả thủ công vào hoặc ra khỏi cột này.',
        'warning',
        'Khóa Cột Chờ Duyệt (IN_REVIEW Lock)'
      );
      return;
    }

    // 🎯 3. KÉO VÀO CỘT DONE -> BẬT MODAL XÁC NHẬN CHÍNH XÁC
    if (targetStatus === 'DONE') {
      setConfirmDoneTask({
        taskId: draggableId,
        taskTitle: taskToMove.title,
      });
      return;
    }

    // ⚡ 4. CẬP NHẬT TỨC THÌ TRÊN GIAO DIỆN & BẬT ANIMATION DROP SNAP (0ms Delay)
    setRecentlyMovedTaskId(draggableId);
    setTimeout(() => {
      setRecentlyMovedTaskId(null);
    }, 800);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === draggableId) {
          let newProgress = t.progress;
          if (targetStatus === 'TODO') newProgress = 0;
          return { ...t, status: targetStatus, progress: newProgress };
        }
        return t;
      })
    );

    // 🚀 Cập nhật CSDL ngầm
    api.patch(`/tasks/${draggableId}/status`, {
      status: targetStatus,
      progress: targetStatus === 'TODO' ? 0 : taskToMove.progress,
    }).catch(() => {
      // Khôi phục giao diện theo dữ liệu chuẩn từ CSDL nếu có lỗi
      fetchTasksFromBackend();
    });
  };

  // 📈 Handle Drag and Drop for Pipeline Stages View (Cập nhật Giai đoạn Dự Án)
  const handlePipelineDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetStageId = destination.droppableId;
    const taskToMove = tasks.find((t) => t.id === draggableId);
    if (!taskToMove) return;

    // 🔒 1. Drag Ownership Rule: Khi đã giao việc, Task thuộc hoàn toàn về Assignee (chỉ Assignee hoặc ADMIN mới có quyền kéo)
    const isAdmin = user?.globalRole === 'ADMIN';
    const hasAssignee = Boolean(taskToMove.assigneeId || taskToMove.assignee?.id || taskToMove.assignee?.email);
    const isTaskOwner = hasAssignee
      ? (taskToMove.assigneeId === user?.id ||
         taskToMove.assignee?.id === user?.id ||
         taskToMove.assignee?.email === user?.email)
      : (taskToMove as any).createdById === user?.id;

    if (!isAdmin && !isTaskOwner) {
      showNotification(
        `Task này đã được giao cho ${taskToMove.assignee?.fullName || 'thành viên khác'}! Bạn không có quyền chuyển giai đoạn Pipeline của người khác.`,
        'warning',
        'Quyền Hạn Bị Từ Chối (Pipeline Ownership)'
      );
      return;
    }

    // ⚡ 2. Cập nhật tức thì trên giao diện & Animation Snap
    setRecentlyMovedTaskId(draggableId);
    setTimeout(() => {
      setRecentlyMovedTaskId(null);
    }, 800);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === draggableId) {
          return { ...t, stageId: targetStageId };
        }
        return t;
      })
    );

    const targetStageObj = activePipelineStages.find((s) => s.id === targetStageId);
    showNotification(
      `Đã chuyển Task "${taskToMove.title}" sang giai đoạn "${targetStageObj?.name || targetStageId}" thành công!`,
      'success',
      'Cập Nhật Giai Đoạn Pipeline'
    );

    // 🚀 Gửi API cập nhật stageId vào CSDL Postgres
    api.patch(`/tasks/${draggableId}/status`, {
      stageId: targetStageId,
    }).catch(() => {
      fetchTasksFromBackend();
    });
  };

  // Hàm thực thi Chuyển sang DONE sau khi User bấm Xác Nhận trên Modal (Áp dụng Retry)
  const executeMoveToDone = async () => {
    if (!confirmDoneTask) return;

    const taskId = confirmDoneTask.taskId;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: 'DONE', progress: 100 };
        }
        return t;
      })
    );

    setConfirmDoneTask(null);

    try {
      await api.patch(`/tasks/${taskId}/status`, {
        status: 'DONE',
        progress: 100,
      });
    } catch {
      fetchTasksFromBackend();
    }
  };

  // 🗑️ Hàm thực thi Xóa Task khỏi CSDL PostgreSQL khi User bấm Xác Nhận trên Modal (Áp dụng Retry)
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/tasks/${taskToDelete.id}`);

      showNotification(`🟢 Solaris: Đã xóa vĩnh viễn Task "${taskToDelete.title}" khỏi CSDL!`, 'success', 'Xóa Task Thành Công');
      setIsDeleteModalOpen(false);
      setSelectedTaskForDetail(null);
      setTaskToDelete(null);
      fetchTasksFromBackend();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể xóa Task';
      showNotification(`❌ Lỗi: ${errMsg}`, 'warning', 'Xóa Task Thất Bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Array<{ id: TaskItem['status']; label: string; color: string; border: string }> = [
    { id: 'TODO', label: 'CẦN LÀM (TODO)', color: 'text-slate-400', border: 'border-slate-800' },
    { id: 'IN_PROGRESS', label: 'ĐANG LÀM (IN PROGRESS)', color: 'text-amber-400', border: 'border-amber-500/30' },
    { id: 'PAUSED', label: 'TẠM DỪNG (PAUSED)', color: 'text-blue-400', border: 'border-blue-500/30' },
    { id: 'BLOCKED', label: 'TẮC NGHỄN (BLOCKED)', color: 'text-rose-400', border: 'border-rose-500/30' },
    { id: 'IN_REVIEW', label: 'CHỜ DUYỆT BÀI (IN REVIEW) 🔒', color: 'text-purple-400', border: 'border-purple-500/40' },
    { id: 'DONE', label: 'HOÀN THÀNH (DONE)', color: 'text-emerald-400', border: 'border-emerald-500/30' },
  ];

  // Apply Multi-Criteria Filters
  const filteredTasks = tasks.filter((task) => {
    // 1. Search Query Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query) || false;
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Project Filter
    if (filterProject !== 'ALL' && task.projectName !== filterProject) {
      return false;
    }

    // 3. Assignee Filter
    if (filterAssignee !== 'ALL' && task.assigneeId !== filterAssignee) {
      return false;
    }

    // 4. Priority Filter
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) {
      return false;
    }

    // 5. Profession Filter
    if (filterProfession !== 'ALL' && task.assignee?.profession !== filterProfession) {
      return false;
    }

    return true;
  });

  const handleQuickRequest = (task: TaskItem) => {
    setSelectedTaskForRequest(task);
    setIsRequestModalOpen(true);
  };

  const isRoleAdminOrManager = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';

  return (
    <div className="space-y-6 pb-12">
      {/* 🚀 Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-300">SOLARIS WORKSPACE</span>
          </div>

          <button
            onClick={fetchTasksFromBackend}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shadow-md"
            title="Đồng Bộ CSDL Postgres"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* 👑 NÚT TẠO DỰ ÁN (CHỈ ADMIN) & TẠO TASK CHO ADMIN VÀ MANAGER */}
        <div className="flex items-center gap-3 flex-wrap">
          {user?.globalRole === 'ADMIN' && (
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <FolderPlus className="w-4 h-4 text-purple-400" />
              <span>+ Tạo Dự Án Mới</span>
            </button>
          )}

          {isRoleAdminOrManager && (
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="solar-corona-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tạo Task Mới</span>
            </button>
          )}

          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm task (Ctrl + K)..."
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-52"
            />
          </div>

          <button
            onClick={() => setIsTransferInboxOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition-all relative cursor-pointer shadow-md"
            title="Xem các yêu cầu chuyển giao Task gửi chính chủ cho bạn"
          >
            <Inbox className="w-4 h-4 text-amber-400" />
            <span>Yêu Cầu Chuyển Giao</span>
          </button>
        </div>
      </div>

      {/* 🔍 Advanced Filter Toolbar */}
      <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* View Switcher Tabs with Animated Sliding Pill Indicator */}
        {(() => {
          const tabs = [
            { id: 'kanban', label: 'Kanban 6 Cột', icon: Kanban, color: 'from-amber-500 to-amber-600', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]', activeText: 'text-slate-950' },
            ...((user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER') ? [{ id: 'pipeline', label: `Pipeline Stage (${user?.globalRole === 'ADMIN' ? 'Admin' : 'Manager'})`, icon: GitMerge, color: 'from-purple-600 to-indigo-600', shadow: 'shadow-[0_0_20px_rgba(147,51,234,0.4)]', activeText: 'text-white' }] : []),
            { id: 'focus', label: 'My Focus Queue', icon: Target, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]', activeText: 'text-slate-950' },
            ...(user?.globalRole === 'ADMIN' ? [{ id: 'audit', label: 'Audit Log (Admin)', icon: Archive, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]', activeText: 'text-slate-950' }] : []),
          ];

          const activeIndex = tabs.findIndex((t) => t.id === activeView);
          const currentTab = tabs[activeIndex] || tabs[0];
          const tabWidthPercent = 100 / tabs.length;

          return (
            <div className="relative p-1 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center shadow-inner overflow-hidden">
              {/* 🌠 Animated Sliding Pill Indicator */}
              <div
                className={`absolute top-1 bottom-1 rounded-xl bg-gradient-to-r ${currentTab.color} ${currentTab.shadow} transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0`}
                style={{
                  width: `calc(${tabWidthPercent}% - 4px)`,
                  left: `calc(${activeIndex * tabWidthPercent}% + 2px)`,
                }}
              />

              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as any)}
                    className={`relative z-10 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer select-none ${
                      isActive ? `${tab.activeText} scale-[1.02]` : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={{ width: `${tabWidthPercent}%` }}
                  >
                    <IconComponent className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                    <span className="whitespace-nowrap tracking-wide">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Filters Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Select */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Tất Cả Dự Án</option>
              {dbProjects.map((p) => (
                <option key={p.id} value={p.name} className="bg-[#0F172A] text-slate-200 font-semibold py-1">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Select */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Tất Cả Nhân Sự</option>
              {dbUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0F172A] text-slate-200 font-semibold py-1">
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-amber-400 font-bold">★</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Mọi Độ Ưu Tiên</option>
              <option value="URGENT" className="bg-[#0F172A] text-slate-200 font-semibold py-1">URGENT (Khẩn cấp)</option>
              <option value="IMPORTANT" className="bg-[#0F172A] text-slate-200 font-semibold py-1">IMPORTANT (Quan trọng)</option>
              <option value="NORMAL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">NORMAL (Thường)</option>
              <option value="LOW" className="bg-[#0F172A] text-slate-200 font-semibold py-1">LOW (Thấp)</option>
            </select>
          </div>

          {/* Profession Select */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-purple-400 font-bold">🛠️</span>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0F172A] text-slate-200 font-semibold py-1">Mọi Chuyên Môn</option>
              <option value="DEV" className="bg-[#0F172A] text-slate-200 font-semibold py-1">DEV (Lập trình viên)</option>
              <option value="PRODUCT_OWNER" className="bg-[#0F172A] text-slate-200 font-semibold py-1">PRODUCT_OWNER (Quản lý)</option>
              <option value="TESTER" className="bg-[#0F172A] text-slate-200 font-semibold py-1">TESTER (Kiểm thử)</option>
              <option value="DESIGNER" className="bg-[#0F172A] text-slate-200 font-semibold py-1">DESIGNER (Thiết kế)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 VIEW 1: KANBAN 6 COLUMN GRID WITH ULTRA SMOOTH 60FPS PHYSICS SPRING DROP */}
      {activeView === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative z-0">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <Droppable key={col.id} droppableId={col.id} isDropDisabled={col.id === 'IN_REVIEW'}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`solar-glass-card p-4 rounded-2xl bg-[#0F172A]/60 border transition-colors duration-200 min-h-[500px] flex flex-col space-y-3 ${
                        snapshot.isDraggingOver
                          ? 'border-2 border-dashed border-amber-400 bg-amber-500/15 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                          : col.border
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <span className={`text-xs font-extrabold tracking-wider ${col.color}`}>
                          {col.label} {col.id === 'IN_REVIEW' && '🔒'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3">
                        {colTasks.map((t, index) => {
                          const isAdminRole = user?.globalRole === 'ADMIN';
                          const hasAssignee = Boolean(t.assigneeId || t.assignee?.id || t.assignee?.email);
                          const isMyOwnTask = hasAssignee
                            ? (t.assigneeId === user?.id ||
                               t.assignee?.id === user?.id ||
                               t.assignee?.email === user?.email)
                            : (t as any).createdById === user?.id;
                          const isDragDisabled = t.status === 'IN_REVIEW' || (!isAdminRole && !isMyOwnTask);

                          return (
                            <Draggable key={t.id} draggableId={t.id} index={index} isDragDisabled={isDragDisabled}>
                              {(providedDraggable, snapshotDraggable) => {
                                const cardElement = (
                                  <div
                                    ref={providedDraggable.innerRef}
                                    {...providedDraggable.draggableProps}
                                    {...providedDraggable.dragHandleProps}
                                    style={{
                                      ...providedDraggable.draggableProps.style,
                                      pointerEvents: 'auto',
                                    }}
                                    className={`transform-gpu ${
                                      snapshotDraggable.isDragging
                                        ? '!z-[999999] rotate-2 scale-105 shadow-[0_0_60px_rgba(245,158,11,0.8)] border-2 border-amber-400 rounded-2xl bg-[#0F172A] cursor-grabbing'
                                        : snapshotDraggable.isDropAnimating || recentlyMovedTaskId === t.id
                                        ? 'animate-solar-drop-snap border-2 border-amber-400/90 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                                        : 'hover:-translate-y-0.5 transition-transform duration-150'
                                    }`}
                                  >
                                    <KanbanCard
                                      task={t}
                                      onRequestTransfer={handleQuickRequest}
                                      onCardClick={(taskItem) => setSelectedTaskForDetail(taskItem)}
                                      onToggleSubtask={handleToggleSubtask}
                                      onDeleteTask={(taskItem) => {
                                        setTaskToDelete(taskItem);
                                        setIsDeleteModalOpen(true);
                                      }}
                                    />
                                  </div>
                                );

                                if (snapshotDraggable.isDragging) {
                                  return ReactDOM.createPortal(cardElement, getPortalRoot());
                                }

                                return cardElement;
                              }}
                            </Draggable>
                        );
                      })}
                        {provided.placeholder}

                        {colTasks.length === 0 && (
                          <div className={`h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-xs font-mono transition-colors ${
                            snapshot.isDraggingOver ? 'border-amber-400 text-amber-300 bg-amber-500/10' : 'border-slate-800/60 text-slate-600'
                          }`}>
                            Kéo thả Task vào đây
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* 📈 VIEW 2: PIPELINE STAGE VIEW (TÍCH HỢP BỘ LỌC DỰ ÁN DYNAMIC & SUMMARY) */}
      {activeView === 'pipeline' && (() => {
        // Dynamic list of unique projects filtered by Role: Admin sees all, Manager sees managed projects
        const isManager = user?.globalRole === 'MANAGER';

        let rawProjectList = tasks.map((t) => t.projectName).filter(Boolean) as string[];

        if (isManager) {
          const myManagedProjects = tasks
            .filter(
              (t) =>
                t.assigneeId === user?.id ||
                t.assignee?.id === user?.id ||
                (t as any).createdById === user?.id
            )
            .map((t) => t.projectName)
            .filter(Boolean) as string[];

          rawProjectList = rawProjectList.filter((pName) => myManagedProjects.includes(pName));
        }

        const availableProjects = Array.from(new Set(rawProjectList));

        const activeProjectName = selectedPipelineProject;

        // Filter tasks for pipeline by project selection
        const pipelineTasks =
          activeProjectName === 'ALL'
            ? filteredTasks
            : filteredTasks.filter((t) => t.projectName === activeProjectName);

        const totalProjectTasks = pipelineTasks.length;
        const doneProjectTasks = pipelineTasks.filter((t) => t.status === 'DONE').length;
        const projectCompletionPercent =
          totalProjectTasks > 0 ? Math.round((doneProjectTasks / totalProjectTasks) * 100) : 0;

        return (
          <div className="space-y-6 pb-12">
            {/* Header Banner */}
            <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-purple-300 flex items-center gap-2 mb-1">
                  <GitMerge className="w-6 h-6 text-purple-400" />
                  Tiến Trình Pipeline Stage Vòng Đời Dự Án (Project Life-Cycle)
                </h2>
                <p className="text-xs text-slate-300">
                  Theo dõi tiến độ phát triển theo các Giai đoạn từ Yêu Cầu đến Bàn Giao Sản Phẩm.
                </p>
              </div>

              {/* Project Stats Summary & Edit Toggle */}
              <div className="flex items-center gap-3 flex-wrap shrink-0">
                <button
                  onClick={() => setIsEditingPipelineStages(!isEditingPipelineStages)}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  {isEditingPipelineStages ? '✓ Đóng Quản Lý Giai Đoạn' : '⚙️ Quản Lý Giai Đoạn Pipeline'}
                </button>

                <div className="flex items-center gap-3 bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-purple-300 font-mono block">TIẾN ĐỘ DỰ ÁN</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{projectCompletionPercent}%</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center font-mono font-bold text-xs text-purple-300">
                    {doneProjectTasks}/{totalProjectTasks}
                  </div>
                </div>
              </div>
            </div>

            {/* ℹ️ THÔNG TIN CƠ BẢN DỰ ÁN (BASIC PROJECT INFO CARD) */}
            {selectedPipelineProject !== 'ALL' && (() => {
              const currentProj = dbProjects.find((p) => p.name === selectedPipelineProject);
              return (
                <div className="solar-glass-card p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#0F172A] to-slate-900 border border-purple-500/40 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <Folder className="w-5 h-5 text-purple-400" />
                      Dự Án: {selectedPipelineProject}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      🔒 Dự Án Đang Hoạt Động (Active Lifecycle)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentProj?.description || 'Dự án trọng điểm phát triển hệ thống quản trị công việc và quy trình tác nghiệp.'}
                  </p>
                  <div className="flex items-center gap-6 pt-2 text-xs font-mono border-t border-slate-800 flex-wrap text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[10px]">PROJECT MANAGER</span>
                      <span className="text-amber-400 font-bold">👤 {user?.fullName || 'Project Lead'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TỔNG THÀNH VIÊN</span>
                      <span className="text-slate-200 font-bold">👥 {(currentProj as any)?._count?.members || 8} Nhân sự</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TỔNG SỐ TASK</span>
                      <span className="text-slate-200 font-bold">📋 {totalProjectTasks} Nhiệm vụ</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HOÀN THÀNH</span>
                      <span className="text-emerald-400 font-bold">✅ {doneProjectTasks} Task ({projectCompletionPercent}%)</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 🎛️ BỘ CHỈNH SỬA GIAI ĐOẠN PIPELINE (IN-PLACE PIPELINE STAGE EDITOR) */}
            {isEditingPipelineStages && (
              <div className="solar-glass-card p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Chỉnh Sửa & Thêm Giai Đoạn Pipeline Trực Tiếp ({activePipelineStages.length} giai đoạn)
                  </h3>

                  {/* 🔘 Nút Bật/Tắt Khóa Giai Đoạn Tuần Tự */}
                  <button
                    onClick={() => {
                      const nextState = !isStageLockingEnabled;
                      setIsStageLockingEnabled(nextState);
                      showNotification(
                        nextState
                          ? '🔒 Đã BẬT tính năng Khóa Giai Đoạn tuần tự! Các giai đoạn sau sẽ bị khóa nếu giai đoạn trước chưa xong 100%.'
                          : '🔓 Đã MỞ KHÓA toàn bộ Giai Đoạn! Tất cả các giai đoạn hiện có thể truy cập tự do.',
                        nextState ? 'info' : 'success',
                        'Cấu Hình Khóa Giai Đoạn'
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer shadow-md ${
                      isStageLockingEnabled
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isStageLockingEnabled ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>Khóa Giai Đoạn: <b>ĐANG BẬT</b> (Click để Tắt)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Khóa Giai Đoạn: <b>ĐANG TẮT</b> (Click để Bật)</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={newStageNameInput}
                    onChange={(e) => setNewStageNameInput(e.target.value)}
                    placeholder="Tên giai đoạn mới (VD: 7. Triển Khai Cloud AWS)"
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 min-w-[280px]"
                  />
                  <button
                    onClick={() => {
                      if (!newStageNameInput.trim()) return;
                      const newStageObj = {
                        id: `stage_${Date.now()}`,
                        name: newStageNameInput.trim(),
                        status: 'IN_PROGRESS',
                        color: 'border-purple-500/40 text-purple-300',
                      };
                      setActivePipelineStages((prev) => [...prev, newStageObj]);
                      setNewStageNameInput('');
                      showNotification('🟢 Đã thêm Giai đoạn Pipeline mới thành công!', 'success', 'Pipeline Editor');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg"
                  >
                    + Thêm Giai Đoạn
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {activePipelineStages.map((st) => (
                    <div key={st.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={st.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActivePipelineStages((prev) =>
                            prev.map((item) => (item.id === st.id ? { ...item, name: val } : item))
                          );
                        }}
                        className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-purple-400"
                      />
                      <button
                        onClick={() => {
                          setActivePipelineStages((prev) => prev.filter((item) => item.id !== st.id));
                          showNotification('Đã xóa Giai đoạn Pipeline!', 'info', 'Pipeline Editor');
                        }}
                        className="text-slate-500 hover:text-rose-400 text-xs font-bold px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📁 PROJECT PICKER TABS (CHỌN DỰ ÁN XEM PIPELINE) */}
            <div className="solar-glass-card p-3 rounded-2xl bg-[#0F172A]/90 border border-slate-800 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 px-2">
                <Folder className="w-4 h-4 text-purple-400" /> Chọn Dự Án:
              </span>
              <button
                onClick={() => setSelectedPipelineProject('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer ${
                  selectedPipelineProject === 'ALL'
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🌐 Tất Cả Dự Án ({tasks.length})
              </button>
              {availableProjects.map((pName) => {
                const count = tasks.filter((t) => t.projectName === pName).length;
                const isSelected = selectedPipelineProject === pName;
                return (
                  <button
                    key={pName}
                    onClick={() => setSelectedPipelineProject(pName)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    📁 {pName} ({count})
                  </button>
                );
              })}
            </div>

            {/* Pipeline Stage Columns with Sequential Unlocking Logic */}
            {(() => {
              const computedStages = [];
              let isLocked = false;

              for (let i = 0; i < activePipelineStages.length; i++) {
                const originalStage = activePipelineStages[i];
                const stageTasks = pipelineTasks.filter(
                  (t) => t.stageId === originalStage.id || (!t.stageId && originalStage.id === 'stage_1')
                );

                const hasTasks = stageTasks.length > 0;
                const allTasksDone = hasTasks && stageTasks.every((t) => t.status === 'DONE');

                let status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'LOCKED' = 'TODO';
                let color = originalStage.color;

                if (isStageLockingEnabled && isLocked) {
                  status = 'LOCKED';
                  color = 'border-slate-800/50 text-slate-500';
                } else {
                  if (hasTasks) {
                    if (allTasksDone) {
                      status = 'DONE';
                      color = 'border-emerald-500/30 text-emerald-300';
                    } else {
                      status = 'IN_PROGRESS';
                      color = originalStage.color;
                      // Since this stage is not fully done, all subsequent stages must be locked if locking feature is enabled
                      if (isStageLockingEnabled) {
                        isLocked = true;
                      }
                    }
                  } else {
                    // Empty stage behaves as unlocked/in progress
                    status = 'IN_PROGRESS';
                    color = 'border-slate-700/60 text-slate-400';
                  }
                }

                computedStages.push({
                  ...originalStage,
                  status,
                  color,
                  tasks: stageTasks,
                });
              }

              return (
                <DragDropContext onDragEnd={handlePipelineDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {computedStages.map((stage) => {
                      const isStageLocked = stage.status === 'LOCKED';

                      return (
                        <Droppable key={stage.id} droppableId={stage.id} isDropDisabled={isStageLocked}>
                          {(providedDroppable, snapshotDroppable) => (
                            <div
                              ref={providedDroppable.innerRef}
                              {...providedDroppable.droppableProps}
                              className={`solar-glass-card p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-xl flex flex-col min-h-[320px] ${
                                snapshotDroppable.isDraggingOver
                                  ? 'border-purple-400/80 bg-purple-950/40 ring-2 ring-purple-400/30'
                                  : isStageLocked
                                  ? 'bg-slate-950/40 border-slate-900/60 opacity-50'
                                  : `bg-[#0F172A]/90 ${stage.color}`
                              }`}
                            >
                              {isStageLocked && (
                                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] z-10 flex flex-col items-center justify-center pointer-events-none">
                                  <Lock className="w-8 h-8 text-rose-500/40 mb-1" />
                                  <span className="text-[10px] font-mono text-rose-400/50 font-bold uppercase tracking-wider">
                                    GIAI ĐOẠN ĐANG KHÓA
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                                <span className={`font-extrabold text-sm ${isStageLocked ? 'text-slate-500' : 'text-white'}`}>
                                  {stage.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border ${
                                    isStageLocked
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      : stage.status === 'DONE'
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  }`}
                                >
                                  {isStageLocked && <Lock className="w-2.5 h-2.5" />}
                                  {isStageLocked ? 'LOCKED' : stage.status} ({stage.tasks.length})
                                </span>
                              </div>

                              <div className={`space-y-3 flex-1 ${isStageLocked ? 'select-none pointer-events-none' : ''}`}>
                                {stage.tasks.map((t, index) => {
                                  const isAdminRole = user?.globalRole === 'ADMIN';
                                  const hasAssignee = Boolean(t.assigneeId || t.assignee?.id || t.assignee?.email);
                                  const isMyOwnTask = hasAssignee
                                    ? (t.assigneeId === user?.id ||
                                       t.assignee?.id === user?.id ||
                                       t.assignee?.email === user?.email)
                                    : (t as any).createdById === user?.id;
                                  const isDragDisabled = isStageLocked || (!isAdminRole && !isMyOwnTask);

                                  return (
                                    <Draggable key={t.id} draggableId={t.id} index={index} isDragDisabled={isDragDisabled}>
                                      {(providedDraggable, snapshotDraggable) => {
                                        const cardElement = (
                                          <div
                                            ref={providedDraggable.innerRef}
                                            {...providedDraggable.draggableProps}
                                            {...providedDraggable.dragHandleProps}
                                            style={{
                                              ...providedDraggable.draggableProps.style,
                                              pointerEvents: 'auto',
                                            }}
                                            className={`transform-gpu ${
                                              snapshotDraggable.isDragging
                                                ? '!z-[999999] rotate-2 scale-105 shadow-[0_0_60px_rgba(168,85,247,0.8)] border-2 border-purple-400 rounded-2xl bg-[#0F172A] cursor-grabbing'
                                                : snapshotDraggable.isDropAnimating || recentlyMovedTaskId === t.id
                                                ? 'animate-solar-drop-snap border-2 border-purple-400/90 rounded-2xl shadow-[0_0_35px_rgba(168,85,247,0.6)]'
                                                : 'hover:-translate-y-0.5 transition-transform duration-150'
                                            }`}
                                          >
                                            <KanbanCard
                                              task={t}
                                              onRequestTransfer={handleQuickRequest}
                                              onCardClick={(taskItem) => setSelectedTaskForDetail(taskItem)}
                                              onToggleSubtask={handleToggleSubtask}
                                              onDeleteTask={(taskItem) => {
                                                setTaskToDelete(taskItem);
                                                setIsDeleteModalOpen(true);
                                              }}
                                            />
                                          </div>
                                        );

                                        if (snapshotDraggable.isDragging) {
                                          return ReactDOM.createPortal(cardElement, getPortalRoot());
                                        }

                                        return cardElement;
                                      }}
                                    </Draggable>
                                  );
                                })}
                                {providedDroppable.placeholder}
                                {stage.tasks.length === 0 && (
                                  <div className="h-24 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] font-mono text-slate-600">
                                    Kéo thả Task vào giai đoạn này
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                </DragDropContext>
              );
            })()}
          </div>
        );
      })()}

      {/* 🎯 VIEW 3: MY FOCUS QUEUE VIEW (TÍCH HỢP ƯU TIÊN SẮP XẾP & CẬP NHẬT TIẾN ĐỘ THỜI GIAN THỰC) */}
      {activeView === 'focus' && (() => {
        // Priority weight dictionary
        const priorityWeight = { URGENT: 1, IMPORTANT: 2, NORMAL: 3, LOW: 4 };

        // Filter tasks assigned to current user & exclude completed tasks (progress = 100% or status = DONE)
        let myFocusTasks = filteredTasks.filter((t) => {
          if (t.progress >= 100 || t.status === 'DONE') return false;
          if (!user) return true;
          return (
            t.assigneeId === user.id ||
            t.assignee?.id === user.id ||
            t.assignee?.email === user.email
          );
        });

        // Apply Priority Filter Mode
        if (focusFilterMode === 'URGENT') {
          myFocusTasks = myFocusTasks.filter(
            (t) => t.priority === 'URGENT' || t.priority === 'IMPORTANT'
          );
        } else if (focusFilterMode === 'IN_PROGRESS') {
          myFocusTasks = myFocusTasks.filter((t) => t.status === 'IN_PROGRESS');
        }

        // Auto-sort Focus Queue by Priority (URGENT first)
        myFocusTasks.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

        // 🎯 CHỈ LẤY TASK CÓ TRẠNG THÁI IN_PROGRESS ĐƯA VÀO HERO FOCUS TASK #1
        const heroTask = myFocusTasks.find((t) => t.status === 'IN_PROGRESS');
        const queueTasks = myFocusTasks.filter((t) => t.id !== heroTask?.id);

        // Quick Progress update handler for Hero Task
        const updateHeroProgress = (newProgress: number) => {
          if (!heroTask) return;
          const newStatus = newProgress === 100 ? 'DONE' : newProgress === 0 ? 'TODO' : 'IN_PROGRESS';
          setTasks((prev) =>
            prev.map((t) => (t.id === heroTask.id ? { ...t, progress: newProgress, status: newStatus } : t))
          );
          api.patch(`/tasks/${heroTask.id}/status`, { status: newStatus, progress: newProgress });
        };

        return (
          <div className="space-y-6 pb-12">
            {/* Header & Mode Filters */}
            <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-amber-300 flex items-center gap-2 mb-1">
                  <Target className="w-6 h-6 text-amber-400 animate-pulse" />
                  Hàng Chờ Tập Trung Cá Nhân (My Focus Queue)
                </h2>
                <p className="text-xs text-slate-300">
                  Tự động sắp xếp các công việc cấp bách nhất cần bạn xử lý theo thứ tự ưu tiên.
                </p>
              </div>

              {/* Focus Filters */}
              <div className="flex items-center gap-2 overflow-x-auto shrink-0">
                <button
                  onClick={() => setFocusFilterMode('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    focusFilterMode === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  🎯 Tất Cả Focus
                </button>
                <button
                  onClick={() => setFocusFilterMode('URGENT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    focusFilterMode === 'URGENT'
                      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  🚨 Cần Làm Gấp (Urgent)
                </button>
                <button
                  onClick={() => setFocusFilterMode('IN_PROGRESS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    focusFilterMode === 'IN_PROGRESS'
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  ⚡ Đang Thực Hiện
                </button>
              </div>
            </div>

            {/* Hero Focus Card #1 */}
            {heroTask ? (
              <div className="solar-glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-[#0F172A] to-purple-600/15 border-2 border-amber-400/80 shadow-2xl relative space-y-5 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-lg">
                    <Zap className="w-4 h-4 fill-current" /> HERO FOCUS TASK #1 (ĐANG XỬ LÝ CHÍNH)
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-300 font-mono font-bold">
                      📁 {heroTask.projectName || 'Solaris Core'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold ${
                        heroTask.priority === 'URGENT'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                          : heroTask.priority === 'IMPORTANT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      MỨC ƯU TIÊN: {heroTask.priority}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {heroTask.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {heroTask.description ||
                    'Tập trung xử lý hoàn tất các nhiệm vụ được phân công cá nhân.'}
                </p>

                {/* 🎚️ DYNAMIC PROGRESS CONTROL BAR */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-amber-400" /> Cập Nhật Tiến Độ Nhiệm Vụ:
                    </span>
                    <span className="text-amber-400 font-extrabold text-sm">{heroTask.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${heroTask.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => updateHeroProgress(0)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-[11px] font-mono border border-slate-800 cursor-pointer"
                    >
                      0% (Chưa làm)
                    </button>
                    <button
                      onClick={() => updateHeroProgress(25)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => updateHeroProgress(50)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                    >
                      50% (Một Nửa)
                    </button>
                    <button
                      onClick={() => updateHeroProgress(75)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => updateHeroProgress(100)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono border border-emerald-500/40 cursor-pointer font-bold"
                    >
                      100% (Hoàn Thành)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 flex-wrap">
                  {heroTask.status !== 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateHeroProgress(Math.max(heroTask.progress, 10))}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    >
                      <Play className="w-4 h-4 fill-current" /> Bắt Đầu Làm Task
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Đổi trạng thái Hero Task về TODO để tự động chuyển xuống Hàng Chờ
                      setTasks((prev) =>
                        prev.map((t) => (t.id === heroTask.id ? { ...t, status: 'TODO' } : t))
                      );
                      api.patch(`/tasks/${heroTask.id}/status`, { status: 'TODO' });
                      showNotification(
                        `⏸️ Đã tạm dừng Task "${heroTask.title}" và chuyển về Hàng Chờ!`,
                        'info',
                        'Focus Queue'
                      );
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <Pause className="w-4 h-4" /> Tạm Dừng Task
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDoneTask({ taskId: heroTask.id, taskTitle: heroTask.title });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Đánh Dấu Hoàn Thành
                  </button>
                </div>
              </div>
            ) : (
              <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30 text-center space-y-3">
                <Target className="w-12 h-12 text-amber-400 mx-auto opacity-80 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Chưa Có Task Nào Đang Thực Hiện (IN_PROGRESS)</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Hero Focus Task #1 chỉ hiển thị các nhiệm vụ bạn đang trực tiếp thực hiện (`IN_PROGRESS`). Hãy bấm chọn một Task trong Hàng chờ bên dưới và click <strong className="text-amber-300 font-mono">"▶️ Tiếp Tục Làm Task"</strong> để đưa lên làm việc!
                </p>
              </div>
            )}

            {/* Queue List */}
            {queueTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Hàng Chờ Ưu Tiên Tiếp Theo Của Bạn ({queueTasks.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {queueTasks.map((t) => (
                    <div key={t.id} className="space-y-2">
                      <KanbanCard
                        task={t}
                        onRequestTransfer={handleQuickRequest}
                        onCardClick={(taskItem) => setSelectedTaskForDetail(taskItem)}
                        onToggleSubtask={handleToggleSubtask}
                      />
                      <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] font-mono text-slate-400">
                          Trạng thái: <strong className="text-amber-400 uppercase font-bold">{t.status}</strong>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Nếu đang có heroTask, đưa heroTask về TODO hoặc để task mới này chiếm vị trí HERO
                            setTasks((prev) =>
                              prev.map((item) => {
                                if (item.id === t.id) return { ...item, status: 'IN_PROGRESS' };
                                if (heroTask && item.id === heroTask.id) return { ...item, status: 'TODO' };
                                return item;
                              })
                            );
                            if (heroTask) {
                              api.patch(`/tasks/${heroTask.id}/status`, { status: 'TODO' });
                            }
                            api.patch(`/tasks/${t.id}/status`, { status: 'IN_PROGRESS' });
                            showNotification(
                              `🟢 Task "${t.title}" đã được chuyển lên vị trí HERO FOCUS TASK #1 (Đang xử lý chính)!`,
                              'success',
                              'Focus Queue'
                            );
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> ▶️ Tiếp Tục Làm Task
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 📜 VIEW 4: AUDIT LOG & LƯU TRỮ HỆ THỐNG (TỰ ĐỘNG LƯU TASK HOÀN THÀNH > 2 NGÀY & TASK ĐÃ XÓA) */}
      {activeView === 'audit' && (() => {
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header Bento Box */}
            <div className="solar-glass-card p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-950 to-cyan-950/40 border border-cyan-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <History className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-black text-white tracking-wide">
                    AUDIT LOG & LƯU TRỮ VĨNH VIỄN (TASK ARCHIVES)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Hệ thống tự động lưu trữ các Task hoàn thành sau 2 ngày và các Task đã di chuyển vào Thùng rác để phục vụ kiểm toán (Audit Trail).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchArchivedTasks}
                  disabled={isLoadingArchived}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingArchived ? 'animate-spin' : ''}`} />
                  Làm Mới Audit Log
                </button>
              </div>
            </div>

            {/* Content List */}
            {isLoadingArchived ? (
              <div className="h-64 flex items-center justify-center text-cyan-400 font-mono text-xs gap-3">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Đang tải dữ liệu Audit Log từ PostgreSQL Database...
              </div>
            ) : archivedTasks.length === 0 ? (
              <div className="h-64 solar-glass-card rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Archive className="w-8 h-8 opacity-40 text-cyan-400" />
                <span className="text-xs font-mono">Hiện chưa có Task nào được chuyển về Audit Log</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskForDetail(t)}
                    className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                        📁 {t.projectName}
                      </span>
                      {t.isDeleted ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold font-mono">
                          🗑️ ĐÃ XÓA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono">
                          📜 LƯU TRỮ SAU 2 NGÀY
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-white text-sm group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {t.title}
                    </h4>

                    <p className="text-slate-400 text-xs line-clamp-2 font-normal">
                      {t.description || 'Không có mô tả chi tiết'}
                    </p>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>👤 {t.assignee?.fullName || 'Chưa phân công'}</span>
                      </div>
                      <span className="text-slate-400">
                        {t.dueDate ? `Hạn: ${t.dueDate}` : 'Hoàn tất'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* 🌌 TASK DETAIL MINISITE MODAL */}
      <TaskDetailModal
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        task={selectedTaskForDetail}
        onUpdateTask={(updatedTask) => {
          setSelectedTaskForDetail(updatedTask);
          setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)));
          showNotification('🟢 Đã cập nhật mô tả Task thành công!', 'success', 'Cập Nhật Task');
        }}
        onDeleteTask={(t) => {
          setTaskToDelete(t);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* 🗑️ DELETE TASK CONFIRMATION MODAL */}
      <DeleteTaskConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTask}
        taskTitle={taskToDelete?.title || ''}
        isSubmitting={isDeleting}
      />

      {/* 📬 TASK REQUEST MODAL */}
      <TaskRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        tasks={tasks}
        initialTask={selectedTaskForRequest}
        onSubmitSuccess={(msg) => {
          showNotification(msg, 'success', 'Yêu Cầu Task Đã Gửi');
          fetchTasksFromBackend();
        }}
      />

      {/* 📥 INCOMING TASK TRANSFER INBOX MODAL */}
      <TaskTransferInboxModal
        isOpen={isTransferInboxOpen}
        onClose={() => setIsTransferInboxOpen(false)}
        onSuccess={() => {
          showNotification('🟢 Đã tiếp nhận và cập nhật phân công Task thành công!', 'success', 'Yêu Cầu Chuyển Giao');
          fetchTasksFromBackend();
        }}
      />

      {/* 📁 CREATE PROJECT MODAL */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSuccess={() => {
          showNotification('🟢 Khởi tạo Dự Án Mới vào CSDL PostgreSQL thành công!', 'success', 'Tạo Dự Án');
          fetchTasksFromBackend();
        }}
      />

      {/* ➕ CREATE TASK MODAL */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSuccess={() => {
          showNotification('🟢 Khởi tạo Task Mới vào CSDL PostgreSQL thành công!', 'success', 'Tạo Task');
          fetchTasksFromBackend();
        }}
      />

      {/* 🟢 MODAL XÁC NHẬN KHI KÉO TASK SANG CỘT DONE */}
      <SolarNotificationModal
        isOpen={!!confirmDoneTask}
        onClose={() => setConfirmDoneTask(null)}
        type="success"
        title="Xác Nhận Hoàn Thành Task"
        message={`Bạn có chắc chắn muốn đánh dấu Task "${confirmDoneTask?.taskTitle}" là HOÀN THÀNH (DONE - 100% Tiến Độ) không?`}
        confirmText="🚀 Xác Nhận Hoàn Thành"
        onConfirm={executeMoveToDone}
      />

      {/* 🔔 SOLAR NOTIFICATION MODAL BÌNH THƯỜNG */}
      <SolarNotificationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};
