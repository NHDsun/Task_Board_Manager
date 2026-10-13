import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { SolarNotificationModal } from '../../common/SolarNotificationModal';
import { TaskDetailModal } from '../TaskDetailModal';
import { DeleteTaskConfirmModal } from '../DeleteTaskConfirmModal';
import { TaskRequestModal } from '../TaskRequestModal';
import { TaskTransferInboxModal } from '../TaskTransferInboxModal';
import { CreateProjectModal } from '../CreateProjectModal';
import { CreateTaskModal } from '../CreateTaskModal';
import { ProjectMembersModal } from '../ProjectMembersModal';
import type { TaskItem } from '../KanbanCard';

interface BoardModalsContainerProps {
  selectedTaskForDetail: TaskItem | null;
  setSelectedTaskForDetail: (task: TaskItem | null) => void;
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  taskToDelete: TaskItem | null;
  setTaskToDelete: (task: TaskItem | null) => void;
  isDeleting: boolean;
  handleConfirmDeleteTask: () => void;
  projectToDelete: { id: string; name: string } | null;
  setProjectToDelete: (proj: { id: string; name: string } | null) => void;
  handleConfirmDeleteProject: () => void;
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;
  tasks: TaskItem[];
  selectedTaskForRequest: TaskItem | null;
  fetchTasksFromBackend: () => void;
  fetchNotificationCount: () => void;
  isTransferInboxOpen: boolean;
  setIsTransferInboxOpen: (open: boolean) => void;
  isCreateProjectModalOpen: boolean;
  setIsCreateProjectModalOpen: (open: boolean) => void;
  dbProjects: Array<{ id: string; name: string }>;
  setDbProjects: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string }>>>;
  fetchMetadata: () => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  confirmDoneTask: { taskId: string; taskTitle: string } | null;
  setConfirmDoneTask: (task: { taskId: string; taskTitle: string } | null) => void;
  executeMoveToDone: () => void;
  workAheadModal: any;
  setWorkAheadModal: (modal: any) => void;
  setRestingTodayTasks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWorkingAheadTasks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filterProject: string;
  isProjectMembersModalOpen: boolean;
  setIsProjectMembersModalOpen: (open: boolean) => void;
  modalState: { isOpen: boolean; title: string; message: string; type: 'success' | 'warning' | 'info' };
  setModalState: (state: any) => void;
  showNotification: (msg: string, type: 'success' | 'warning' | 'info', title?: string) => void;
}

export const BoardModalsContainer: React.FC<BoardModalsContainerProps> = ({
  selectedTaskForDetail,
  setSelectedTaskForDetail,
  setTasks,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  taskToDelete,
  setTaskToDelete,
  isDeleting,
  handleConfirmDeleteTask,
  projectToDelete,
  setProjectToDelete,
  handleConfirmDeleteProject,
  isRequestModalOpen,
  setIsRequestModalOpen,
  tasks,
  selectedTaskForRequest,
  fetchTasksFromBackend,
  fetchNotificationCount,
  isTransferInboxOpen,
  setIsTransferInboxOpen,
  isCreateProjectModalOpen,
  setIsCreateProjectModalOpen,
  dbProjects,
  setDbProjects,
  fetchMetadata,
  isCreateTaskModalOpen,
  setIsCreateTaskModalOpen,
  confirmDoneTask,
  setConfirmDoneTask,
  executeMoveToDone,
  workAheadModal,
  setWorkAheadModal,
  setRestingTodayTasks,
  setWorkingAheadTasks,
  filterProject,
  isProjectMembersModalOpen,
  setIsProjectMembersModalOpen,
  modalState,
  setModalState,
  showNotification,
}) => {
  const selectedProj =
    dbProjects.find((p) => p.name === filterProject || p.id === filterProject) ||
    dbProjects[0];

  return (
    <>
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

      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0F172A] border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Xác Nhận Xóa Dự Án</h3>
                <span className="text-[10px] text-rose-400/90 font-mono font-bold uppercase tracking-wider">
                  CHUYỂN VÀO THÙNG RÁC (LƯU GIỮ 14 NGÀY)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              Bạn có chắc chắn muốn xóa dự án <span className="text-white font-bold">"{projectToDelete.name}"</span>? Dự án và toàn bộ các task thuộc dự án sẽ được chuyển vào <span className="text-amber-400 font-bold">Thùng Rác Hệ Thống</span> và lưu giữ an toàn trong 14 ngày.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDeleteProject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Đang Xử Lý...' : 'Xác Nhận Xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <TaskRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        tasks={tasks}
        initialTask={selectedTaskForRequest}
        onSubmitSuccess={(msg) => {
          showNotification(msg, 'success', 'Yêu Cầu Task Đã Gửi');
          fetchTasksFromBackend();
          fetchNotificationCount();
        }}
      />

      <TaskTransferInboxModal
        isOpen={isTransferInboxOpen}
        onClose={() => setIsTransferInboxOpen(false)}
        onSuccess={() => {
          showNotification('🟢 Đã tiếp nhận và cập nhật phân công Task thành công!', 'success', 'Yêu Cầu Chuyển Giao');
          fetchTasksFromBackend();
          fetchNotificationCount();
        }}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        existingProjects={dbProjects.map((p) => p.name)}
        onSuccess={(newProj) => {
          showNotification('🟢 Khởi tạo Dự Án Mới thành công!', 'success', 'Tạo Dự Án');
          if (newProj && newProj.id) {
            setDbProjects((prev) => [newProj, ...prev]);
          }
          fetchMetadata();
          fetchTasksFromBackend();
        }}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSuccess={(newTask) => {
          showNotification('🟢 Khởi tạo Task Mới thành công!', 'success', 'Tạo Task');
          if (newTask && newTask.id) {
            setTasks((prev) => [newTask, ...prev]);
          }
          fetchTasksFromBackend();
        }}
      />

      <SolarNotificationModal
        isOpen={!!confirmDoneTask}
        onClose={() => setConfirmDoneTask(null)}
        type="success"
        title="Xác Nhận Hoàn Thành Task"
        message={`Bạn có chắc chắn muốn đánh dấu Task "${confirmDoneTask?.taskTitle}" là HOÀN THÀNH (DONE - 100% Tiến Độ) không?`}
        confirmText="🚀 Xác Nhận Hoàn Thành"
        onConfirm={executeMoveToDone}
      />

      {workAheadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg solar-glass-card p-6 md:p-8 rounded-3xl bg-[#0F172A]/95 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden space-y-6 animate-solar-warp-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl shadow-md">
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
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> ✨ Tiến Hành Luôn Task Con Ngày Mai
              </button>
            </div>
          </div>
        </div>
      )}

      <ProjectMembersModal
        isOpen={isProjectMembersModalOpen}
        onClose={() => setIsProjectMembersModalOpen(false)}
        projectId={selectedProj?.id || ''}
        projectName={selectedProj?.name || 'Dự án chính'}
        onMemberChanged={() => {
          fetchMetadata();
          fetchTasksFromBackend();
        }}
      />

      <SolarNotificationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </>
  );
};
