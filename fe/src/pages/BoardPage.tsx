import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { KanbanCard, type TaskItem } from '../components/kanban/KanbanCard';
import { SolarNotificationModal, type SolarNotification } from '../components/common/SolarNotificationModal';
import {
  Mic,
  Clock,
  Inbox,
  Search,
  Plus,
  Kanban,
  GitMerge,
  Target,
  CheckCircle2,
  X,
  Filter,
  UserCheck,
  Send,
  Play,
  Pause
} from 'lucide-react';

export const BoardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [activeView, setActiveView] = useState<'kanban' | 'pipeline' | 'focus'>('kanban');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<string | null>(null);

  // 🔔 Custom Solar Notification Modal State
  const [modalState, setModalState] = useState<SolarNotification>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onClose: () => setModalState((prev) => ({ ...prev, isOpen: false })),
  });

  const showNotification = (message: string, type: 'warning' | 'success' | 'info' = 'warning', title?: string) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      onClose: () => setModalState((prev) => ({ ...prev, isOpen: false })),
    });
  };

  // 🔍 Advanced Filter States (Admin & Manager)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterProfession, setFilterProfession] = useState('ALL');

  // 📬 Task Request Drawer Form State (Recipient Selection within Project)
  const [requestType, setRequestType] = useState<'TRANSFER' | 'ASSIST' | 'REVIEW'>('TRANSFER');
  const [selectedRecipientId, setSelectedRecipientId] = useState('admin-huydat-id');
  const [requestReason, setRequestReason] = useState('');


  // Project Members List
  const projectMembers = [
    { id: 'admin-huydat-id', name: 'Huy Dat (Admin)', role: 'ADMIN', profession: 'DEV' },
    { id: 'manager-minhanh-id', name: 'Minh Anh (Manager)', role: 'MANAGER', profession: 'PRODUCT_OWNER' },
    { id: 'employee-hoangnam-id', name: 'Hoang Nam (Developer)', role: 'EMPLOYEE', profession: 'DEV' },
  ];

  // Initial Mock Tasks for Stage 2 Demonstration
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: 'Thiết kế Giao diện Bảng Kanban Bento Grid 6 Cột',
      description: 'Xây dựng Bảng Kanban kéo thả mượt mà hỗ trợ 6 trạng thái Vòng đời Task.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      progress: 75,
      projectName: 'Solaris Core Architecture',
      assignee: {
        id: 'admin-huydat-id',
        fullName: 'Huy Dat (Admin)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        profession: 'DEV',
      },
      commentsCount: 5,
    },
    {
      id: 'task-2',
      title: 'Tích hợp Voice Check-In & Task-Driven Attendance',
      description: 'Tự động ghi nhận điểm danh khi đụng Task đầu tiên trong ngày.',
      status: 'PAUSED',
      priority: 'IMPORTANT',
      progress: 40,
      projectName: 'Solaris Core Architecture',
      assignee: {
        id: 'manager-minhanh-id',
        fullName: 'Minh Anh (Manager)',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        profession: 'PRODUCT_OWNER',
      },
      commentsCount: 2,
    },
    {
      id: 'task-3',
      title: 'Xây dựng Module Yêu Cầu Chuyển Giao TaskRequest',
      description: 'Gửi yêu cầu TRANSFER / ASSIST / REVIEW dạng PENDING.',
      status: 'IN_REVIEW',
      priority: 'IMPORTANT',
      progress: 90,
      projectName: 'Solaris Core Architecture',
      assignee: {
        id: 'admin-huydat-id',
        fullName: 'Huy Dat (Admin)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        profession: 'DEV',
      },
      commentsCount: 8,
    },
    {
      id: 'task-4',
      title: 'Khắc phục lỗi COOP Pop-up Google OAuth',
      description: 'Thêm header Cross-Origin-Opener-Policy vào vite.config.ts.',
      status: 'DONE',
      priority: 'NORMAL',
      progress: 100,
      projectName: 'Solaris Core Architecture',
      assignee: {
        id: 'admin-huydat-id',
        fullName: 'Huy Dat (Admin)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        profession: 'DEV',
      },
      commentsCount: 3,
    },
    {
      id: 'task-5',
      title: 'Cấu hình WebRTC Video Call Phòng Họp',
      description: 'Cho phép khởi tạo phòng họp trực tuyến và chia sẻ màn hình.',
      status: 'TODO',
      priority: 'LOW',
      progress: 0,
      projectName: 'WebRTC Module',
      assignee: {
        id: 'employee-hoangnam-id',
        fullName: 'Hoang Nam (Developer)',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        profession: 'DEV',
      },
      commentsCount: 0,
    },
  ]);

  const columns: Array<{ id: TaskItem['status']; label: string; color: string; border: string }> = [
    { id: 'TODO', label: '📝 CHỜ THỰC HIỆN', color: 'text-slate-400', border: 'border-slate-800' },
    { id: 'IN_PROGRESS', label: '⚡ ĐANG THỰC HIỆN', color: 'text-emerald-400', border: 'border-emerald-500/40' },
    { id: 'PAUSED', label: '⏸️ TẠM DỪNG DỞ DANG', color: 'text-purple-400', border: 'border-purple-500/40' },
    { id: 'BLOCKED', label: '🚧 BỊ TẮC NGHỄN', color: 'text-rose-400', border: 'border-rose-500/40' },
    { id: 'IN_REVIEW', label: '🔍 CHỜ DUYỆT BÀI', color: 'text-amber-400', border: 'border-amber-500/40' },
    { id: 'DONE', label: '✅ HOÀN THÀNH', color: 'text-teal-400', border: 'border-teal-500/40' },
  ];

  // Pipeline Stages Definition
  const pipelineStages = [
    { id: 'STAGE_1', name: 'Stage 1: Yêu Cầu & Kiến Trúc Core', status: 'DONE', color: 'border-emerald-500/40 text-emerald-300' },
    { id: 'STAGE_2', name: 'Stage 2: Core UI & Bảng Task Kanban', status: 'IN_PROGRESS', color: 'border-amber-500/40 text-amber-300' },
    { id: 'STAGE_3', name: 'Stage 3: WebRTC Video Call & Chat', status: 'PENDING', color: 'border-purple-500/40 text-purple-300' },
    { id: 'STAGE_4', name: 'Stage 4: AI Assistant & Remote Requests', status: 'PENDING', color: 'border-blue-500/40 text-blue-300' },
    { id: 'STAGE_5', name: 'Stage 5: QA Testing & Security Audit', status: 'PENDING', color: 'border-rose-500/40 text-rose-300' },
    { id: 'STAGE_6', name: 'Stage 6: Release & Vận Hành', status: 'PENDING', color: 'border-slate-500/40 text-slate-400' },
  ];

  // Drag and Drop Event Handlers with Ownership & Lock Rules
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);

    // Lock Rule: Task in IN_REVIEW CANNOT be dragged out manually!
    if (targetTask?.status === 'IN_REVIEW') {
      e.preventDefault();
      showNotification(
        '⚠️ Task ở trạng thái "Chờ Duyệt Bài" (IN_REVIEW) chỉ có thể chuyển đổi tự động khi Manager/Admin thực hiện phê duyệt!',
        'warning',
        'Khóa Cột Duyệt Bài'
      );
      return;
    }
    
    // Ownership Rule: Regular EMPLOYEE can ONLY drag their assigned tasks!
    if (user?.globalRole === 'EMPLOYEE' && targetTask?.assignee?.id && targetTask.assignee.id !== user.id) {
      e.preventDefault();
      showNotification('⚠️ Bạn chỉ có quyền kéo thả các Task được phân công cho chính mình!', 'warning', 'Phân Quyền Kéo Thả');
      return;
    }

    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = () => {
    setActiveDropCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskItem['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    // Rule: IN_REVIEW column CANNOT be dropped into manually!
    if (targetStatus === 'IN_REVIEW') {
      showNotification(
        '⚠️ Cột "Chờ Duyệt Bài" (IN_REVIEW) chỉ tự động chuyển qua khi bạn gửi Yêu cầu Duyệt bài (TaskRequest REVIEW) hoặc được Manager phê duyệt!',
        'warning',
        'Chuyển Trạng Thái Tự Động'
      );
      setDraggedTaskId(null);
      setActiveDropCol(null);
      return;
    }

    const targetTask = tasks.find((t) => t.id === taskId);
    if (user?.globalRole === 'EMPLOYEE' && targetTask?.assignee?.id && targetTask.assignee.id !== user.id) {
      showNotification('⚠️ Bạn chỉ có quyền kéo thả các Task được phân công cho chính mình!', 'warning', 'Phân Quyền Kéo Thả');
      setDraggedTaskId(null);
      setActiveDropCol(null);
      return;
    }

    // Move task to target status column
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newProgress = targetStatus === 'DONE' ? 100 : (targetStatus === 'TODO' ? 0 : t.progress);
          return { ...t, status: targetStatus, progress: newProgress };
        }
        return t;
      })
    );

    setDraggedTaskId(null);
    setActiveDropCol(null);
  };

  const handleSendTaskRequest = () => {
    const recipient = projectMembers.find((m) => m.id === selectedRecipientId);
    showNotification(
      `🟢 Đã gửi thành công Yêu cầu ${requestType} Task tới ${recipient?.name || 'đồng nghiệp'}! Trạng thái: PENDING chờ phản hồi.`,
      'success',
      'Gửi Yêu Cầu Task'
    );
    setIsDrawerOpen(false);
    setRequestReason('');
  };

  // Filter Tasks Engine
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterProject !== 'ALL' && t.projectName !== filterProject) {
      return false;
    }
    if (filterAssignee !== 'ALL' && t.assignee?.fullName !== filterAssignee) {
      return false;
    }
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) {
      return false;
    }
    if (filterProfession !== 'ALL' && t.assignee?.profession !== filterProfession) {
      return false;
    }
    return true;
  });

  const focusTask = filteredTasks.find((t) => t.status === 'IN_PROGRESS') || filteredTasks[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-6 space-y-6 relative overflow-x-hidden">
      {/* 🔔 Custom Solar Notification Modal */}
      <SolarNotificationModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={modalState.onClose}
      />

      {/* 🔝 Integrated Header Bar */}
      <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Project & Stage Selector */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Solaris Core Architecture</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Giai đoạn 2: Kanban Core
              </span>

              {/* Admin/Manager Only: Create Project Button */}
              {(user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER') && (
                <button
                  onClick={() => showNotification('Đang mở Modal Khởi Tạo Dự Án Mới cho Admin/Manager...', 'info', 'Khởi Tạo Dự Án')}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Tạo Dự Án Mới
                </button>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Quản lý Bảng Task, Tiến trình Stage &amp; Chấm công Giọng nói</p>
          </div>
        </div>

        {/* 🎙️ 1-Click Voice Attendance & Ca Timer Center */}
        <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-inner">
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
        </div>

        {/* Search & Task Request Drawer Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm task (Ctrl + K)..."
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-56"
            />
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all relative cursor-pointer"
          >
            <Inbox className="w-4 h-4 text-amber-400" />
            <span>Yêu Cầu Task</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
              PENDING
            </span>
          </button>
        </div>
      </div>

      {/* 🔍 Advanced Filter Toolbar (Admin & Manager Multi-Criteria Filter) */}
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
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            My Focus Queue
          </button>
        </div>

        {/* Admin Multi-Criteria Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Bộ Lọc Admin:
          </span>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL">📁 Tất cả Dự Án</option>
            <option value="Solaris Core Architecture">Solaris Core Architecture</option>
            <option value="WebRTC Module">WebRTC Module</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL">👤 Tất cả Người Thực Hiện</option>
            <option value="Huy Dat (Admin)">Huy Dat (Admin)</option>
            <option value="Minh Anh (Manager)">Minh Anh (Manager)</option>
            <option value="Hoang Nam (Developer)">Hoang Nam (Dev)</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL">🎯 Tất cả Mức Ưu Tiên</option>
            <option value="URGENT">🔴 URGENT (Khẩn cấp)</option>
            <option value="IMPORTANT">🟡 IMPORTANT (Quan trọng)</option>
            <option value="NORMAL">🔵 NORMAL (Bình thường)</option>
            <option value="LOW">⚪ LOW (Thấp)</option>
          </select>

          <select
            value={filterProfession}
            onChange={(e) => setFilterProfession(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL">💼 Tất cả Nghiệp Vụ</option>
            <option value="DEV">DEV (Lập trình viên)</option>
            <option value="PRODUCT_OWNER">PRODUCT_OWNER (Quản lý)</option>
            <option value="TESTER">TESTER (Kiểm thử)</option>
          </select>


          <button
            onClick={() => showNotification('Đang mở Form Tạo Task Mới...', 'info', 'Tạo Task')}
            className="solar-corona-btn px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-md cursor-pointer ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tạo Task Mới
          </button>
        </div>
      </div>

      {/* 🚀 VIEW 1: KANBAN BOARD VIEW 6 COLUMNS */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start pb-12 overflow-x-auto">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isDropActive = activeDropCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`solar-glass-card p-4 rounded-2xl bg-[#0F172A]/60 border transition-all duration-300 min-h-[500px] flex flex-col space-y-3 ${
                  isDropActive ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : col.border
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className={`text-xs font-extrabold tracking-wider ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable={t.status !== 'IN_REVIEW'}
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      className="cursor-grab active:cursor-grabbing transform transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <KanbanCard
                        task={t}
                        onRequestTransfer={() => {
                          setIsDrawerOpen(true);
                        }}

                      />
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-xs text-slate-600 font-mono">
                      Kéo thả Task vào đây
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
                      <KanbanCard key={t.id} task={t} />
                    ))}
                    {stageTasks.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-4 text-center">Chưa có task ở Stage này</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎯 VIEW 3: MY FOCUS QUEUE VIEW */}
      {activeView === 'focus' && (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          {/* Hero Active Focus Task */}
          {focusTask && (
            <div className="solar-glass-card p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)] space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 tracking-widest uppercase flex items-center gap-1.5 shadow-lg">
                  <Play className="w-3.5 h-3.5 fill-current" /> FOCUS TASK #1
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  ⏱️ Đang Đếm Giờ Ca Làm Việc: 01h 45m
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">{focusTask.title}</h2>
                <p className="text-sm text-slate-300">{focusTask.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Tiến độ thực hiện</span>
                  <span className="font-bold text-amber-400">{focusTask.progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-amber-500/30">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]" style={{ width: `${focusTask.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => showNotification('Đã hoàn thành Task!', 'success', 'Focus Queue')}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> ĐÁNH DẤU HOÀN THÀNH (DONE)
                </button>

                <button
                  onClick={() => showNotification('Đã tạm dừng Task!', 'info', 'Focus Queue')}
                  className="px-4 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Pause className="w-4 h-4" /> TẠM DỪNG (PAUSED)
                </button>
              </div>
            </div>
          )}

          {/* Priority Focus Queue Below */}
          <div className="solar-glass-card p-6 rounded-3xl bg-[#0F172A]/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-400" />
              Hàng Chờ Ưu Tiên Tiếp Theo (My Priority Queue)
            </h3>

            <div className="space-y-3">
              {filteredTasks.slice(1).map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 hover:border-amber-500/30 transition-all">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-300 block">{t.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Dự án: {t.projectName} | Ưu tiên: {t.priority}</span>
                  </div>
                  <button
                    onClick={() => showNotification(`Đã chuyển ${t.title} lên Focus #1`, 'info', 'Focus Queue')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30 cursor-pointer"
                  >
                    Đẩy Lên #1
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📬 Floating Task Requests Drawer with Recipient Selection within Project */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0F172A] border-l border-amber-500/30 p-6 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-extrabold text-white">Gửi Yêu Cầu Task mới</h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Gửi Yêu Cầu Task */}
              <div className="solar-glass-card p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-4">
                {/* Loai Yêu Cầu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-300 block">1. Loại Yêu Cầu (Request Type)</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => setRequestType('TRANSFER')}
                      className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                        requestType === 'TRANSFER' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      TRANSFER
                    </button>
                    <button
                      onClick={() => setRequestType('ASSIST')}
                      className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                        requestType === 'ASSIST' ? 'bg-purple-600 text-white border-purple-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      ASSIST
                    </button>
                    <button
                      onClick={() => setRequestType('REVIEW')}
                      className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                        requestType === 'REVIEW' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      REVIEW
                    </button>
                  </div>
                </div>

                {/* Chon Người Nhận Trong Dự Án */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    2. Chọn Người Nhận Trong Cùng Dự Án (Recipient Member)
                  </label>
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {projectMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — ({m.role} / {m.profession})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ly do */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-300 block">3. Lý Do &amp; Kế Hoạch Bàn Giao</label>
                  <textarea
                    rows={3}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Nhập chi tiết lý do chuyển giao hoặc cần hỗ trợ..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleSendTaskRequest}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Gửi Yêu Cầu (PENDING)
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer mt-4"
            >
              Đóng Hộp Thư
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
