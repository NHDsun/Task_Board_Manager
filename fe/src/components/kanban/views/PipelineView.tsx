import React from 'react';
import ReactDOM from 'react-dom';
import {
  GitMerge,
  Sliders,
  Folder,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Lock,
  Unlock,
  PlusCircle,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { KanbanCard, type TaskItem } from '../KanbanCard';

interface PipelineViewProps {
  user: any;
  tasks: TaskItem[];
  filteredTasks: TaskItem[];
  dbProjects: Array<any>;
  selectedPipelineProject: string;
  setSelectedPipelineProject: (v: string) => void;
  isEditingPipelineStages: boolean;
  setIsEditingPipelineStages: (v: boolean) => void;
  isStageLockingEnabled: boolean;
  setIsStageLockingEnabled: (v: boolean) => void;
  activePipelineStages: Array<{ id: string; name: string; status: string; color: string }>;
  setActivePipelineStages: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; status: string; color: string }>>>;
  newStageNameInput: string;
  setNewStageNameInput: (v: string) => void;
  recentlyMovedTaskId: string | null;
  onPipelineDragEnd: (result: DropResult) => void;
  onQuickRequest: (task: TaskItem) => void;
  onSelectTaskForDetail: (task: TaskItem) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, isDone: boolean) => void;
  onDeleteTask: (task: TaskItem) => void;
  onToggleProjectCompletion: (projectId: string, isCompleted: boolean) => void;
  onSetProjectToDelete: (proj: { id: string; name: string }) => void;
  onOpenProjectMembersModal: () => void;
  showNotification: (msg: string, type: 'info' | 'success' | 'warning', title?: string) => void;
  getPortalRoot: () => HTMLElement;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  user,
  tasks,
  filteredTasks,
  dbProjects,
  selectedPipelineProject,
  setSelectedPipelineProject,
  isEditingPipelineStages,
  setIsEditingPipelineStages,
  isStageLockingEnabled,
  setIsStageLockingEnabled,
  activePipelineStages,
  setActivePipelineStages,
  newStageNameInput,
  setNewStageNameInput,
  recentlyMovedTaskId,
  onPipelineDragEnd,
  onQuickRequest,
  onSelectTaskForDetail,
  onToggleSubtask,
  onDeleteTask,
  onToggleProjectCompletion,
  onSetProjectToDelete,
  onOpenProjectMembersModal,
  showNotification,
  getPortalRoot,
}) => {
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

      {selectedPipelineProject !== 'ALL' && (() => {
        const currentProj = dbProjects.find((p) => p.name === selectedPipelineProject);
        return (
          <div className="solar-glass-card p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#0F172A] to-slate-900 border border-purple-500/40 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-purple-400" />
                Dự Án: {selectedPipelineProject}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {Boolean(currentProj?.isCompleted) ? (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    🟢 Đã Nghiệm Thu Hoàn Thành
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    🔒 Dự Án Đang Hoạt Động (Active Roadmap)
                  </span>
                )}

                {user?.globalRole === 'ADMIN' && currentProj && !currentProj.isCompleted && projectCompletionPercent === 100 && totalProjectTasks > 0 && (
                  <button
                    onClick={() => onToggleProjectCompletion(currentProj.id, true)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/50 animate-pulse hover:animate-none"
                    title="Xác nhận nghiệm thu & đóng dự án khi đạt 100% tiến độ"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>🏆 Xác Nhận Hoàn Thành Dự Án (100% Roadmap)</span>
                  </button>
                )}

                {user?.globalRole === 'ADMIN' && currentProj && Boolean(currentProj.isCompleted) && (
                  <button
                    onClick={() => onToggleProjectCompletion(currentProj.id, false)}
                    className="px-3 py-1 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    title="Mở lại dự án để tiếp tục tác nghiệp"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mở Lại Dự Án</span>
                  </button>
                )}

                {user?.globalRole === 'ADMIN' && currentProj && (
                  <button
                    onClick={() =>
                      onSetProjectToDelete({
                        id: currentProj.id,
                        name: currentProj.name,
                      })
                    }
                    className="px-3 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    title="Xóa Dự Án (Lưu vào Thùng Rác 14 ngày)"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Xóa Dự Án</span>
                  </button>
                )}
              </div>
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
                  onClick={onOpenProjectMembersModal}
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

      {isEditingPipelineStages && (user?.globalRole === 'ADMIN' || user?.globalRole === 'MANAGER') && (
        <div className="solar-glass-card p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Chỉnh Sửa & Thêm Giai Đoạn Pipeline Trực Tiếp ({activePipelineStages.length} giai đoạn)
            </h3>

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

      <DragDropContext onDragEnd={onPipelineDragEnd}>
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
                                  onRequestTransfer={onQuickRequest}
                                  onCardClick={(taskItem) => onSelectTaskForDetail(taskItem)}
                                  onToggleSubtask={onToggleSubtask}
                                  onDeleteTask={(taskItem) => onDeleteTask(taskItem)}
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
};
