import React, { useState, useEffect } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
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
import type { TaskItem } from '../components/kanban/KanbanCard';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { PipelineView } from '../components/kanban/views/PipelineView';
import { FocusCockpitView } from '../components/kanban/views/FocusCockpitView';
import { KanbanBoardView } from '../components/kanban/views/KanbanBoardView';
import { BoardHeaderToolbar } from '../components/kanban/views/BoardHeaderToolbar';
import { BoardModalsContainer } from '../components/kanban/views/BoardModalsContainer';

export const BoardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [activeView, setActiveView] = useState<'kanban' | 'pipeline' | 'focus'>('kanban');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTransferInboxOpen, setIsTransferInboxOpen] = useState(false);
  const [pendingNotificationCount, setPendingNotificationCount] = useState<number>(0);
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
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);
  const [isProjectMembersModalOpen, setIsProjectMembersModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Metadata States (Read from PostgreSQL DB)
  const [dbProjects, setDbProjects] = useState<Array<any>>([]);
  const [dbUsers, setDbUsers] = useState<Array<{ id: string; fullName: string }>>([]);

  // Multi-Criteria Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterProfession, setFilterProfession] = useState<string>('ALL');

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

  useEffect(() => {
    fetchMetadata();
  }, [token]);

  // State xác nhận khi kéo Task vào cột DONE
  const [confirmDoneTask, setConfirmDoneTask] = useState<{
    taskId: string;
    taskTitle: string;
  } | null>(null);

  // 🌟 State Prompt Hỏi Tiến Hành Việc Ngày Mai (Tôn trọng thời gian nhân viên)
  const [workAheadModal, setWorkAheadModal] = useState<{
    taskId: string;
    taskTitle: string;
    nextSubtaskTitle: string;
    nextDayIndex: number;
    dueDate?: string;
  } | null>(null);

  // ☕ / ⚡ Trạng thái Nghỉ Ngơi vs Làm Trước Việc Ngày Mai cho Task
  const [, setRestingTodayTasks] = useState<Record<string, boolean>>({});
  const [, setWorkingAheadTasks] = useState<Record<string, boolean>>({});

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

  const fetchNotificationCount = async () => {
    try {
      const res = await api.get('/tasks/requests/incoming');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPendingNotificationCount(list.length);
    } catch {
      // Fallback
    }
  };

  const fetchProjectsFromBackend = async () => {
    try {
      const res = await api.get('/projects');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDbProjects(list);
    } catch {
      // Fallback
    }
  };

  const handleToggleProjectCompletion = async (projectId: string, isCompleted: boolean) => {
    try {
      await api.patch(`/projects/${projectId}`, { isCompleted });
      showNotification(
        isCompleted
          ? '🎉 Đã xác nhận nghiệm thu và hoàn thành dự án thành công!'
          : '🔄 Đã mở lại dự án thành công!',
        'success',
        isCompleted ? 'Nghiệm Thu Thành Công' : 'Đã Mở Lại Dự Án'
      );
      fetchProjectsFromBackend();
      fetchTasksFromBackend();
    } catch (err: any) {
      showNotification(
        err?.response?.data?.message || 'Không thể cập nhật trạng thái dự án.',
        'warning',
        'Lỗi Cập Nhật'
      );
    }
  };

  useEffect(() => {
    fetchTasksFromBackend();
    fetchProjectsFromBackend();
    fetchNotificationCount();
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
      fetchNotificationCount();
    };

    const handleApprovalRequested = (data: any) => {
      fetchTasksFromBackend();
      fetchNotificationCount();
      showNotification(
        `🔔 Có yêu cầu xác thực Task con: "${data?.subtaskTitle || 'Task con'}" từ ${data?.senderName || 'Đồng nghiệp'}`,
        'info',
        'Yêu Cầu Xác Thực'
      );
    };

    const handleSubtaskReviewed = (data: any) => {
      fetchTasksFromBackend();
      fetchNotificationCount();
      if (data?.action === 'APPROVE') {
        showNotification(
          `🎉 Quản lý đã duyệt hoàn thành Task con: "${data?.subtaskTitle || 'Task con'}"!`,
          'success',
          'Đã Phê Duyệt'
        );
      } else {
        showNotification(
          `⚠️ Quản lý từ chối Task con: "${data?.subtaskTitle || 'Task con'}". Lý do: ${data?.reason || 'Cần kiểm tra lại'}`,
          'warning',
          'Chưa Đạt Yêu Cầu'
        );
      }
    };

    socketService.on('task:created', handleSocketUpdate);
    socketService.on('task:updated', handleSocketUpdate);
    socketService.on('task:deleted', handleSocketUpdate);
    socketService.on('comment:created', handleSocketUpdate);
    socketService.on('task:approval-requested', handleApprovalRequested);
    socketService.on('task:subtask-reviewed', handleSubtaskReviewed);

    // Auto-fetch latest task dataset on connection restored
    const unsubscribeReconnect = socketService.onReconnect(() => {
      console.log('🔄 Syncing full task state after connection restored');
      fetchTasksFromBackend();
      fetchNotificationCount();
    });

    return () => {
      socketService.off('task:created', handleSocketUpdate);
      socketService.off('task:updated', handleSocketUpdate);
      socketService.off('task:deleted', handleSocketUpdate);
      socketService.off('comment:created', handleSocketUpdate);
      socketService.off('task:approval-requested', handleApprovalRequested);
      socketService.off('task:subtask-reviewed', handleSubtaskReviewed);
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
  const handleToggleSubtask = async (taskId: string, subtaskId: string, _isDone?: boolean) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const targetSubtask = targetTask?.subtasks?.find((st) => st.id === subtaskId);
    if (targetSubtask?.isDone) {
      showNotification('🔒 Task con này đã hoàn thành và được xác nhận, không thể thay đổi.', 'warning', 'Đã Khóa');
      return;
    }

    const isAdminOrManager = Boolean(
      user &&
        (user.globalRole === 'ADMIN' ||
          user.globalRole === 'MANAGER' ||
          (user as any).role === 'ADMIN' ||
          (user as any).role === 'MANAGER')
    );

    // Optimistic UI update across all task lists (Không giật % nếu là nhân viên nộp duyệt)
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const subtasks = (t.subtasks || []).map((st: any) => {
          if (st.id !== subtaskId) return st;
          if (isAdminOrManager) {
            return { ...st, isDone: true, approvalStatus: 'APPROVED' };
          }
          return { ...st, isDone: false, approvalStatus: 'PENDING' };
        });
        const completedCount = subtasks.filter((st) => st.isDone).length;
        const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : t.progress;
        return { ...t, subtasks, progress };
      })
    );

    try {
      const res = await api.patch(`/tasks/subtasks/${subtaskId}`, { isDone: true });
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
      console.error('Lỗi khi cập nhật Task con:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Không thể cập nhật Task con';
      showNotification(serverMsg, 'warning', 'Lỗi Cập Nhật Task Con');
      fetchTasksFromBackend();
    }
  };

  // 🎯 Handler hoàn thành mục tiêu ngày hôm nay kèm cơ chế Prompt Tôn Trọng Nhân Viên
  const handleCompleteTodaySubtask = async (task: TaskItem, todaySubtask: any, currentPendingIdx: number) => {
    if (task.status === 'PAUSED' || task.status === 'BLOCKED') {
      showNotification(
        `Task "${task.title}" đang ở trạng thái ${task.status === 'PAUSED' ? 'Tạm Dừng' : 'Bị Khóa/Nghẽn'}, không thể nộp Task con.`,
        'warning',
        'Task Đang Tạm Dừng'
      );
      return;
    }

    await handleToggleSubtask(task.id, todaySubtask.id, true);

    const subtasks = task.subtasks || [];
    const nextIdx = currentPendingIdx + 1;
    const nextSubtask = nextIdx < subtasks.length ? subtasks[nextIdx] : null;

    if (nextSubtask) {
      setWorkAheadModal({
        taskId: task.id,
        taskTitle: task.title,
        nextSubtaskTitle: nextSubtask.title,
        nextDayIndex: nextIdx + 1,
        dueDate: task.dueDate,
      });
    } else {
      showNotification(`🎉 Bạn đã hoàn thành xuất sắc toàn bộ các Task con của "${task.title}"!`, 'success', 'Hoàn Thành Task');
    }
  };

  // 🚀 FIXED DRAG-AND-DROP HANDLER WITH OPTIMISTIC UPDATES & ATOMIC BACKEND SYNC
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Drop outside any container
    if (!destination) return;

    // Drop in the exact same spot
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetStatus = destination.droppableId as TaskItem['status'];
    const taskToMove = tasks.find((t) => t.id === draggableId);
    if (!taskToMove) return;

    // 🔒 1. BỊ CẤM: Drag Ownership Rule
    const isManagerOrAdmin = Boolean(
      user?.globalRole === 'ADMIN' ||
      user?.globalRole === 'MANAGER' ||
      (user as any)?.role === 'ADMIN' ||
      (user as any)?.role === 'MANAGER'
    );
    const hasAssignee = Boolean(taskToMove.assigneeId || taskToMove.assignee?.id || taskToMove.assignee?.email);
    const isSubtaskAssignee = Boolean(
      taskToMove.subtasks &&
      taskToMove.subtasks.some((st) => st.assigneeId === user?.id || st.assignee?.id === user?.id)
    );
    const isTaskOwner = hasAssignee
      ? (taskToMove.assigneeId === user?.id ||
         taskToMove.assignee?.id === user?.id ||
         taskToMove.assignee?.email === user?.email ||
         isSubtaskAssignee)
      : (taskToMove as any).createdById === user?.id || isSubtaskAssignee;

    if (!isManagerOrAdmin && !isTaskOwner) {
      showNotification(
        `Task này đã được giao cho ${taskToMove.assignee?.fullName || 'thành viên khác'}! Bạn không có quyền kéo thả Task của người khác.`,
        'warning',
        'Quyền Hạn Bị Từ Chối (Drag Ownership)'
      );
      return;
    }

    // 🔒 2. BỊ CẤM: Cột IN_REVIEW bị khóa
    if (taskToMove.status === 'IN_REVIEW' || targetStatus === 'IN_REVIEW') {
      showNotification(
        'Cột CHỜ DUYỆT BÀI (IN_REVIEW) là tự động! Không thể kéo thả thủ công vào hoặc ra khỏi cột này.',
        'warning',
        'Khóa Cột Chờ Duyệt (IN_REVIEW Lock)'
      );
      return;
    }

    // 🎯 3. KÉO VÀO CỘT DONE -> KIỂM TRA SUBTASK CHƯA DUYỆT
    if (targetStatus === 'DONE') {
      const subtasks = taskToMove.subtasks || [];
      const hasUnfinishedSubtasks = subtasks.length > 0 && subtasks.some((st) => !st.isDone);
      if (hasUnfinishedSubtasks) {
        showNotification(
          `Không thể chuyển sang Hoàn Thành khi còn ${subtasks.filter((st) => !st.isDone).length} Task con chưa được Quản lý phê duyệt (Tiến độ: ${taskToMove.progress || 0}%).`,
          'warning',
          'Chưa Hoàn Tất Task Con'
        );
        return;
      }

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

    const safeProgress = Math.round(targetStatus === 'TODO' ? 0 : (taskToMove.progress || 0));

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === draggableId) {
          return { ...t, status: targetStatus, progress: safeProgress };
        }
        return t;
      })
    );

    // 🚀 Cập nhật CSDL ngầm
    api.patch(`/tasks/${draggableId}/status`, {
      status: targetStatus,
      progress: safeProgress,
    }).catch((err: any) => {
      const respMsg = err.response?.data?.message;
      const errMsg = Array.isArray(respMsg)
        ? respMsg.join(', ')
        : (respMsg || err.message || 'Không thể cập nhật trạng thái Task');
      showNotification(errMsg, 'warning', 'Lỗi Cập Nhật Trạng Thái');
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

    // 🔒 1. Drag Ownership Rule: Cho phép Assignee, Admin hoặc Manager có quyền kéo
    const isManagerOrAdmin = Boolean(
      user?.globalRole === 'ADMIN' ||
      user?.globalRole === 'MANAGER' ||
      (user as any)?.role === 'ADMIN' ||
      (user as any)?.role === 'MANAGER'
    );
    const hasAssignee = Boolean(taskToMove.assigneeId || taskToMove.assignee?.id || taskToMove.assignee?.email);
    const isSubtaskAssignee = Boolean(
      taskToMove.subtasks &&
      taskToMove.subtasks.some((st) => st.assigneeId === user?.id || st.assignee?.id === user?.id)
    );
    const isTaskOwner = hasAssignee
      ? (taskToMove.assigneeId === user?.id ||
         taskToMove.assignee?.id === user?.id ||
         taskToMove.assignee?.email === user?.email ||
         isSubtaskAssignee)
      : (taskToMove as any).createdById === user?.id || isSubtaskAssignee;

    if (!isManagerOrAdmin && !isTaskOwner) {
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
    const deletedId = taskToDelete.id;
    const taskTitle = taskToDelete.title;
    setIsDeleting(true);

    // Optimistic UI update: Remove task immediately
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
    setIsDeleteModalOpen(false);
    setSelectedTaskForDetail(null);
    setTaskToDelete(null);

    try {
      await api.delete(`/tasks/${deletedId}`);
      showNotification(`🟢 Solaris: Đã xóa Task "${taskTitle}" (Chuyển vào Thùng Rác 14 ngày)!`, 'success', 'Xóa Task Thành Công');
      fetchTasksFromBackend();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể xóa Task';
      showNotification(`❌ Lỗi: ${errMsg}`, 'warning', 'Xóa Task Thất Bại');
      fetchTasksFromBackend();
    } finally {
      setIsDeleting(false);
    }
  };

  // 🗑️ Hàm thực thi Xóa Dự Án (Chuyển vào Thùng Rác 14 ngày) dành cho Admin
  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const deletedProjId = projectToDelete.id;
    const deletedProjName = projectToDelete.name;
    setIsDeleting(true);

    // Optimistic UI update: Remove project and its tasks immediately
    setDbProjects((prev) => prev.filter((p) => p.id !== deletedProjId));
    setTasks((prev) => prev.filter((t) => t.projectId !== deletedProjId));
    setProjectToDelete(null);
    setSelectedPipelineProject('ALL');

    try {
      await api.delete(`/projects/${deletedProjId}`);
      showNotification(`🟢 Đã chuyển dự án "${deletedProjName}" vào Thùng Rác (Lưu giữ 14 ngày)!`, 'success', 'Xóa Dự Án');
      fetchMetadata();
      fetchTasksFromBackend();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể xóa dự án';
      showNotification(`❌ Lỗi: ${errMsg}`, 'warning', 'Xóa Dự Án Thất Bại');
      fetchMetadata();
      fetchTasksFromBackend();
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Array<{ id: TaskItem['status']; label: string; color: string; border: string }> = [
    { id: 'TODO', label: 'CẦN LÀM (TODO)', color: 'text-slate-400', border: 'border-slate-800' },
    { id: 'IN_PROGRESS', label: 'ĐANG LÀM (IN PROGRESS)', color: 'text-amber-400', border: 'border-slate-800' },
    { id: 'PAUSED', label: 'TẠM DỪNG (PAUSED)', color: 'text-slate-400', border: 'border-slate-800' },
    { id: 'BLOCKED', label: 'TẮC NGHỄN (BLOCKED)', color: 'text-rose-400', border: 'border-slate-800' },
    { id: 'IN_REVIEW', label: 'CHỜ DUYỆT BÀI (IN REVIEW) 🔒', color: 'text-purple-400', border: 'border-slate-800' },
    { id: 'DONE', label: 'HOÀN THÀNH (DONE)', color: 'text-emerald-400', border: 'border-slate-800' },
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

  return (
    <div className="space-y-5 pb-12">
      <BoardHeaderToolbar
        user={user}
        isLoading={isLoading}
        tasks={tasks}
        dbProjects={dbProjects}
        dbUsers={dbUsers}
        filterProject={filterProject}
        setFilterProject={setFilterProject}
        filterAssignee={filterAssignee}
        setFilterAssignee={setFilterAssignee}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterProfession={filterProfession}
        setFilterProfession={setFilterProfession}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeView={activeView}
        setActiveView={setActiveView}
        pendingNotificationCount={pendingNotificationCount}
        onRefresh={fetchTasksFromBackend}
        onOpenCreateProjectModal={() => setIsCreateProjectModalOpen(true)}
        onOpenProjectMembersModal={() => setIsProjectMembersModalOpen(true)}
        onOpenCreateTaskModal={() => setIsCreateTaskModalOpen(true)}
        onOpenTransferInbox={() => {
          setIsTransferInboxOpen(true);
          fetchNotificationCount();
        }}
        onSelectTaskForDetail={(t) => setSelectedTaskForDetail(t)}
        showNotification={showNotification}
      />

      {activeView === 'kanban' && (
        <KanbanBoardView
          columns={columns}
          filteredTasks={filteredTasks}
          user={user}
          recentlyMovedTaskId={recentlyMovedTaskId}
          onDragEnd={handleDragEnd}
          onQuickRequest={handleQuickRequest}
          onSelectTaskForDetail={(taskItem) => setSelectedTaskForDetail(taskItem)}
          onToggleSubtask={handleToggleSubtask}
          onDeleteTask={(taskItem) => {
            setTaskToDelete(taskItem);
            setIsDeleteModalOpen(true);
          }}
          getPortalRoot={getPortalRoot}
        />
      )}

      {activeView === 'pipeline' && (
        <PipelineView
          user={user}
          tasks={tasks}
          filteredTasks={filteredTasks}
          dbProjects={dbProjects}
          selectedPipelineProject={selectedPipelineProject}
          setSelectedPipelineProject={setSelectedPipelineProject}
          isEditingPipelineStages={isEditingPipelineStages}
          setIsEditingPipelineStages={setIsEditingPipelineStages}
          isStageLockingEnabled={isStageLockingEnabled}
          setIsStageLockingEnabled={setIsStageLockingEnabled}
          activePipelineStages={activePipelineStages}
          setActivePipelineStages={setActivePipelineStages}
          newStageNameInput={newStageNameInput}
          setNewStageNameInput={setNewStageNameInput}
          recentlyMovedTaskId={recentlyMovedTaskId}
          onPipelineDragEnd={handlePipelineDragEnd}
          onQuickRequest={handleQuickRequest}
          onSelectTaskForDetail={(taskItem) => setSelectedTaskForDetail(taskItem)}
          onToggleSubtask={handleToggleSubtask}
          onDeleteTask={(taskItem) => {
            setTaskToDelete(taskItem);
            setIsDeleteModalOpen(true);
          }}
          onToggleProjectCompletion={handleToggleProjectCompletion}
          onSetProjectToDelete={(proj) => setProjectToDelete(proj)}
          onOpenProjectMembersModal={() => setIsProjectMembersModalOpen(true)}
          showNotification={showNotification}
          getPortalRoot={getPortalRoot}
        />
      )}

      {activeView === 'focus' && (
        <FocusCockpitView
          user={user}
          filteredTasks={filteredTasks}
          focusFilterMode={focusFilterMode}
          setFocusFilterMode={setFocusFilterMode}
          onOpenTransferInbox={() => setIsTransferInboxOpen(true)}
          onSelectTaskForDetail={(t) => setSelectedTaskForDetail(t)}
          onConfirmDoneTask={(task) => setConfirmDoneTask(task)}
          onPauseTask={(heroTask) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === heroTask.id ? { ...t, status: 'TODO' } : t))
            );
            api.patch(`/tasks/${heroTask.id}/status`, { status: 'TODO' });
            showNotification(`⏸️ Đã tạm dừng Task "${heroTask.title}"!`, 'info', 'Today Focus');
          }}
          onQuickRequest={handleQuickRequest}
          onActivateHeroTask={(t, heroTask) => {
            setTasks((prev) =>
              prev.map((item) => {
                if (item.id === t.id) return { ...item, status: 'IN_PROGRESS' };
                if (heroTask && item.id === heroTask.id) return { ...item, status: 'TODO' };
                return item;
              })
            );
            if (heroTask) {
              api.patch(`/tasks/${heroTask.id}/status`, { status: 'TODO' }).catch((err) => {
                console.error('Lỗi khi hạ status hero task cũ:', err);
                fetchTasksFromBackend();
              });
            }
            api.patch(`/tasks/${t.id}/status`, { status: 'IN_PROGRESS' })
              .then(() => {
                showNotification(
                  `🟢 Đã đưa Task "${t.title}" lên HERO FOCUS!`,
                  'success',
                  'Today Focus'
                );
              })
              .catch((err) => {
                console.error('Lỗi khi kích hoạt Hero Task:', err);
                showNotification(
                  `❌ Không thể cập nhật trạng thái Task: ${err.response?.data?.message || err.message}`,
                  'warning',
                  'Today Focus'
                );
                fetchTasksFromBackend();
              });
          }}
          onCompleteTodaySubtask={handleCompleteTodaySubtask}
          onToggleSubtask={handleToggleSubtask}
        />
      )}

      <BoardModalsContainer
        selectedTaskForDetail={selectedTaskForDetail}
        setSelectedTaskForDetail={setSelectedTaskForDetail}
        setTasks={setTasks}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        taskToDelete={taskToDelete}
        setTaskToDelete={setTaskToDelete}
        isDeleting={isDeleting}
        handleConfirmDeleteTask={handleConfirmDeleteTask}
        projectToDelete={projectToDelete}
        setProjectToDelete={setProjectToDelete}
        handleConfirmDeleteProject={handleConfirmDeleteProject}
        isRequestModalOpen={isRequestModalOpen}
        setIsRequestModalOpen={setIsRequestModalOpen}
        tasks={tasks}
        selectedTaskForRequest={selectedTaskForRequest}
        fetchTasksFromBackend={fetchTasksFromBackend}
        fetchNotificationCount={fetchNotificationCount}
        isTransferInboxOpen={isTransferInboxOpen}
        setIsTransferInboxOpen={setIsTransferInboxOpen}
        isCreateProjectModalOpen={isCreateProjectModalOpen}
        setIsCreateProjectModalOpen={setIsCreateProjectModalOpen}
        dbProjects={dbProjects}
        setDbProjects={setDbProjects}
        fetchMetadata={fetchMetadata}
        isCreateTaskModalOpen={isCreateTaskModalOpen}
        setIsCreateTaskModalOpen={setIsCreateTaskModalOpen}
        confirmDoneTask={confirmDoneTask}
        setConfirmDoneTask={setConfirmDoneTask}
        executeMoveToDone={executeMoveToDone}
        workAheadModal={workAheadModal}
        setWorkAheadModal={setWorkAheadModal}
        setRestingTodayTasks={setRestingTodayTasks}
        setWorkingAheadTasks={setWorkingAheadTasks}
        filterProject={filterProject}
        isProjectMembersModalOpen={isProjectMembersModalOpen}
        setIsProjectMembersModalOpen={setIsProjectMembersModalOpen}
        modalState={modalState}
        setModalState={setModalState}
        showNotification={showNotification}
      />
      
    </div>
    
  );
};
