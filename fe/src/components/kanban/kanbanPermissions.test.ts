import { describe, it, expect } from 'vitest';
import type { TaskItem } from './KanbanCard';

interface UserContext {
  id: string;
  email: string;
  globalRole: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

function checkCanDragTask(user: UserContext | null, task: TaskItem): boolean {
  if (!user) return false;
  if (task.status === 'IN_REVIEW') return false; // C?t IN_REVIEW b? khóa kéo th? t? do

  const isManagerOrAdmin = user.globalRole === 'ADMIN' || user.globalRole === 'MANAGER';
  const hasAssignee = Boolean(task.assigneeId || task.assignee?.id || task.assignee?.email);
  const isTaskOwner = hasAssignee
    ? (task.assigneeId === user.id ||
       task.assignee?.id === user.id ||
       task.assignee?.email === user.email)
    : task.createdById === user.id;

  return isManagerOrAdmin || isTaskOwner;
}

function checkCanManageSubtasks(user: UserContext | null, task: TaskItem): boolean {
  if (!user) return false;
  const isManagerOrAdmin = user.globalRole === 'ADMIN' || user.globalRole === 'MANAGER';
  const hasAssignee = Boolean(task.assigneeId || task.assignee?.id || task.assignee?.email);
  const isAssignee = hasAssignee && (
    task.assigneeId === user.id ||
    task.assignee?.id === user.id ||
    task.assignee?.email === user.email
  );
  const isCreator = !hasAssignee && task.createdById === user.id;

  return isManagerOrAdmin || isAssignee || isCreator;
}

describe('Kanban Permission Matrix (RBAC & Drag Rules)', () => {
  const adminUser: UserContext = { id: 'u-admin', email: 'admin@solaris.io', globalRole: 'ADMIN' };
  const managerUser: UserContext = { id: 'u-manager', email: 'manager@solaris.io', globalRole: 'MANAGER' };
  const devUserA: UserContext = { id: 'u-dev-a', email: 'deva@solaris.io', globalRole: 'EMPLOYEE' };
  const devUserB: UserContext = { id: 'u-dev-b', email: 'devb@solaris.io', globalRole: 'EMPLOYEE' };

  const taskAssignedToA: TaskItem = {
    id: 't-1',
    title: 'Xây d?ng API Xác th?c',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    progress: 50,
    assigneeId: 'u-dev-a',
    createdById: 'u-admin',
  };

  const taskInReview: TaskItem = {
    id: 't-2',
    title: 'Ki?m th? Penetration Test',
    status: 'IN_REVIEW',
    priority: 'IMPORTANT',
    progress: 100,
    assigneeId: 'u-dev-a',
    createdById: 'u-admin',
  };

  describe('Drag & Drop Rules (LC-107)', () => {
    it('should allow Assignee to drag their own task', () => {
      expect(checkCanDragTask(devUserA, taskAssignedToA)).toBe(true);
    });

    it('should forbid other Employee from dragging someone elses task', () => {
      expect(checkCanDragTask(devUserB, taskAssignedToA)).toBe(false);
    });

    it('should allow Manager and Admin to drag any task for coordination', () => {
      expect(checkCanDragTask(managerUser, taskAssignedToA)).toBe(true);
      expect(checkCanDragTask(adminUser, taskAssignedToA)).toBe(true);
    });

    it('should lock dragging for IN_REVIEW tasks for everyone', () => {
      expect(checkCanDragTask(devUserA, taskInReview)).toBe(false);
      expect(checkCanDragTask(managerUser, taskInReview)).toBe(false);
      expect(checkCanDragTask(adminUser, taskInReview)).toBe(false);
    });
  });

  describe('Subtask Management Rules', () => {
    it('should allow Direct Assignee, Manager, and Admin to create subtasks', () => {
      expect(checkCanManageSubtasks(devUserA, taskAssignedToA)).toBe(true);
      expect(checkCanManageSubtasks(managerUser, taskAssignedToA)).toBe(true);
      expect(checkCanManageSubtasks(adminUser, taskAssignedToA)).toBe(true);
    });

    it('should deny non-assigned Employee from creating subtasks on other tasks', () => {
      expect(checkCanManageSubtasks(devUserB, taskAssignedToA)).toBe(false);
    });
  });
});
