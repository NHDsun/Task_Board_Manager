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

export interface WorkLocationInfo {
  workType: WorkLocationType;
  shift?: WorkShift;
  shiftLabel?: string;
  source: 'LEAVE_REQUEST' | 'SCHEDULE' | 'MANUAL_OVERRIDE' | 'DEFAULT';
  sourceTitle: string;
  approverName?: string;
  note?: string;
}

export const getShiftLabel = (shift?: WorkShift): string => {
  switch (shift) {
    case 'MORNING':
      return 'Buổi Sáng (0.5 ngày)';
    case 'AFTERNOON':
      return 'Buổi Chiều (0.5 ngày)';
    case 'FULL_DAY':
    default:
      return 'Cả Ngày';
  }
};

export const getShiftShortLabel = (shift?: WorkShift): string => {
  switch (shift) {
    case 'MORNING':
      return 'Sáng';
    case 'AFTERNOON':
      return 'Chiều';
    case 'FULL_DAY':
    default:
      return 'Cả ngày';
  }
};

interface ScheduleStoreState {
  workSchedules: WorkScheduleRecord[];
  leaveRequests: LeaveRequestRecord[];

  // 📍 Hàm lấy trạng thái vị trí làm việc của một User tại một ngày bất kỳ (Lịch là nguồn sự thật)
  getWorkLocationForDate: (userId: string, dateStr: string) => WorkLocationInfo;

  // 👑 Admin hoặc User tự cập nhật vị trí làm việc trong ngày
  setUserDailyWorkLocation: (
    userId: string,
    workType: WorkLocationType,
    dateStr?: string,
    adminInfo?: { adminId: string; adminName: string }
  ) => void;

  // 📝 Quản lý Đơn xin nghỉ / WFH
  addLeaveRequest: (request: Omit<LeaveRequestRecord, 'id' | 'createdAt' | 'status'>) => void;
  cancelLeaveRequest: (requestId: string, userId: string) => void;
  reviewLeaveRequest: (
    requestId: string,
    status: 'APPROVED' | 'APPROVED_MODIFIED' | 'REJECTED',
    approverId: string,
    approverName: string,
    responseNote?: string,
    modifiedDates?: { startDate: string; endDate: string },
    modifiedShift?: WorkShift
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

  getWorkLocationForDate: (userId: string, dateStr: string): WorkLocationInfo => {
    const state = get();
    const targetDateKey = dateStr.split('T')[0];

    // 1. 🌟 NGUỒN ƯU TIÊN 1: Đơn xin WFH / Nghỉ phép đã được Admin Duyệt
    const matchingApprovedLeave = state.leaveRequests.find((req) => {
      if (req.userId !== userId) return false;
      if (req.status !== 'APPROVED' && req.status !== 'APPROVED_MODIFIED') return false;

      const effectiveStart = req.approvedStartDate || req.startDate;
      const effectiveEnd = req.approvedEndDate || req.endDate;

      return targetDateKey >= effectiveStart && targetDateKey <= effectiveEnd;
    });

    if (matchingApprovedLeave) {
      const shiftShort = matchingApprovedLeave.shift && matchingApprovedLeave.shift !== 'FULL_DAY'
        ? ` (${getShiftShortLabel(matchingApprovedLeave.shift)})`
        : '';
      return {
        workType: matchingApprovedLeave.type === 'WFH' ? 'WFH' : 'LEAVE',
        shift: matchingApprovedLeave.shift,
        shiftLabel: getShiftLabel(matchingApprovedLeave.shift),
        source: 'LEAVE_REQUEST',
        sourceTitle: `${matchingApprovedLeave.type === 'WFH' ? 'Đã Duyệt WFH' : 'Đã Duyệt Phép'}${shiftShort}`,
        approverName: matchingApprovedLeave.approverName || 'Quản lý',
        note: matchingApprovedLeave.reason,
      };
    }

    // 2. 🌟 NGUỒN ƯU TIÊN 2: Bản ghi Lịch Làm Việc chính thức (Admin Xếp hoặc Điều chỉnh Lịch)
    const matchingSchedule = state.workSchedules.find(
      (s) => s.userId === userId && s.date === targetDateKey
    );

    if (matchingSchedule) {
      const shiftShort = matchingSchedule.shift && matchingSchedule.shift !== 'FULL_DAY'
        ? ` (${getShiftShortLabel(matchingSchedule.shift)})`
        : '';
      return {
        workType: matchingSchedule.workType,
        shift: matchingSchedule.shift,
        shiftLabel: getShiftLabel(matchingSchedule.shift),
        source: 'SCHEDULE',
        sourceTitle: matchingSchedule.createdByName
          ? `Lịch do ${matchingSchedule.createdByName} xếp${shiftShort}`
          : `Lịch Làm Việc${shiftShort}`,
        approverName: matchingSchedule.createdByName,
        note: matchingSchedule.note,
      };
    }

    // 3. 🌟 NGUỒN MẶC ĐỊNH: Làm việc tại Văn Phòng
    return {
      workType: 'OFFICE',
      shift: 'FULL_DAY',
      shiftLabel: 'Cả Ngày',
      source: 'DEFAULT',
      sourceTitle: 'Tại Văn Phòng',
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
    const state = get();
    // 🔒 [LC-114] CHẶN TRÙNG LẶP ĐƠN NGHỈ PHÉP / WFH TRONG KHOẢNG THỜI GIAN ĐÃ CÓ ĐƠN ĐANG CHỜ DUYỆT HOẶC ĐÃ DUYỆT
    const hasOverlap = state.leaveRequests.some((existing) => {
      if (existing.userId !== reqData.userId) return false;
      if (existing.status === 'REJECTED' || existing.status === 'CANCELLED') return false;

      const existingStart = existing.approvedStartDate || existing.startDate;
      const existingEnd = existing.approvedEndDate || existing.endDate;

      // Overlap condition: max(start1, start2) <= min(end1, end2)
      return reqData.startDate <= existingEnd && reqData.endDate >= existingStart;
    });

    if (hasOverlap) {
      throw new Error('Bạn đã có đơn xin nghỉ / WFH (đang chờ duyệt hoặc đã duyệt) trong khoảng thời gian này!');
    }

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

  cancelLeaveRequest: (requestId: string, userId: string) => {
    set((state) => {
      const targetReq = state.leaveRequests.find((r) => r.id === requestId);
      if (!targetReq) return state;

      // Chỉ chủ đơn hoặc Admin mới có quyền hủy
      if (targetReq.userId !== userId) {
        return state;
      }

      const updatedRequests = state.leaveRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'CANCELLED' as const } : r
      );

      // Nếu đơn trước đó đã duyệt -> Xóa hoặc khôi phục các bản ghi lịch làm việc đã sinh
      let updatedSchedules = [...state.workSchedules];
      if (targetReq.status === 'APPROVED' || targetReq.status === 'APPROVED_MODIFIED') {
        const start = targetReq.approvedStartDate || targetReq.startDate;
        const end = targetReq.approvedEndDate || targetReq.endDate;

        updatedSchedules = updatedSchedules.filter((s) => {
          if (s.userId !== targetReq.userId) return true;
          return !(s.date >= start && s.date <= end && s.note?.includes(targetReq.reason));
        });
      }

      try {
        localStorage.setItem('solaris_leave_requests', JSON.stringify(updatedRequests));
        localStorage.setItem('solaris_work_schedules', JSON.stringify(updatedSchedules));
      } catch (err) {
        console.error('Lỗi lưu cancel leave request storage:', err);
      }

      return {
        leaveRequests: updatedRequests,
        workSchedules: updatedSchedules,
      };
    });
  },

  reviewLeaveRequest: (
    requestId,
    status,
    approverId,
    approverName,
    responseNote,
    modifiedDates,
    modifiedShift
  ) => {
    set((state) => {
      const targetReq = state.leaveRequests.find((r) => r.id === requestId);
      if (!targetReq) return state;

      // 🔒 [LC-170] KHÓA TỰ PHÊ DUYỆT ĐƠN NGHỈ PHÉP & KHÓA ĐƠN ĐÃ CÓ KẾT QUẢ
      if (targetReq.userId === approverId) {
        console.warn('Không thể tự phê duyệt đơn xin nghỉ/WFH của chính mình!');
        return state;
      }
      if (targetReq.status !== 'PENDING') {
        console.warn('Đơn này đã được xử lý trước đó và không còn ở trạng thái chờ duyệt.');
        return state;
      }

      const effectiveShift = modifiedShift || targetReq.shift || 'FULL_DAY';

      const updatedRequests = state.leaveRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              shift: effectiveShift,
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
              shift: effectiveShift,
              note: `Đơn đã duyệt: ${targetReq.reason}`,
              updatedAt: new Date().toISOString(),
            };
          } else {
            updatedSchedules.push({
              id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              userId: targetReq.userId,
              date: dateKey,
              workType,
              shift: effectiveShift,
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
