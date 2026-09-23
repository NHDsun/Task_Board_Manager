import { api } from './api';
import type { Task } from '../types';
import type { DirectoryUser } from '../store/useUserStore';
import type { WorkScheduleRecord } from '../store/useScheduleStore';

export type DispatchActionType = 'TRANSFER' | 'PAUSE_EXTEND' | 'KEEP';

export interface AssigneeCandidate {
  user: DirectoryUser;
  score: number;
  reasons: string[];
  activeTaskCount: number;
}

export interface TaskImpactItem {
  task: Task;
  impactType: 'URGENT_DEADLINE' | 'CRITICAL_OVERDUE' | 'STANDARD_DEFERRABLE';
  leaveDays: number;
  
  // Recommendations
  recommendedAction: DispatchActionType;
  recommendedAssignee?: DirectoryUser;
  recommendedAssigneeScore?: number;
  recommendedExtendDays: number;
  candidates: AssigneeCandidate[];

  // Manager Selected Decisions
  selectedAction: DispatchActionType;
  selectedAssigneeId?: string;
  selectedExtendDays: number;
  customNote?: string;
}

/**
 * Calculates number of calendar days between two ISO date strings (inclusive)
 */
export const calculateLeaveDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 1;
  const start = new Date(`${startDate.split('T')[0]}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate.split('T')[0]}T00:00:00.000Z`).getTime();
  if (isNaN(start) || isNaN(end) || start > end) return 1;
  const diffTime = end - start;
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

/**
 * Adds N calendar days to an ISO date string
 */
export const addDaysToDateString = (dateStr: string, days: number): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
};

/**
 * Smart algorithm: Evaluates and scores potential substitute assignees for a given task
 */
export const findBestAssigneeCandidates = (
  _task: Task,
  requester: DirectoryUser | undefined,
  candidates: DirectoryUser[],
  workSchedules: WorkScheduleRecord[],
  startDate: string,
  endDate: string,
  allTasks: Task[]
): AssigneeCandidate[] => {
  if (!candidates || candidates.length === 0) return [];

  const requesterId = requester?.id;

  // Pre-calculate active tasks count for each candidate
  const taskCountMap = new Map<string, number>();
  allTasks.forEach((t) => {
    if (t.assigneeId && (t.status === 'TODO' || (t.status as string) === 'IN_PROGRESS')) {
      taskCountMap.set(t.assigneeId, (taskCountMap.get(t.assigneeId) || 0) + 1);
    }
  });

  const scoredList: AssigneeCandidate[] = candidates
    .filter((u) => u.id !== requesterId && u.isActive)
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Same Department match (+30 pts)
      const sameDept = requester?.departmentId && candidate.departmentId === requester.departmentId;
      if (sameDept) {
        score += 30;
        reasons.push('Cùng phòng ban');
      }

      // 2. Same Profession match (+30 pts)
      const sameProfession = requester?.profession && candidate.profession === requester.profession;
      if (sameProfession) {
        score += 30;
        reasons.push(`Cùng chuyên môn (${candidate.profession})`);
      }

      // 3. Workload Balance (+25 max pts)
      const activeTasks = taskCountMap.get(candidate.id) || 0;
      if (activeTasks === 0) {
        score += 25;
        reasons.push('Đang rảnh (0 Task)');
      } else if (activeTasks <= 2) {
        score += 20;
        reasons.push(`Tải việc thấp (${activeTasks} Task)`);
      } else if (activeTasks <= 5) {
        score += 10;
        reasons.push(`Tải việc vừa (${activeTasks} Task)`);
      } else {
        score += 2;
        reasons.push(`Tải việc cao (${activeTasks} Task)`);
      }

      // 4. Availability in leave range (+15 pts)
      const isOnLeaveInPeriod = workSchedules.some(
        (s) =>
          s.userId === candidate.id &&
          s.date >= startDate &&
          s.date <= endDate &&
          s.workType === 'LEAVE'
      );

      if (!isOnLeaveInPeriod) {
        score += 15;
        reasons.push('Có mặt trong kỳ nghỉ');
      } else {
        score -= 20;
        reasons.push('Trùng lịch nghỉ');
      }

      return {
        user: candidate,
        score: Math.max(0, Math.min(100, score)),
        reasons,
        activeTaskCount: activeTasks,
      };
    });

  // Sort descending by score
  return scoredList.sort((a, b) => b.score - a.score);
};

/**
 * Checks if a leave type requires task handover / workload dispatching
 * (WFH does not require handover because the employee continues working).
 */
export const isLeaveRequiringHandover = (leaveType?: string): boolean => {
  if (!leaveType) return true;
  return leaveType !== 'WFH';
};

/**
 * Scans user's assigned tasks and calculates the impact analysis matrix for a leave request
 */
export const calculateLeaveImpact = (
  tasks: Task[],
  userId: string,
  startDate: string,
  endDate: string,
  directoryUsers: DirectoryUser[],
  workSchedules: WorkScheduleRecord[],
  leaveType?: string
): TaskImpactItem[] => {
  if (!tasks || tasks.length === 0 || !userId || !startDate || !endDate) return [];
  if (leaveType === 'WFH') return []; // WFH continues normal work, no handover needed

  const leaveDays = calculateLeaveDays(startDate, endDate);
  const requester = directoryUsers.find((u) => u.id === userId);

  // Filter tasks assigned to this user that are active
  const userActiveTasks = tasks.filter(
    (t) =>
      t.assigneeId === userId &&
      !t.isArchived &&
      t.status !== 'DONE'
  );

  return userActiveTasks.map((task) => {
    const isUrgent =
      (task.priority as string) === 'URGENT' ||
      (task.priority as string) === 'IMPORTANT' ||
      (task.priority as string) === 'HIGH';

    const taskDue = task.dueDate ? task.dueDate.split('T')[0] : null;
    const isDueInLeave = taskDue && taskDue >= startDate && taskDue <= endDate;
    const isOverdue = taskDue && taskDue < startDate;

    let impactType: TaskImpactItem['impactType'] = 'STANDARD_DEFERRABLE';
    let recommendedAction: DispatchActionType = 'PAUSE_EXTEND';

    if (isOverdue) {
      impactType = 'CRITICAL_OVERDUE';
      recommendedAction = 'TRANSFER';
    } else if (isUrgent || isDueInLeave) {
      impactType = 'URGENT_DEADLINE';
      recommendedAction = 'TRANSFER';
    } else {
      impactType = 'STANDARD_DEFERRABLE';
      recommendedAction = 'PAUSE_EXTEND';
    }

    const candidates = findBestAssigneeCandidates(
      task,
      requester,
      directoryUsers,
      workSchedules,
      startDate,
      endDate,
      tasks
    );

    const topCandidate = candidates.length > 0 ? candidates[0] : undefined;

    return {
      task,
      impactType,
      leaveDays,
      recommendedAction,
      recommendedAssignee: topCandidate?.user,
      recommendedAssigneeScore: topCandidate?.score,
      recommendedExtendDays: leaveDays,
      candidates,
      selectedAction: recommendedAction,
      selectedAssigneeId: topCandidate?.user.id,
      selectedExtendDays: leaveDays,
      customNote: '',
    };
  });
};

/**
 * Executes batch dispatch plan when a leave request is approved
 */
export const executeDispatchPlan = async (
  impacts: TaskImpactItem[],
  leaveRequest: {
    id: string;
    userId: string;
    userName: string;
    startDate: string;
    endDate: string;
  },
  _approver?: { id?: string; fullName?: string }
): Promise<{ transferredCount: number; pausedCount: number; errors: string[] }> => {
  let transferredCount = 0;
  let pausedCount = 0;
  const errors: string[] = [];

  for (const item of impacts) {
    try {
      if (item.selectedAction === 'TRANSFER' && item.selectedAssigneeId) {
        // 1. Transfer Task to new Assignee
        await api.patch(`/tasks/${item.task.id}`, {
          assigneeId: item.selectedAssigneeId,
        });

        const targetUser = item.candidates.find((c) => c.user.id === item.selectedAssigneeId)?.user;
        const noteMsg = `🤖 [Tự Động Điều Phối Phép] Task được chuyển giao cho ${
          targetUser?.fullName || 'đồng nghiệp mới'
        } do ${leaveRequest.userName} nghỉ phép (${leaveRequest.startDate} ➔ ${leaveRequest.endDate}). ${
          item.customNote ? `Ghi chú: ${item.customNote}` : ''
        }`;

        // Add auto comment log
        try {
          await api.post(`/tasks/${item.task.id}/comments`, {
            content: noteMsg,
          });
        } catch {
          // ignore comment fallback
        }

        transferredCount++;
      } else if (item.selectedAction === 'PAUSE_EXTEND') {
        // 2. Pause & Extend Deadline
        const currentDue = item.task.dueDate || new Date().toISOString();
        const newDueDate = addDaysToDateString(currentDue, item.selectedExtendDays);

        await api.patch(`/tasks/${item.task.id}`, {
          status: 'PAUSED',
          dueDate: newDueDate,
        });

        const noteMsg = `🤖 [Tự Động Điều Phối Phép] Task được tạm dừng (PAUSED) và tự động dời Deadline +${
          item.selectedExtendDays
        } ngày (Hạn mới: ${newDueDate}) trong thời gian ${leaveRequest.userName} nghỉ phép.`;

        try {
          await api.post(`/tasks/${item.task.id}/comments`, {
            content: noteMsg,
          });
        } catch {
          // ignore comment fallback
        }

        pausedCount++;
      }
    } catch (err: any) {
      console.error(`Lỗi điều phối task ${item.task.id}:`, err);
      errors.push(`Task '${item.task.title}': ${err.message || 'Lỗi cập nhật'}`);
    }
  }

  return { transferredCount, pausedCount, errors };
};
