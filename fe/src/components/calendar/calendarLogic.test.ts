import { describe, it, expect } from 'vitest';
import type { TaskItem } from '../kanban/KanbanCard';

function filterTasks(
  tasks: TaskItem[],
  selectedProjectId: string,
  selectedAssigneeId: string,
  selectedPriority: string
): TaskItem[] {
  return tasks.filter((task) => {
    if (selectedProjectId !== 'ALL' && task.projectId !== selectedProjectId) {
      return false;
    }

    if (selectedAssigneeId !== 'ALL') {
      const isDirectAssignee = task.assigneeId === selectedAssigneeId;
      const isSubtaskAssignee = task.subtasks?.some(
        (st) => st.assigneeId === selectedAssigneeId || st.assignee?.id === selectedAssigneeId
      );
      if (!isDirectAssignee && !isSubtaskAssignee) return false;
    }

    if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
      return false;
    }

    return true;
  });
}

describe('Calendar Multi-Criteria Filter Logic', () => {
  const sampleTasks: TaskItem[] = [
    {
      id: 't-1',
      title: 'Thi?t k? Solar UI',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      progress: 40,
      projectId: 'proj-1',
      assigneeId: 'user-a',
    },
    {
      id: 't-2',
      title: 'T?i uu Backend NestJS',
      status: 'TODO',
      priority: 'IMPORTANT',
      progress: 0,
      projectId: 'proj-1',
      assigneeId: 'user-b',
    },
    {
      id: 't-3',
      title: 'Vi?t Test Suite',
      status: 'DONE',
      priority: 'NORMAL',
      progress: 100,
      projectId: 'proj-2',
      assigneeId: 'user-a',
      subtasks: [
        { id: 'st-1', title: 'Vitest setup', isDone: true, assigneeId: 'user-c' },
      ],
    },
  ];

  it('should return all tasks when all filters are set to ALL', () => {
    const result = filterTasks(sampleTasks, 'ALL', 'ALL', 'ALL');
    expect(result.length).toBe(3);
  });

  it('should filter tasks strictly by projectId', () => {
    const result = filterTasks(sampleTasks, 'proj-1', 'ALL', 'ALL');
    expect(result.length).toBe(2);
    expect(result.every((t) => t.projectId === 'proj-1')).toBe(true);
  });

  it('should filter tasks by direct assigneeId and subtask assigneeId', () => {
    const resultDirect = filterTasks(sampleTasks, 'ALL', 'user-b', 'ALL');
    expect(resultDirect.length).toBe(1);
    expect(resultDirect[0].id).toBe('t-2');

    const resultSubtask = filterTasks(sampleTasks, 'ALL', 'user-c', 'ALL');
    expect(resultSubtask.length).toBe(1);
    expect(resultSubtask[0].id).toBe('t-3');
  });

  it('should filter tasks by priority', () => {
    const result = filterTasks(sampleTasks, 'ALL', 'ALL', 'URGENT');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t-1');
  });

  it('should combine multiple filters correctly', () => {
    const result = filterTasks(sampleTasks, 'proj-1', 'user-a', 'URGENT');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t-1');

    const emptyResult = filterTasks(sampleTasks, 'proj-2', 'user-a', 'URGENT');
    expect(emptyResult.length).toBe(0);
  });
});
