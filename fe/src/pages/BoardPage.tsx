import React, { useState, useEffect, useRef } from 'react';
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
import { ProjectMembersModal } from '../components/kanban/ProjectMembersModal';
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
  Users,
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
  Paperclip,
  Upload,
  FileText,
  ExternalLink,
  Trash2,
  Link2,
  Download,
  Bell,
} from 'lucide-react';

import { TaskTransferInboxModal } from '../components/kanban/TaskTransferInboxModal';
import { DeleteTaskConfirmModal } from '../components/kanban/DeleteTaskConfirmModal';

export const BoardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [activeView, setActiveView] = useState<'kanban' | 'pipeline' | 'focus' | 'audit'>('kanban');
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);
  const [isProjectMembersModalOpen, setIsProjectMembersModalOpen] = useState(false);

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

  // 🌟 State Prompt Hỏi Tiến Hành Việc Ngày Mai (Tôn trọng thời gian nhân viên)
  const [workAheadModal, setWorkAheadModal] = useState<{
    taskId: string;
    taskTitle: string;
    nextSubtaskTitle: string;
    nextDayIndex: number;
    dueDate?: string;
  } | null>(null);

  // ☕ / ⚡ Trạng thái Nghỉ Ngơi vs Làm Trước Việc Ngày Mai cho Task
  const [restingTodayTasks, setRestingTodayTasks] = useState<Record<string, boolean>>({});
  const [workingAheadTasks, setWorkingAheadTasks] = useState<Record<string, boolean>>({});

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

  // 📎 Cockpit Attachment States & Handlers
  const cockpitFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCockpitAtt, setIsUploadingCockpitAtt] = useState(false);
  const [showCockpitAddUrl, setShowCockpitAddUrl] = useState(false);
  const [cockpitUrlInput, setCockpitUrlInput] = useState('');
  const [cockpitUrlTitleInput, setCockpitUrlTitleInput] = useState('');

  const handleCockpitFileUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploadingCockpitAtt(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newAtt = res.data?.data || res.data;
      if (newAtt && newAtt.id) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, attachments: [newAtt, ...(t.attachments || [])] }
              : t
          )
        );
        showNotification(`📎 Đã tải lên tài liệu "${newAtt.name}" thành công!`, 'success', 'Tải Tài Liệu');
      }
    } catch (err: any) {
      console.error('Lỗi tải file:', err);
      showNotification('Không thể tải file lên CSDL', 'warning', 'Lỗi Tải File');
    } finally {
      setIsUploadingCockpitAtt(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCockpitAddUrl = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!cockpitUrlInput.trim()) return;
    const formattedUrl = cockpitUrlInput.startsWith('http') ? cockpitUrlInput : `https://${cockpitUrlInput}`;
    const name = cockpitUrlTitleInput.trim() || formattedUrl;
    try {
      const res = await api.post(`/tasks/${taskId}/attachments`, {
        name,
        url: formattedUrl,
        type: 'link',
      });
      const newAtt = res.data?.data || res.data;
      if (newAtt && newAtt.id) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, attachments: [newAtt, ...(t.attachments || [])] }
              : t
          )
        );
        showNotification(`🔗 Đã đính kèm liên kết "${name}" thành công!`, 'success', 'Đính Kèm Link');
      }
      setCockpitUrlInput('');
      setCockpitUrlTitleInput('');
      setShowCockpitAddUrl(false);
    } catch (err: any) {
      console.error('Lỗi thêm liên kết:', err);
      showNotification('Không thể thêm liên kết', 'warning', 'Lỗi Đính Kèm');
    }
  };

  const handleCockpitDeleteAttachment = async (taskId: string, attachmentId: string) => {
    try {
      await api.delete(`/tasks/attachments/${attachmentId}`);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, attachments: (t.attachments || []).filter((a) => a.id !== attachmentId) }
            : t
        )
      );
      showNotification('Đã xóa tệp đính kèm', 'info', 'Xóa Đính Kèm');
    } catch (err: any) {
      console.error('Lỗi xóa file:', err);
      showNotification('Không thể xóa tệp đính kèm', 'warning', 'Lỗi');
    }
  };

  const handleCockpitDownloadAttachment = (att: any) => {
    let downloadUrl = att.url;
    if (att.url && att.url.startsWith('/uploads/')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const backendUrl = apiBase.replace('/api', '');
      downloadUrl = `${backendUrl}${att.url}`;
    }
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = att.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const fetchNotificationCount = async () => {
    try {
      const res = await api.get('/tasks/requests/incoming');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPendingNotificationCount(list.length);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchTasksFromBackend();
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
    const isAdmin = user?.globalRole === 'ADMIN';
    const hasAssignee = Boolean(taskToMove.assigneeId || taskToMove.assignee?.id || taskToMove.assignee?.email);
    const isTaskOwner = hasAssignee
      ? (taskToMove.assigneeId === user?.id ||
         taskToMove.assignee?.id === user?.id ||
         taskToMove.assignee?.email === user?.email)
      : (taskToMove as any).createdById === user?.id;

    if (!isAdmin && !isTaskOwner) {
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
              onClick={() => setIsProjectMembersModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg group"
              title="Xem danh sách, thêm nhân sự mới hoặc xóa nhân viên khỏi dự án"
            >
              <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>👥 Quản Lý Thành Viên</span>
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

          {/* 🔔 NÚT HIỂN THỊ THÔNG BÁO & PHÊ DUYỆT */}
          <button
            onClick={() => {
              setIsTransferInboxOpen(true);
              fetchNotificationCount();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition-all relative cursor-pointer shadow-md group"
            title="Trung Tâm Thông Báo & Phê Duyệt Task / Task Con"
          >
            <div className="relative">
              <Bell className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              {pendingNotificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  {pendingNotificationCount}
                </span>
              )}
            </div>
            <span>Thông Báo & Duyệt</span>
            {pendingNotificationCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold">
                {pendingNotificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 🔍 Advanced Filter Toolbar */}
      <div className="solar-glass-card p-4 rounded-2xl bg-[#0F172A]/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* View Switcher Tabs with Animated Sliding Pill Indicator */}
        {(() => {
          const tabs = [
            {
              id: 'focus',
              label: "☀️ Today's Focus Cockpit",
              icon: Target,
              color: 'from-amber-500 via-orange-500 to-amber-600',
              shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
              activeText: 'text-slate-950 font-black',
            },
            {
              id: 'pipeline',
              label: '🌌 Master Plan & Roadmap',
              icon: GitMerge,
              color: 'from-purple-600 via-indigo-600 to-blue-600',
              shadow: 'shadow-[0_0_20px_rgba(147,51,234,0.5)]',
              activeText: 'text-white font-black',
            },
            {
              id: 'kanban',
              label: '📊 Kanban Matrix',
              icon: Kanban,
              color: 'from-blue-600 to-cyan-600',
              shadow: 'shadow-[0_0_20px_rgba(37,99,235,0.4)]',
              activeText: 'text-white font-bold',
            },
            ...(user?.globalRole === 'ADMIN'
              ? [
                  {
                    id: 'audit',
                    label: '🗄️ Audit Log',
                    icon: Archive,
                    color: 'from-cyan-500 to-blue-600',
                    shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
                    activeText: 'text-slate-950 font-bold',
                  },
                ]
              : []),
          ];

          const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeView));
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

      {/* 📈 VIEW 2: MASTER PLAN & PROJECT ROADMAP (VÒNG ĐỜI DỰ ÁN & TIẾN TRÌNH GIAI ĐOẠN) */}
      {activeView === 'pipeline' && (() => {
        // Dynamic list of unique projects filtered by Role: Admin sees all, Manager sees managed projects, Member sees assigned projects
        const isManager = user?.globalRole === 'MANAGER';
        const isMember = user?.globalRole !== 'ADMIN' && user?.globalRole !== 'MANAGER';

        let rawProjectList = tasks.map((t) => t.projectName).filter(Boolean) as string[];

        if (isManager || isMember) {
          const myProjects = tasks
            .filter(
              (t) =>
                t.assigneeId === user?.id ||
                t.assignee?.id === user?.id ||
                (t as any).createdById === user?.id
            )
            .map((t) => t.projectName)
            .filter(Boolean) as string[];

          rawProjectList = rawProjectList.filter((pName) => myProjects.includes(pName));
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
                  🌌 Kế Hoạch Tổng Thể & Lộ Trình Dự Án (Master Plan & Roadmap)
                </h2>
                <p className="text-xs text-slate-300">
                  Trực quan hóa vòng đời dự án theo từng giai đoạn (Pipeline Stages) từ Khảo Sát, Thiết Kế đến Bàn Giao & Nghiệm Thu.
                </p>
              </div>

              {/* Project Stats Summary & Edit Toggle */}
              <div className="flex items-center gap-3 flex-wrap shrink-0">
                {(user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER') && (
                  <button
                    onClick={() => setIsEditingPipelineStages(!isEditingPipelineStages)}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                  >
                    <Sliders className="w-4 h-4 text-purple-400" />
                    {isEditingPipelineStages ? '✓ Đóng Quản Lý Giai Đoạn' : '⚙️ Quản Lý Giai Đoạn Pipeline'}
                  </button>
                )}

                <div className="flex items-center gap-3 bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-purple-300 font-mono block">TIẾN ĐỘ ROADMAP</span>
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
                      🔒 Dự Án Đang Hoạt Động (Active Roadmap)
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
                      <button
                        type="button"
                        onClick={() => setIsProjectMembersModalOpen(true)}
                        className="text-left group/mem cursor-pointer hover:opacity-90 transition-all block"
                        title="Nhấn để mở bảng quản lý, thêm mới hoặc xóa nhân sự dự án"
                      >
                        <span className="text-slate-500 block text-[10px] group-hover/mem:text-amber-400 font-mono transition-colors">
                          TỔNG THÀNH VIÊN (QUẢN LÝ)
                        </span>
                        <span className="text-amber-300 font-bold flex items-center gap-1.5 group-hover/mem:text-amber-200">
                          👥 {(currentProj as any)?._count?.members || 8} Nhân sự
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                            ⚙️ Quản lý
                          </span>
                        </span>
                      </button>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TỔNG SỐ TASK</span>
                      <span className="text-slate-200 font-bold">📋 {totalProjectTasks} Task</span>
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
            {isEditingPipelineStages && (user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER') && (
              <div className="solar-glass-card p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Chỉnh Sửa & Thêm Giai Đoạn Pipeline Trực Tiếp ({activePipelineStages.length} giai đoạn)
                  </h3>

                  {/* Lock Toggle */}
                  <button
                    onClick={() => setIsStageLockingEnabled(!isStageLockingEnabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isStageLockingEnabled
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isStageLockingEnabled ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                    Khóa Nghiêm Ngặt Thứ Tự Chuyển Stage: {isStageLockingEnabled ? 'BẬT (Khóa tuần tự)' : 'TẮT (Tự do)'}
                  </button>
                </div>

                {/* Quick Add Stage Form */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newStageNameInput}
                    onChange={(e) => setNewStageNameInput(e.target.value)}
                    placeholder="Nhập tên giai đoạn mới (VD: 7. Bảo Trì & Hậu Mãi)..."
                    className="flex-1 min-w-[260px] bg-slate-900 border border-purple-500/30 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newStageNameInput.trim()) {
                        const newStage = {
                          id: `stage_${Date.now()}`,
                          name: newStageNameInput.trim(),
                          status: 'TODO',
                          color: 'border-purple-500/40 text-purple-300',
                        };
                        setActivePipelineStages((prev) => [...prev, newStage]);
                        setNewStageNameInput('');
                        showNotification(`🟢 Đã thêm giai đoạn "${newStage.name}" vào quy trình!`, 'success', 'Thêm Giai Đoạn');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newStageNameInput.trim()) return;
                      const newStage = {
                        id: `stage_${Date.now()}`,
                        name: newStageNameInput.trim(),
                        status: 'TODO',
                        color: 'border-purple-500/40 text-purple-300',
                      };
                      setActivePipelineStages((prev) => [...prev, newStage]);
                      setNewStageNameInput('');
                      showNotification(`🟢 Đã thêm giai đoạn "${newStage.name}" vào quy trình!`, 'success', 'Thêm Giai Đoạn');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" /> Thêm Giai Đoạn
                  </button>
                </div>

                {/* Stage chips list */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {activePipelineStages.map((st, idx) => (
                    <div
                      key={st.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center gap-2 group"
                    >
                      <span className="text-purple-400 font-bold">#{idx + 1}</span>
                      <span className="text-slate-200">{st.name}</span>
                      <button
                        onClick={() => {
                          if (activePipelineStages.length <= 2) {
                            showNotification('Pipeline cần tối thiểu 2 giai đoạn quy trình!', 'warning', 'Không Thể Xóa');
                            return;
                          }
                          setActivePipelineStages((prev) => prev.filter((s) => s.id !== st.id));
                          showNotification(`Đã xóa giai đoạn "${st.name}"`, 'info', 'Xóa Giai Đoạn');
                        }}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer ml-1 text-xs"
                        title="Xóa giai đoạn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📁 PROJECT PICKER TABS (CHỌN DỰ ÁN XEM ROADMAP) */}
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

            {/* 🚀 PIPELINE STAGES DRAG-AND-DROP WORKFLOW BOARD */}
            <DragDropContext onDragEnd={handlePipelineDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {activePipelineStages.map((stage, sIdx) => {
                  const stageTasks = pipelineTasks.filter((t) => {
                    if (t.stageId) return t.stageId === stage.id;
                    return sIdx === 0;
                  });

                  return (
                    <Droppable key={stage.id} droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`solar-glass-card p-4 rounded-2xl bg-[#0F172A]/70 border transition-all duration-200 min-h-[520px] flex flex-col space-y-3 ${
                            snapshot.isDraggingOver
                              ? 'border-2 border-dashed border-purple-400 bg-purple-500/15 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                              : stage.color
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div>
                              <span className="text-[10px] font-mono text-purple-400 font-bold block">GIAI ĐOẠN #{sIdx + 1}</span>
                              <span className="text-xs font-black text-slate-100 tracking-tight">{stage.name}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold">
                              {stageTasks.length}
                            </span>
                          </div>

                          <div className="flex-1 space-y-3">
                            {stageTasks.map((t, index) => (
                              <Draggable key={t.id} draggableId={t.id} index={index}>
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
                            ))}
                            {provided.placeholder}

                            {stageTasks.length === 0 && (
                              <div
                                className={`h-36 border-2 border-dashed rounded-xl flex items-center justify-center text-xs font-mono transition-colors text-center p-3 ${
                                  snapshot.isDraggingOver
                                    ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                                    : 'border-slate-800/60 text-slate-600'
                                }`}
                              >
                                Kéo Task vào Giai đoạn {sIdx + 1}
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
          </div>
        );
      })()}

      {/* ☀️ VIEW 3: TODAY'S FOCUS COCKPIT (TRUNG TÂM ĐIỀU HÀNH CÔNG VIỆC HÔM NAY) */}
      {activeView === 'focus' && (() => {
        // Priority weight dictionary
        const priorityWeight = { URGENT: 1, IMPORTANT: 2, NORMAL: 3, LOW: 4 };

        // 1. Task thuộc về người dùng hiện tại
        let myFocusTasks = filteredTasks.filter((t) => {
          if (t.progress >= 100 || t.status === 'DONE') return false;
          if (!user) return true;
          return (
            t.assigneeId === user.id ||
            t.assignee?.id === user.id ||
            t.assignee?.email === user.email
          );
        });

        // 2. Thống kê toàn cục dành cho Admin/Manager
        const isManagement = user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER';
        const allPendingTasks = filteredTasks.filter((t) => t.status !== 'DONE');
        const allUrgentTasks = allPendingTasks.filter(
          (t) => t.priority === 'URGENT' || t.subtasks?.some((st) => st.isUrgent && !st.isDone)
        );
        const allInReviewTasks = filteredTasks.filter((t) => t.status === 'IN_REVIEW');
        const allBlockedTasks = filteredTasks.filter((t) => t.status === 'BLOCKED');

        // Apply Priority Filter Mode (Ưu tiên lọc theo các Task có Việc Con Gấp)
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

        // Auto-sort Focus Queue: Task có việc con khẩn cấp (isUrgent) đứng đầu tiên
        myFocusTasks.sort((a, b) => {
          const aHasUrgent = a.subtasks?.some((st) => st.isUrgent && !st.isDone) ? 0 : 1;
          const bHasUrgent = b.subtasks?.some((st) => st.isUrgent && !st.isDone) ? 0 : 1;
          if (aHasUrgent !== bHasUrgent) return aHasUrgent - bHasUrgent;
          return priorityWeight[a.priority] - priorityWeight[b.priority];
        });

        // 🎯 CHỈ LẤY TASK CÓ TRẠNG THÁI IN_PROGRESS ĐƯA VÀO HERO FOCUS TASK #1
        const heroTask = myFocusTasks.find((t) => t.status === 'IN_PROGRESS');
        const queueTasks = myFocusTasks.filter((t) => t.id !== heroTask?.id);

        return (
          <div className="space-y-6 pb-12">
            {/* Header & Mode Filters */}
            <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-amber-300 flex items-center gap-2 mb-1">
                  <Target className="w-6 h-6 text-amber-400 animate-pulse" />
                  ☀️ Today's Focus Cockpit (Trung Tâm Điều Hành Việc Hôm Nay)
                </h2>
                <p className="text-xs text-slate-300">
                  Tập trung giải quyết các Task trọng tâm hôm nay, theo dõi tiến độ Task con và gỡ bỏ tắc nghẽn tức thì.
                </p>
              </div>

              {/* Focus Filters */}
              <div className="flex items-center gap-2 overflow-x-auto shrink-0">
                <button
                  onClick={() => setFocusFilterMode('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    focusFilterMode === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  🎯 Tất Cả Hôm Nay ({myFocusTasks.length})
                </button>
                <button
                  onClick={() => setFocusFilterMode('URGENT')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    focusFilterMode === 'URGENT'
                      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  🚨 Cần Gấp Hôm Nay
                </button>
                <button
                  onClick={() => setFocusFilterMode('IN_PROGRESS')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    focusFilterMode === 'IN_PROGRESS'
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  ⚡ Đang Thực Hiện
                </button>
              </div>
            </div>

            {/* 👑 MANAGEMENT PULSE STRIP (DÀNH CHO ADMIN & MANAGER) */}
            {isManagement && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
                <div className="solar-glass-card p-4 rounded-2xl bg-red-950/20 border border-red-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-red-300 block">CẦN XỬ LÝ GẤP</span>
                    <span className="text-xl font-black text-red-400 font-mono">{allUrgentTasks.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                    🚨
                  </div>
                </div>

                <div className="solar-glass-card p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-300 block">CHỜ DUYỆT BÀN GIAO</span>
                    <span className="text-xl font-black text-amber-400 font-mono">{allInReviewTasks.length}</span>
                  </div>
                  <button
                    onClick={() => setIsTransferInboxOpen(true)}
                    className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold hover:scale-105 transition-all cursor-pointer"
                    title="Mở Hộp Thư Duyệt"
                  >
                    📬
                  </button>
                </div>

                <div className="solar-glass-card p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-rose-300 block">BỊ TẮC NGHẼN (BLOCKED)</span>
                    <span className="text-xl font-black text-rose-400 font-mono">{allBlockedTasks.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
                    ⚠️
                  </div>
                </div>

                <div className="solar-glass-card p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-300 block">TỔNG TASK ĐANG CHẠY</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{allPendingTasks.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                    🚀
                  </div>
                </div>
              </div>
            )}

            {/* 🚀 HERO FOCUS CARD #1 (CHỈ DÀNH CHO TASK ĐANG IN_PROGRESS CHÍNH) */}
            {heroTask ? (
              <div className="solar-glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-[#0F172A] to-purple-600/15 border-2 border-amber-400/80 shadow-2xl relative space-y-6 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-lg">
                    <Zap className="w-4 h-4 fill-current" /> HERO FOCUS TASK #1 (TASK TRỌNG TÂM HÔM NAY)
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-300 font-mono font-bold">
                      📁 {heroTask.projectName || 'Solaris Core'}
                    </span>
                    <span className="text-xs text-slate-300 font-mono font-bold bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                      <span>📅 Bắt đầu: <strong className="text-amber-300">{heroTask.startDate || 'Hôm nay'}</strong></span>
                      <span className="text-slate-500">➔</span>
                      <span>Hạn chót: <strong className="text-emerald-300">{heroTask.dueDate || 'Chưa đặt'}</strong></span>
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

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight cursor-pointer hover:text-amber-300 transition-colors"
                      onClick={() => setSelectedTaskForDetail(heroTask)}>
                    {heroTask.title}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {heroTask.description || 'Tập trung xử lý hoàn tất các Task được phân công cá nhân trong ngày hôm nay.'}
                  </p>
                </div>

                {/* 🔒 TIẾN ĐỘ TỰ ĐỘNG THEO TASK CON (AUTO-CALCULATED PROGRESS) */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> Tiến Độ Task (Tự Động Theo Task Con):
                    </span>
                    <span className="text-amber-400 font-extrabold text-sm font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                      {heroTask.progress}% Hoàn Thành
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${heroTask.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Tiến độ tính toán tự động dựa trên số Task con hoàn thành, không sửa tay.
                    </span>
                    <span className="font-mono text-slate-400">
                      {heroTask.subtasks?.filter((s) => s.isDone).length || 0}/{heroTask.subtasks?.length || 0} Task Con Xong
                    </span>
                  </div>
                </div>

                {/* 🔘 LỘ TRÌNH MỖI NGÀY 1 TASK CON (DAILY MICRO-TASK SCHEDULE) */}
                {heroTask.subtasks && heroTask.subtasks.length > 0 && (() => {
                  const subtaskList = heroTask.subtasks;
                  const firstPendingIdx = subtaskList.findIndex((s) => !s.isDone);
                  const completedCount = subtaskList.filter((s) => s.isDone).length;
                  const isAllDone = firstPendingIdx === -1;
                  const isResting = Boolean(restingTodayTasks[heroTask.id]);
                  const isWorkingAhead = Boolean(workingAheadTasks[heroTask.id]);
                  const activeSubtask = firstPendingIdx !== -1 ? subtaskList[firstPendingIdx] : null;
                  const isWorkerDoingHeroTask = Boolean(
                    user &&
                      (heroTask.assigneeId === user.id ||
                        (heroTask.assignee as any)?.id === user.id ||
                        ((heroTask.assignee as any)?.email && user.email === (heroTask.assignee as any).email))
                  );

                  // 📅 Helper tính toán Lịch Cụ Thể (Calendar Date) & Giữ nguyên Hạn Chót Gốc
                  const getSubtaskCalendarSchedule = (taskStartDate?: string | null, list: any[] = [], currentIndex: number = 0) => {
                    const base = taskStartDate ? new Date(taskStartDate) : new Date();
                    base.setHours(0, 0, 0, 0);

                    let startOffset = 0;
                    for (let i = 0; i < currentIndex; i++) {
                      startOffset += Number(list[i]?.estimatedDays || 1);
                    }
                    const currentDays = Number(list[currentIndex]?.estimatedDays || 1);
                    const endOffset = startOffset + currentDays;

                    const startDate = new Date(base);
                    startDate.setDate(startDate.getDate() + startOffset);

                    const targetEndDate = new Date(base);
                    targetEndDate.setDate(targetEndDate.getDate() + endOffset);

                    const formatShort = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                    const formatFull = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

                    const scheduleStr = currentDays === 1 ? formatFull(startDate) : `${formatShort(startDate)} - ${formatFull(targetEndDate)}`;
                    const scheduleShort = currentDays === 1 ? formatShort(startDate) : `${formatShort(startDate)}-${formatShort(targetEndDate)}`;
                    const deadlineDateStr = formatFull(targetEndDate);

                    return {
                      startDate,
                      targetEndDate,
                      scheduleStr,
                      scheduleShort,
                      deadlineDateStr,
                      estimatedDays: currentDays,
                    };
                  };

                  return (
                    <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-inner space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-400" /> Kế Hoạch Lịch Trình:
                        </span>
                        <span className="text-slate-400">
                          Đã làm xong <strong className="text-emerald-400">{completedCount}</strong>/{subtaskList.length} Task con
                        </span>
                      </div>

                      {/* 🌟 MỤC TIÊU CẦN LÀM HIỆN TẠI (HERO SUBTASK TARGET) */}
                      {isAllDone ? (
                        <div className="p-4 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/60 text-center space-y-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-solar-warp-in">
                          <span className="text-xl">🏆</span>
                          <h4 className="text-sm font-extrabold text-emerald-300">
                            HOÀN TẤT 100% TẤT CẢ TASK CON!
                          </h4>
                          <p className="text-[11px] text-emerald-400/80">
                            Task này đã hoàn thành xuất sắc toàn bộ quy trình công việc theo kế hoạch.
                          </p>
                        </div>
                      ) : isResting && activeSubtask ? (
                        /* 🏖️ TRẠNG THÁI NGHỈ NGƠI HÔM NAY (ĐÃ XONG MỤC TIÊU HÔM NAY) */
                        (() => {
                          const sched = getSubtaskCalendarSchedule(heroTask.startDate || heroTask.createdAt, subtaskList, firstPendingIdx);
                          return (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border-2 border-emerald-500/60 space-y-3 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-solar-warp-in">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase flex items-center gap-1 bg-emerald-500 text-slate-950 shadow-md">
                                  🎉 ĐÃ HOÀN THÀNH MỤC TIÊU HÔM NAY
                                </span>
                                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                                  Kế hoạch tiếp theo theo lịch: 📅 {sched.scheduleStr}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                Bạn đã hoàn thành xuất sắc mục tiêu hôm nay. Hãy nghỉ ngơi, hoặc nhấn <strong className="text-amber-300">[▶️ Tiếp Tục]</strong> nếu muốn hoàn thành trước kế hoạch. <span className="text-emerald-300 font-bold">Hạn chót gốc giữ nguyên: {sched.deadlineDateStr}</span>.
                              </p>

                              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-mono text-slate-400 block">Kế hoạch tiếp theo:</span>
                                  <h4 className="text-xs font-extrabold text-white truncate">
                                    {activeSubtask.title}
                                  </h4>
                                </div>
                                {isWorkerDoingHeroTask && (
                                  <button
                                    onClick={() => {
                                      setRestingTodayTasks((prev) => ({ ...prev, [heroTask.id]: false }));
                                      setWorkingAheadTasks((prev) => ({ ...prev, [heroTask.id]: true }));
                                      showNotification(
                                        `▶️ Đã tiếp tục thực hiện Task con: "${activeSubtask.title}". Hạn chót theo lịch (${sched.deadlineDateStr}) được bảo lưu 100%!`,
                                        'success',
                                        'Tiếp Tục Làm Việc'
                                      );
                                    }}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all shrink-0"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" /> ▶️ Tiếp Tục
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : isWorkingAhead && activeSubtask ? (
                        /* ⚡ TRẠNG THÁI ĐANG TIẾP TỤC LÀM VIỆC (VƯỢT TIẾN ĐỘ) */
                        (() => {
                          const sched = getSubtaskCalendarSchedule(heroTask.startDate || heroTask.createdAt, subtaskList, firstPendingIdx);
                          return (
                            <div className="p-4 rounded-2xl border-2 space-y-2 transition-all bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase flex items-center gap-1 bg-purple-500 text-white shadow-md">
                                  ⚡ ĐANG LÀM SỚM THEO LỊCH (📅 {sched.scheduleShort})
                                </span>
                                <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                                  ⏳ Hạn chót gốc giữ nguyên: {sched.deadlineDateStr}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 pt-1">
                                <h4 className="text-sm font-extrabold text-white leading-snug flex-1">
                                  {activeSubtask.title}
                                </h4>
                                {!isWorkerDoingHeroTask ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
                                    🔒 Chỉ người nhận task mới được tick
                                  </span>
                                ) : activeSubtask.approvalStatus === 'PENDING' ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 animate-pulse">
                                    ⏳ Đang chờ quản lý duyệt
                                  </span>
                                ) : activeSubtask.approvalStatus === 'REJECTED' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono text-rose-300 font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/40 max-w-[200px] truncate" title={activeSubtask.rejectionReason}>
                                      ❌ Chưa đạt: {activeSubtask.rejectionReason || 'Cần sửa'}
                                    </span>
                                    <button
                                      onClick={() => handleCompleteTodaySubtask(heroTask, activeSubtask, firstPendingIdx)}
                                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                                    >
                                      🔄 Gửi Duyệt Lại
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleCompleteTodaySubtask(heroTask, activeSubtask, firstPendingIdx)}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-400 hover:to-emerald-400 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Xong Task Con Này
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : activeSubtask ? (
                        /* 🔥 TRẠNG THÁI MỤC TIÊU HÔM NAY (NGÀY 1 HOẶC KHI BẮT ĐẦU NGÀY MỚI) */
                        (() => {
                          const sched = getSubtaskCalendarSchedule(heroTask.startDate || heroTask.createdAt, subtaskList, firstPendingIdx);
                          return (
                            <div
                              className={`p-4 rounded-2xl border-2 space-y-2 transition-all ${
                                activeSubtask.isUrgent
                                  ? 'bg-gradient-to-r from-red-950/40 via-red-900/20 to-slate-900 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
                                  : 'bg-gradient-to-r from-amber-500/20 via-purple-600/15 to-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                              }`}
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase flex items-center gap-1 ${
                                    activeSubtask.isUrgent
                                      ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse'
                                      : 'bg-amber-500 text-slate-950'
                                  }`}
                                >
                                  {activeSubtask.isUrgent ? '🚨 TASK CON KHẨN CẤP (' : '🔥 TASK CON THEO LỊCH ('}
                                  📅 {sched.scheduleShort})
                                </span>
                                <span className="text-[10px] font-mono text-amber-300 font-bold">
                                  Hạn chót: {sched.deadlineDateStr}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 pt-1">
                                <h4 className="text-sm font-extrabold text-white leading-snug flex-1">
                                  {activeSubtask.title}
                                </h4>
                                {!isWorkerDoingHeroTask ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
                                    🔒 Chỉ người nhận task mới được tick
                                  </span>
                                ) : activeSubtask.approvalStatus === 'PENDING' ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 animate-pulse">
                                    ⏳ Đang chờ quản lý duyệt
                                  </span>
                                ) : activeSubtask.approvalStatus === 'REJECTED' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono text-rose-300 font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/40 max-w-[200px] truncate" title={activeSubtask.rejectionReason}>
                                      ❌ Chưa đạt: {activeSubtask.rejectionReason || 'Cần sửa'}
                                    </span>
                                    <button
                                      onClick={() => handleCompleteTodaySubtask(heroTask, activeSubtask, firstPendingIdx)}
                                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                                    >
                                      🔄 Gửi Duyệt Lại
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleCompleteTodaySubtask(heroTask, activeSubtask, firstPendingIdx)}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Xong Task Con Hôm Nay
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : null}

                      {/* Danh sách toàn bộ các Task con theo lịch (Calendar Timeline) */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                          📅 Chi tiết kế hoạch theo lịch:
                        </span>
                        {subtaskList.map((st, idx) => {
                          const isCurrentActive = idx === firstPendingIdx;
                          const itemSched = getSubtaskCalendarSchedule(heroTask.startDate || heroTask.createdAt, subtaskList, idx);
                          const canToggleThis = isWorkerDoingHeroTask && !st.isDone && st.approvalStatus !== 'PENDING';

                          return (
                            <div
                              key={st.id}
                              onClick={() => canToggleThis && handleToggleSubtask(heroTask.id, st.id, true)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                st.isDone
                                  ? 'opacity-40 grayscale select-none pointer-events-none cursor-not-allowed bg-slate-950/20 border-slate-800/40 text-slate-500'
                                  : canToggleThis
                                  ? 'cursor-pointer hover:border-slate-700'
                                  : 'cursor-not-allowed opacity-80'
                              } ${
                                st.isDone
                                  ? ''
                                  : st.isUrgent
                                  ? 'bg-red-950/20 border-red-500/60 text-slate-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                  : isCurrentActive
                                  ? isResting
                                    ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                                    : isWorkingAhead
                                    ? 'bg-purple-950/30 border-purple-500/50 text-slate-100 font-bold'
                                    : 'bg-amber-500/10 border-amber-500/50 text-slate-100 font-bold'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={st.isDone}
                                  disabled={!canToggleThis}
                                  onChange={() => {}}
                                  className={`w-4 h-4 rounded text-amber-500 accent-amber-500 ${canToggleThis ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                />
                                <span className="text-[10px] font-mono text-amber-300/80 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                                  📅 {itemSched.scheduleStr}
                                </span>
                                <span className={`text-xs ${st.isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                  {st.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                                    st.isDone
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : st.approvalStatus === 'PENDING'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                      : st.approvalStatus === 'REJECTED'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                      : st.isUrgent
                                      ? 'bg-red-500 text-white font-black animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                      : isCurrentActive
                                      ? isResting
                                        ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                                        : isWorkingAhead
                                        ? 'bg-purple-500 text-white font-black animate-pulse'
                                        : 'bg-amber-500 text-slate-950 font-black animate-pulse'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {st.isDone
                                    ? '✓ Xong'
                                    : st.approvalStatus === 'PENDING'
                                    ? '⏳ Chờ Duyệt'
                                    : st.approvalStatus === 'REJECTED'
                                    ? `❌ Chưa đạt: ${st.rejectionReason || 'Cần sửa'}`
                                    : st.isUrgent
                                    ? '🚨 GẤP'
                                    : isCurrentActive
                                    ? isResting
                                      ? `📅 Lịch: ${itemSched.scheduleShort}`
                                      : isWorkingAhead
                                      ? `⚡ Làm sớm (${itemSched.scheduleShort})`
                                      : `🔥 Lịch: ${itemSched.scheduleShort}`
                                    : `📅 ${itemSched.scheduleShort}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 📎 TÀI LIỆU & DỮ LIỆU ĐÍNH KÈM CỦA TASK ĐANG LÀM (COCKPIT ATTACHMENTS) */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-extrabold text-cyan-300 uppercase tracking-wider">
                        Tài Liệu & Dữ Liệu Task Đang Làm ({heroTask.attachments?.length || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={cockpitFileInputRef}
                        onChange={(e) => handleCockpitFileUpload(heroTask.id, e)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => cockpitFileInputRef.current?.click()}
                        disabled={isUploadingCockpitAtt}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isUploadingCockpitAtt ? 'Đang Tải...' : 'Tải Tệp Lên'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCockpitAddUrl(!showCockpitAddUrl)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      >
                        <Link2 className="w-3.5 h-3.5" /> Thêm Link (Figma/Docs)
                      </button>
                    </div>
                  </div>

                  {/* Form Thêm Link Nhanh */}
                  {showCockpitAddUrl && (
                    <form onSubmit={(e) => handleCockpitAddUrl(heroTask.id, e)} className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cockpitUrlTitleInput}
                          onChange={(e) => setCockpitUrlTitleInput(e.target.value)}
                          placeholder="Tiêu đề tài liệu (VD: Figma UI Design, API Specs)..."
                          className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                        <input
                          type="text"
                          value={cockpitUrlInput}
                          onChange={(e) => setCockpitUrlInput(e.target.value)}
                          placeholder="Dán đường dẫn URL (https://...)"
                          className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Đính Kèm
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Danh Sách Attachments Hiện Có */}
                  {heroTask.attachments && heroTask.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {heroTask.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 hover:border-cyan-500/40 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                              {att.type === 'link' ? <Link2 className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-cyan-400" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs text-white font-semibold truncate block">
                                {att.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                {att.type === 'link' ? '🔗 Liên kết ngoài' : att.size ? `${Math.round(Number(att.size) / 1024)} KB` : '📁 Tệp đính kèm'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {att.type === 'link' ? (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-800 text-purple-300 hover:text-white hover:bg-purple-600 transition-all cursor-pointer"
                                title="Mở liên kết"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCockpitDownloadAttachment(att)}
                                className="p-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:text-white hover:bg-cyan-600 transition-all cursor-pointer"
                                title="Tải xuống tệp"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCockpitDeleteAttachment(heroTask.id, att.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Xóa đính kèm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>Chưa có tài liệu đính kèm cho Task này. Bấm <strong>"Tải Tệp Lên"</strong> để gửi tài liệu tác nghiệp!</span>
                    </div>
                  )}
                </div>

                {/* 🎮 ACTION BUTTONS */}
                <div className="flex items-center gap-3 pt-2 flex-wrap">
                  {heroTask.status !== 'IN_PROGRESS' && (
                    <button
                      onClick={() => {
                        setTasks((prev) =>
                          prev.map((t) => (t.id === heroTask.id ? { ...t, status: 'IN_PROGRESS' } : t))
                        );
                        api.patch(`/tasks/${heroTask.id}/status`, { status: 'IN_PROGRESS' });
                        showNotification(`▶️ Đã bắt đầu thực hiện Task "${heroTask.title}"!`, 'success', 'Bắt Đầu Task');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    >
                      <Play className="w-4 h-4 fill-current" /> Bắt Đầu Làm Task
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setTasks((prev) =>
                        prev.map((t) => (t.id === heroTask.id ? { ...t, status: 'TODO' } : t))
                      );
                      api.patch(`/tasks/${heroTask.id}/status`, { status: 'TODO' });
                      showNotification(
                        `⏸️ Đã tạm dừng Task "${heroTask.title}" và chuyển về Hàng Chờ Hôm Nay!`,
                        'info',
                        'Today Focus'
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
                  <button
                    onClick={() => handleQuickRequest(heroTask)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ml-auto"
                  >
                    <Inbox className="w-4 h-4 text-amber-400" /> Xin Trợ Giúp / Bàn Giao
                  </button>
                </div>
              </div>
            ) : (
              <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30 text-center space-y-3">
                <Target className="w-12 h-12 text-amber-400 mx-auto opacity-80 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Chưa Có Task Nào Đang Thực Hiện (IN_PROGRESS)</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Today's Focus Cockpit chỉ hiển thị Task bạn đang trực tiếp thực hiện (`IN_PROGRESS`). Hãy bấm chọn một Task trong Hàng chờ bên dưới và click <strong className="text-amber-300 font-mono">"▶️ Tiếp Tục Làm Task"</strong> để đưa lên Hero Focus!
                </p>
              </div>
            )}

            {/* 📋 TODAY'S PRIORITY QUEUE LIST */}
            {queueTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Hàng Chờ Task Hôm Nay Của Bạn ({queueTasks.length})
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
                              `🟢 Task "${t.title}" đã được đưa lên HERO FOCUS TASK #1 hôm nay!`,
                              'success',
                              'Today Focus'
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

      {/* 🌟 MODAL PROMPT HỎI TIẾN HÀNH VIỆC NGÀY MAI (TÔN TRỌNG THỜI GIAN NHÂN VIÊN) */}
      {workAheadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden space-y-6 animate-solar-warp-in">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                🎉
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Chúc Mừng Hoàn Thành Mục Tiêu Hôm Nay!
                </h3>
                <span className="text-xs text-amber-300 font-mono font-bold">
                  Task: {workAheadModal.taskTitle}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                Bạn đã hoàn thành xuất sắc Task con của ngày hôm nay!
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 block">
                  Task con kế tiếp theo kế hoạch:
                </span>
                <span className="text-sm font-extrabold text-amber-400 block">
                  📅 Ngày #{workAheadModal.nextDayIndex}: {workAheadModal.nextSubtaskTitle}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2">
                <span>🛡️</span>
                <span>
                  <strong>Đảm bảo quyền lợi:</strong> Thời hạn Deadline tổng của Task ({workAheadModal.dueDate || 'Hạn chót gốc'}) vẫn được <strong>bảo lưu giữ nguyên 100%</strong>.
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Bạn có muốn bắt đầu luôn Task con của ngày mai để vượt tiến độ, hay nghỉ ngơi để hoàn thành đúng kế hoạch?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setRestingTodayTasks((prev) => ({ ...prev, [workAheadModal.taskId]: true }));
                  setWorkingAheadTasks((prev) => ({ ...prev, [workAheadModal.taskId]: false }));
                  setWorkAheadModal(null);
                  showNotification(
                    '☕ Chúc bạn nghỉ ngơi vui vẻ! Bạn đã hoàn thành đúng mục tiêu ngày hôm nay. Hạn chót gốc của bạn vẫn được bảo lưu trọn vẹn.',
                    'info',
                    'Hoàn Thành Hôm Nay'
                  );
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                ☕ Nghỉ Ngơi (Xong Hôm Nay)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRestingTodayTasks((prev) => ({ ...prev, [workAheadModal.taskId]: false }));
                  setWorkingAheadTasks((prev) => ({ ...prev, [workAheadModal.taskId]: true }));
                  setWorkAheadModal(null);
                  showNotification(
                    `🚀 Tuyệt vời! Bạn đang vượt tiến độ. Task con '${workAheadModal.nextSubtaskTitle}' (Ngày #${workAheadModal.nextDayIndex}) đã sẵn sàng trên bàn làm việc!`,
                    'success',
                    'Tiến Hành Task Con Ngày Mai'
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> ✨ Tiến Hành Luôn Task Con Ngày Mai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👥 BẢNG QUẢN LÝ THÀNH VIÊN DỰ ÁN (XÓA/THÊM NHÂN SỰ & CHUYỂN TASK VỀ MANAGER) */}
      {(() => {
        const selectedProj =
          dbProjects.find((p) => p.name === filterProject || p.id === filterProject) ||
          dbProjects[0];
        return (
          <ProjectMembersModal
            isOpen={isProjectMembersModalOpen}
            onClose={() => setIsProjectMembersModalOpen(false)}
            projectId={selectedProj?.id || ''}
            projectName={selectedProj?.name || 'Dự án chính'}
            onMemberChanged={fetchTasksFromBackend}
          />
        );
      })()}

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
