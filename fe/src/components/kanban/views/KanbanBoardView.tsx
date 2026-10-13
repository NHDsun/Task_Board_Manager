import React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import ReactDOM from 'react-dom';
import { KanbanCard, type TaskItem, type SubtaskItem } from '../KanbanCard';

interface ColumnDef {
  id: string;
  label: string;
  color: string;
  border: string;
}

interface KanbanBoardViewProps {
  columns: ColumnDef[];
  filteredTasks: TaskItem[];
  user: any;
  recentlyMovedTaskId: string | null;
  onDragEnd: (result: DropResult) => void;
  onQuickRequest: (task: TaskItem) => void;
  onSelectTaskForDetail: (task: TaskItem) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, isDone?: boolean) => void;
  onDeleteTask: (task: TaskItem) => void;
  getPortalRoot: () => HTMLElement;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  columns,
  filteredTasks,
  user,
  recentlyMovedTaskId,
  onDragEnd,
  onQuickRequest,
  onSelectTaskForDetail,
  onToggleSubtask,
  onDeleteTask,
  getPortalRoot,
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
                      const isManagerOrAdmin = Boolean(
                        user?.globalRole === 'ADMIN' ||
                        user?.globalRole === 'MANAGER' ||
                        (user as any)?.role === 'ADMIN' ||
                        (user as any)?.role === 'MANAGER'
                      );
                      const hasAssignee = Boolean(t.assigneeId || t.assignee?.id || t.assignee?.email);
                      const isSubtaskAssignee = Boolean(
                        t.subtasks &&
                        t.subtasks.some((st: SubtaskItem) => st.assigneeId === user?.id || st.assignee?.id === user?.id)
                      );
                      const isMyOwnTask = hasAssignee
                        ? (t.assigneeId === user?.id ||
                           t.assignee?.id === user?.id ||
                           t.assignee?.email === user?.email ||
                           isSubtaskAssignee)
                        : (t as any).createdById === user?.id || isSubtaskAssignee;
                      const isDragDisabled = t.status === 'IN_REVIEW' || (!isManagerOrAdmin && !isMyOwnTask);

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
                                  onRequestTransfer={onQuickRequest}
                                  onCardClick={onSelectTaskForDetail}
                                  onToggleSubtask={onToggleSubtask}
                                  onDeleteTask={onDeleteTask}
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
  );
};
