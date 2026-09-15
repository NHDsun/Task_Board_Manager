import { create } from 'zustand';

export type WorkLocationType = 'OFFICE' | 'WFH' | 'ON_SITE' | 'LEAVE';
export type WorkShift = 'FULL_DAY' | 'MORNING' | 'AFTERNOON';
export type LeaveType = 'WFH' | 'ANNUAL_LEAVE' | 'SICK_LEAVE' | 'UNPAID_LEAVE' | 'MATERNITY_LEAVE' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'APPROVED_MODIFIED' | 'REJECTED' | 'CANCELLED';

export interface WorkScheduleRecord {
  id: string;
  userId: string;
  date: string; // Format: YYYY-MM-DD
  workType: WorkLocationType;
  shift: WorkShift;
  note?: string;
  createdById?: string;
  createdByName?: string;
  updatedAt?: string;
}

export interface LeaveRequestRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  departmentName?: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  shift: WorkShift;
  reason: string;
  status: LeaveStatus;
  handoverPlan?: string;
  approverId?: string;
  approverName?: string;
  responseNote?: string;
  approvedStartDate?: string;
  approvedEndDate?: string;
  createdAt: string;
}

interface ScheduleStoreState {
  workSchedules: WorkScheduleRecord[];
  leaveRequests: LeaveRequestRecord[];

  // 📍 Hàm lấy trạng thái vị trí làm việc của một User tại một ngày bất kỳ
  getWorkLocationForDate: (userId: string, dateStr: string) => {
    workType: WorkLocationType;
    source: 'LEAVE_REQUEST' | 'SCHEDULE' | 'MANUAL_OVERRIDE' | 'DEFAULT';
    note?: string;
  };

  // 👑 Admin hoặc User tự cập nhật vị trí làm việc trong ngày
  setUserDailyWorkLocation: (
    userId: string,
    workType: WorkLocationType,
    dateStr?: string,
    adminInfo?: { adminId: string; adminName: string }
  ) => void;

  // 📝 Quản lý Đơn xin nghỉ / WFH
  addLeaveRequest: (request: Omit<LeaveRequestRecord, 'id' | 'createdAt' | 'status'>) => void;
  reviewLeaveRequest: (
    requestId: string,
    status: 'APPROVED' | 'APPROVED_MODIFIED' | 'REJECTED',
    approverId: string,
    approverName: string,
    responseNote?: string,
    modifiedDates?: { startDate: string; endDate: string }
  ) => void;

  // 📅 Lấy thống kê quân số trong ngày
  getDailyAttendanceStats: (dateStr: string) => {
    office: number;
    wfh: number;
    onSite: number;
    leave: number;
    total: number;
  };
}

const formatDateToKey = (date?: Date | string): string => {
  if (!date) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getInitialSchedules = (): WorkScheduleRecord[] => {
  try {
    const raw = localStorage.getItem('solaris_work_schedules');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getInitialLeaveRequests = (): LeaveRequestRecord[] => {
  try {
    const raw = localStorage.getItem('solaris_leave_requests');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useScheduleStore = create<ScheduleStoreState>((set, get) => ({
  workSchedules: getInitialSchedules(),
  leaveRequests: getInitialLeaveRequests(),

  getWorkLocationForDate: (userId: string, dateStr: string) => {
    const state = get();
    const targetDateKey = dateStr.split('T')[0];

    // 1. Kiểm tra xem có Đơn xin phép APPROVED bao phủ ngày này không
    const matchingApprovedLeave = state.leaveRequests.find((req) => {
      if (req.userId !== userId) return false;
      if (req.status !== 'APPROVED' && req.status !== 'APPROVED_MODIFIED') return false;

      const effectiveStart = req.approvedStartDate || req.startDate;
      const effectiveEnd = req.approvedEndDate || req.endDate;

      return targetDateKey >= effectiveStart && targetDateKey <= effectiveEnd;
    });

    if (matchingApprovedLeave) {
      return {
        workType: matchingApprovedLeave.type === 'WFH' ? 'WFH' : 'LEAVE',
        source: 'LEAVE_REQUEST',
        note: matchingApprovedLeave.reason,
      };
    }

    // 2. Kiểm tra bản ghi WorkSchedule chính thức
    const matchingSchedule = state.workSchedules.find(
      (s) => s.userId === userId && s.date === targetDateKey
    );

    if (matchingSchedule) {
      return {
        workType: matchingSchedule.workType,
        source: 'SCHEDULE',
        note: matchingSchedule.note,
      };
    }

    // 3. Kiểm tra override nhanh từ localStorage cho User hôm nay
    const todayKey = formatDateToKey();
    if (targetDateKey === todayKey) {
      const storedOverride = localStorage.getItem(`solaris_user_work_location_${userId}`);
      if (storedOverride) {
        return {
          workType: storedOverride as WorkLocationType,
          source: 'MANUAL_OVERRIDE',
        };
      }
    }

    // 4. Mặc định tại Văn Phòng
    return {
      workType: 'OFFICE',
      source: 'DEFAULT',
    };
  },

  setUserDailyWorkLocation: (userId, workType, dateStr, adminInfo) => {
    const targetDateKey = dateStr ? dateStr.split('T')[0] : formatDateToKey();

    set((state) => {
      const existingIdx = state.workSchedules.findIndex(
        (s) => s.userId === userId && s.date === targetDateKey
      );

      let updatedSchedules: WorkScheduleRecord[];
      if (existingIdx >= 0) {
        updatedSchedules = state.workSchedules.map((s, idx) =>
          idx === existingIdx
            ? {
                ...s,
                workType,
                note: adminInfo ? `Được chỉ định bởi Admin ${adminInfo.adminName}` : 'Cập nhật trực tiếp',
                createdById: adminInfo?.adminId || s.createdById,
                createdByName: adminInfo?.adminName || s.createdByName,
                updatedAt: new Date().toISOString(),
              }
            : s
        );
      } else {
        const newRecord: WorkScheduleRecord = {
          id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId,
          date: targetDateKey,
          workType,
          shift: 'FULL_DAY',
          note: adminInfo ? `Được chỉ định bởi Admin ${adminInfo.adminName}` : 'Cập nhật trực tiếp',
          createdById: adminInfo?.adminId,
          createdByName: adminInfo?.adminName,
          updatedAt: new Date().toISOString(),
        };
        updatedSchedules = [newRecord, ...state.workSchedules];
      }

      // Lưu LocalStorage đồng bộ
      try {
        localStorage.setItem('solaris_work_schedules', JSON.stringify(updatedSchedules));
        localStorage.setItem(`solaris_user_work_location_${userId}`, workType);
      } catch (err) {
        console.error('Lỗi lưu schedule storage:', err);
      }

      return { workSchedules: updatedSchedules };
    });
  },

  addLeaveRequest: (reqData) => {
    const newReq: LeaveRequestRecord = {
      ...reqData,
      id: `lr-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const updated = [newReq, ...state.leaveRequests];
      try {
        localStorage.setItem('solaris_leave_requests', JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi lưu leave request storage:', err);
      }
      return { leaveRequests: updated };
    });
  },

  reviewLeaveRequest: (requestId, status, approverId, approverName, responseNote, modifiedDates) => {
    set((state) => {
      const targetReq = state.leaveRequests.find((r) => r.id === requestId);
      if (!targetReq) return state;

      const updatedRequests = state.leaveRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              approverId,
              approverName,
              responseNote,
              approvedStartDate: modifiedDates?.startDate || r.startDate,
              approvedEndDate: modifiedDates?.endDate || r.endDate,
            }
          : r
      );

      // Nếu APPROVE -> Tự động sinh lịch làm việc tương ứng
      let updatedSchedules = [...state.workSchedules];
      if (status === 'APPROVED' || status === 'APPROVED_MODIFIED') {
        const start = new Date(modifiedDates?.startDate || targetReq.startDate);
        const end = new Date(modifiedDates?.endDate || targetReq.endDate);
        const workType: WorkLocationType = targetReq.type === 'WFH' ? 'WFH' : 'LEAVE';

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateKey = formatDateToKey(d);
          const existingIdx = updatedSchedules.findIndex(
            (s) => s.userId === targetReq.userId && s.date === dateKey
          );

          if (existingIdx >= 0) {
            updatedSchedules[existingIdx] = {
              ...updatedSchedules[existingIdx],
              workType,
              note: `Đơn đã duyệt: ${targetReq.reason}`,
              updatedAt: new Date().toISOString(),
            };
          } else {
            updatedSchedules.push({
              id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              userId: targetReq.userId,
              date: dateKey,
              workType,
              shift: targetReq.shift || 'FULL_DAY',
              note: `Đơn đã duyệt: ${targetReq.reason}`,
              createdById: approverId,
              createdByName: approverName,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      try {
        localStorage.setItem('solaris_leave_requests', JSON.stringify(updatedRequests));
        localStorage.setItem('solaris_work_schedules', JSON.stringify(updatedSchedules));
      } catch (err) {
        console.error('Lỗi cập nhật reviewed leave request:', err);
      }

      return {
        leaveRequests: updatedRequests,
        workSchedules: updatedSchedules,
      };
    });
  },

  getDailyAttendanceStats: (dateStr) => {
    const state = get();
    const targetDateKey = dateStr.split('T')[0];

    const records = state.workSchedules.filter((s) => s.date === targetDateKey);
    let office = 0;
    let wfh = 0;
    let onSite = 0;
    let leave = 0;

    records.forEach((r) => {
      if (r.workType === 'WFH') wfh++;
      else if (r.workType === 'ON_SITE') onSite++;
      else if (r.workType === 'LEAVE') leave++;
      else office++;
    });

    return {
      office,
      wfh,
      onSite,
      leave,
      total: records.length,
    };
  },
}));
