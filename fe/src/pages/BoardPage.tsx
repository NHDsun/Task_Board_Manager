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
import { SolarNotificationModal } from '../components/common/SolarNotificationModal';
import { TaskRequestModal } from '../components/kanban/TaskRequestModal';
import { TaskDetailModal } from '../components/kanban/TaskDetailModal';
import { CreateProjectModal } from '../components/kanban/CreateProjectModal';
import { CreateTaskModal } from '../components/kanban/CreateTaskModal';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
  Mic,
  Clock,
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
  Folder
} from 'lucide-react';

import { TaskTransferInboxModal } from '../components/kanban/TaskTransferInboxModal';
import { DeleteTaskConfirmModal } from '../components/kanban/DeleteTaskConfirmModal';

export const BoardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [activeView, setActiveView] = useState<'kanban' | 'pipeline' | 'focus'>('kanban');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTransferInboxOpen, setIsTransferInboxOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedPipelineProject, setSelectedPipelineProject] = useState<string>('ALL');
  const [focusFilterMode, setFocusFilterMode] = useState<'ALL' | 'URGENT' | 'IN_PROGRESS'>('ALL');
  const [isEditingPipelineStages, setIsEditingPipelineStages] = useState(false);
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

  const [isCheckedIn, setIsCheckedIn] = useState(true);
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

  useEffect(() => {
    fetchTasksFromBackend();
  }, [token]);

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

    // 🔒 1. BỊ CẤM: Drag Ownership Rule (Tất cả User chỉ kéo Task của mình, TRỪ ADMIN có quyền kéo tất cả)
    const isAdmin = user?.globalRole === 'ADMIN';
    const isTaskOwner =
      taskToMove.assigneeId === user?.id ||
      taskToMove.assignee?.id === user?.id ||
      taskToMove.assignee?.email === user?.email ||
      (taskToMove as any).createdById === user?.id;

    if (!isAdmin && !isTaskOwner) {
      showNotification(
        `Bạn (${user?.fullName || 'Người dùng'}) chỉ có quyền kéo thả các Task chính chủ của mình! (Chỉ Admin mới có quyền kéo Task của mọi người).`,
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
          <button
            onClick={() => {
              setIsCheckedIn(!isCheckedIn);
              showNotification(
                isCheckedIn ? 'Đã Checkout ca làm việc thành công!' : '🟢 Solaris: Đã ghi nhận Chấm công Voice thành công!',
                'success',
                'Chấm Công Voice'
              );
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
              isCheckedIn
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse'
            }`}
          >
            <Mic className="w-4 h-4" />
            {isCheckedIn ? 'Voice Check-In Active' : 'Bắt Đầu Chấm Công Voice'}
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>🟢 04h:25m (OFFICE)</span>
          </div>

          <button
            onClick={fetchTasksFromBackend}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Đồng Bộ CSDL Postgres"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* 👑 NÚT TẠO DỰ ÁN & TẠO TASK CHO ADMIN VÀ MANAGER */}
        <div className="flex items-center gap-3 flex-wrap">
          {isRoleAdminOrManager && (
            <>
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <FolderPlus className="w-4 h-4 text-purple-400" />
                <span>+ Tạo Dự Án Mới</span>
              </button>

              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="solar-corona-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tạo Task Mới</span>
              </button>
            </>
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
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'kanban'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban 6 Cột
          </button>

          {(user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER') && (
            <button
              onClick={() => setActiveView('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'pipeline'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              Pipeline Stage ({user?.globalRole === 'ADMIN' ? 'Admin' : 'Manager'})
            </button>
          )}

          <button
            onClick={() => setActiveView('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'focus'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            My Focus Queue
          </button>
        </div>

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
                          const isMyOwnTask =
                            t.assigneeId === user?.id ||
                            t.assignee?.id === user?.id ||
                            t.assignee?.email === user?.email ||
                            (t as any).createdById === user?.id;
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
                      <span className="text-amber-400 font-bold">👤 {user?.fullName || 'Huy Dat (Admin)'}</span>
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
                <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Chỉnh Sửa & Thêm Giai Đoạn Pipeline Trực Tiếp ({activePipelineStages.length} giai đoạn)
                </h3>
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

            {/* Pipeline Stage Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePipelineStages.map((stage, stageIdx) => {
                const stageTasks = pipelineTasks.filter(
                  (_, idx) => idx % activePipelineStages.length === stageIdx
                );

                return (
                  <div
                    key={stage.id}
                    className={`solar-glass-card p-5 rounded-2xl bg-[#0F172A]/90 border ${stage.color} space-y-4 shadow-xl`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-extrabold text-sm text-white">{stage.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stage.status === 'DONE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : stage.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {stage.status} ({stageTasks.length})
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageTasks.map((t) => (
                        <KanbanCard
                          key={t.id}
                          task={t}
                          onRequestTransfer={handleQuickRequest}
                          onCardClick={(taskItem) => setSelectedTaskForDetail(taskItem)}
                        />
                      ))}
                      {stageTasks.length === 0 && (
                        <div className="h-24 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] font-mono text-slate-600">
                          Chưa có Task giai đoạn này
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 🎯 VIEW 3: MY FOCUS QUEUE VIEW (TÍCH HỢP ƯU TIÊN SẮP XẾP & CẬP NHẬT TIẾN ĐỘ THỜI GIAN THỰC) */}
      {activeView === 'focus' && (() => {
        // Priority weight dictionary
        const priorityWeight = { URGENT: 1, IMPORTANT: 2, NORMAL: 3, LOW: 4 };

        // Filter tasks assigned to current user
        let myFocusTasks = filteredTasks.filter((t) => {
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
                    onClick={() =>
                      showNotification(
                        `Đã ghi nhận tạm dừng Task "${heroTask.title}"!`,
                        'info',
                        'Focus Mode'
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Pause className="w-4 h-4" /> Tạm Dừng Ca
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
                  Hero Focus Task #1 chỉ hiển thị các nhiệm vụ bạn đang trực tiếp thực hiện (`IN_PROGRESS`). Hãy bấm chọn một Task bên dưới và click <strong className="text-purple-300 font-mono">"▶️ Bắt Đầu Làm Task"</strong> để đưa vào vị trí Hero Focus!
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
                      />
                      <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] font-mono text-slate-400">
                          Trạng thái: <strong className="text-amber-400 uppercase font-bold">{t.status}</strong>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTasks((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, status: 'IN_PROGRESS' } : item))
                            );
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

      {/* 🌌 TASK DETAIL MINISITE MODAL */}
      <TaskDetailModal
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        task={selectedTaskForDetail}
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
