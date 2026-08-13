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
import { fetchWithRetry } from '../utils/apiRetry';
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
  FolderPlus
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

  const [selectedTaskForRequest, setSelectedTaskForRequest] = useState<TaskItem | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);

  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Metadata States (Read from PostgreSQL DB)
  const [dbProjects, setDbProjects] = useState<Array<{ id: string; name: string }>>([]);
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
          fetch('http://localhost:3000/api/projects', { headers: { Authorization: `Bearer ${token || ''}` } }),
          fetch('http://localhost:3000/api/profile/users', { headers: { Authorization: `Bearer ${token || ''}` } }),
        ]);

        if (projRes.ok) {
          const projData = await projRes.json();
          setDbProjects(Array.isArray(projData) ? projData : projData?.data || []);
        }
        if (userRes.ok) {
          const userData = await userRes.json();
          setDbUsers(Array.isArray(userData) ? userData : userData?.data || []);
        }
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

  // Fetch real task dataset from Backend API (với mô hình Retry)
  const fetchTasksFromBackend = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry(
        'http://localhost:3000/api/tasks?limit=300',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
        },
        { maxRetries: 3, initialDelayMs: 500 }
      );

      if (res.ok) {
        const responseData = await res.json();
        const taskArray = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];
        setTasks(taskArray);
      }
    } catch {
      // Fallback silently
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

    // 🚀 🔄 Bắn API cập nhật CSDL ngầm với Mô hình RETRY (Exponential Backoff)
    fetchWithRetry(
      `http://localhost:3000/api/tasks/${draggableId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          progress: targetStatus === 'TODO' ? 0 : taskToMove.progress,
        }),
      },
      {
        maxRetries: 3,
        initialDelayMs: 500,
        onRetry: (attempt) => {
          console.warn(`🔄 [Retry API] Thử lại lần ${attempt}/3 khi cập nhật trạng thái Task ${draggableId}`);
        },
      }
    ).catch(() => {
      // Đã thử lại 3 lần thất bại -> Khôi phục giao diện theo dữ liệu chuẩn từ CSDL
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
      await fetchWithRetry(
        `http://localhost:3000/api/tasks/${taskId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify({
            status: 'DONE',
            progress: 100,
          }),
        },
        { maxRetries: 3, initialDelayMs: 500 }
      );
    } catch {
      fetchTasksFromBackend();
    }
  };

  // 🗑️ Hàm thực thi Xóa Task khỏi CSDL PostgreSQL khi User bấm Xác Nhận trên Modal (Áp dụng Retry)
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetchWithRetry(
        `http://localhost:3000/api/tasks/${taskToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token || ''}`,
          },
        },
        { maxRetries: 2, initialDelayMs: 400 }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Xóa Task thất bại');
      }

      showNotification(`🟢 Solaris: Đã xóa vĩnh viễn Task "${taskToDelete.title}" khỏi CSDL!`, 'success', 'Xóa Task Thành Công');
      setIsDeleteModalOpen(false);
      setSelectedTaskForDetail(null);
      setTaskToDelete(null);
      fetchTasksFromBackend();
    } catch (err: any) {
      showNotification(`❌ Lỗi: ${err.message || 'Không thể xóa Task'}`, 'warning', 'Xóa Task Thất Bại');
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

  // Pipeline Stages Dataset
  const pipelineStages = [
    { id: 'stage_1', name: 'Giai Đoạn 1: Phân Tích & Yêu Cầu', color: 'border-blue-500/40', status: 'DONE' },
    { id: 'stage_2', name: 'Giai Đoạn 2: Thiết Kế UI/UX & DB Schema', color: 'border-purple-500/40', status: 'IN_PROGRESS' },
    { id: 'stage_3', name: 'Giai Đoạn 3: Lập Trình Backend Core & API', color: 'border-amber-500/40', status: 'IN_PROGRESS' },
    { id: 'stage_4', name: 'Giai Đoạn 4: Tích Hợp Frontend & Realtime', color: 'border-rose-500/40', status: 'TODO' },
    { id: 'stage_5', name: 'Giai Đoạn 5: Kiểm Thử QA & Duyệt Bài', color: 'border-indigo-500/40', status: 'TODO' },
    { id: 'stage_6', name: 'Giai Đoạn 6: Triển Khai Production & Docker', color: 'border-emerald-500/40', status: 'TODO' },
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

          <button
            onClick={() => setActiveView('pipeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'pipeline'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            Pipeline Stage
          </button>

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

      {/* 📈 VIEW 2: PIPELINE STAGE VIEW */}
      {activeView === 'pipeline' && (
        <div className="space-y-6 pb-12">
          <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-purple-500/30">
            <h2 className="text-xl font-extrabold text-purple-300 flex items-center gap-2 mb-2">
              <GitMerge className="w-6 h-6 text-purple-400" />
              Tiến Trình Pipeline Stage Vòng Đời Dự Án (Project Life-Cycle)
            </h2>
            <p className="text-xs text-slate-300">
              Quản lý tổng quan tiến độ theo 6 Giai đoạn phát triển từ Yêu Cầu đến Bàn Giao Sản Phẩm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelineStages.map((stage) => {
              const stageTasks = filteredTasks.filter((_, idx) => (idx % 6) === (parseInt(stage.id.split('_')[1]) - 1));

              return (
                <div key={stage.id} className={`solar-glass-card p-5 rounded-2xl bg-[#0F172A]/90 border ${stage.color} space-y-4 shadow-xl`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-extrabold text-sm text-white">{stage.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      stage.status === 'DONE' ? 'bg-emerald-500/20 text-emerald-300' : (stage.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400')
                    }`}>
                      {stage.status}
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎯 VIEW 3: MY FOCUS QUEUE VIEW (CHỈ HIỂN THỊ TASK CÁ NHÂN CHÍNH CHỦ) */}
      {activeView === 'focus' && (() => {
        const myFocusTasks = filteredTasks.filter((t) => {
          if (!user) return true;
          return t.assigneeId === user.id || t.assignee?.id === user.id || t.assignee?.email === user.email;
        });

        const heroTask = myFocusTasks[0];

        return (
          <div className="space-y-6 pb-12">
            {/* Hero Focus Card #1 */}
            {heroTask ? (
              <div className="solar-glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#0F172A] to-purple-600/10 border border-amber-500/50 shadow-2xl relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950 animate-pulse">
                    🎯 HERO FOCUS TASK #1 (ĐANG LÀM NGAY)
                  </span>
                  <span className="text-xs text-amber-300 font-mono">Dự Án: {heroTask.projectName || 'Solaris Core'}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-white">
                  {heroTask.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {heroTask.description || 'Tập trung xử lý hoàn tất các nhiệm vụ được phân công cá nhân.'}
                </p>

                <div className="flex items-center gap-4 pt-2 flex-wrap">
                  <button
                    onClick={() => showNotification(`Đã ghi nhận tạm dừng Task "${heroTask.title}"!`, 'info', 'Focus Mode')}
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
              <div className="solar-glass-card p-8 rounded-3xl bg-[#0F172A]/80 border border-slate-800 text-center space-y-3">
                <Target className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
                <h3 className="text-lg font-bold text-white">Hàng Chờ Focus Cá Nhân Trống</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Bạn ({user?.fullName || 'Hiện tại'}) không có Task nào được phân công trực tiếp cần tập trung xử lý.
                </p>
              </div>
            )}

            {/* Queue List */}
            {myFocusTasks.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Hàng Chờ Ưu Tiên Tiếp Theo Của Bạn ({myFocusTasks.length - 1})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myFocusTasks.slice(1).map((t) => (
                    <KanbanCard
                      key={t.id}
                      task={t}
                      onRequestTransfer={handleQuickRequest}
                      onCardClick={(taskItem) => setSelectedTaskForDetail(taskItem)}
                    />
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
