export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type CallType = 'AUDIO' | 'VIDEO';
export type CallStatus = 'COMPLETED' | 'MISSED' | 'REJECTED' | 'BUSY';

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  googleId?: string | null;
  avatar?: string | null;
  departmentId?: string | null;
  department?: Department | null;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  isUrgent?: boolean;
  estimatedDays?: number;
  approvalStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  taskId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string | null;
  dueDate?: string | null;
  recurrenceRule?: string | null;
  isArchived: boolean;
  projectId: string;
  creatorId: string;
  assigneeId?: string | null;
  creator?: User;
  assignee?: User | null;
  subtasks?: Subtask[];
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner?: User;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sender?: User;
  receiver?: User;
  createdAt: string;
}

export interface CallLog {
  id: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  duration: number;
  caller?: User;
  receiver?: User;
  createdAt: string;
}
