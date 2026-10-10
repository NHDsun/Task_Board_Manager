/**
 * 🎯 VOICE ASSISTANT PATTERN - TYPES & CONTRACTS
 * Định nghĩa rõ ràng các ràng buộc dữ liệu (Constraints) và Interface của Hook & Presenter.
 * Đáp ứng yêu cầu: "Tách ra hook state (ghi rõ ra có gì)", "Hiểu cơ chế và ràng buộc".
 */

export type PriorityLevel = 'LOW' | 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface ParsedTaskData {
  title: string;
  description: string | null;
  priority: PriorityLevel;
  projectId: string;
  projectName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  dueDate: string | null;
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  profession: string;
}

export interface VoiceParseResponse {
  rawAudioText: string;
  parsedData: ParsedTaskData;
  projects: ProjectOption[];
  users: UserOption[];
}

/**
 * 📋 1. STATE CONTRACT: Ghi rõ danh sách các State do Hook quản lý
 */
export interface UseVoiceAssistantState {
  /** Cờ trạng thái đang thu âm giọng nói */
  isRecording: boolean;
  /** Cờ trạng thái đang gửi API và chờ AI xử lý */
  isSubmitting: boolean;
  /** Thông điệp hiển thị tiến trình (VD: "Groq AI đang bóc tách...") */
  submittingStatus: string;
  /** Dữ liệu xem trước đã được AI bóc tách */
  previewData: VoiceParseResponse | null;
  /** Thông báo lỗi nếu API gặp sự cố */
  apiError: string | null;
  /** Văn bản nhập tay (dự phòng khi môi trường ồn ào) */
  manualText: string;
  /** Cường độ âm lượng micro hiện tại (0 - 100) để vẽ sóng âm */
  audioVolume: number;
  /** Thời lượng thu âm tính theo giây */
  recordingDuration: number;
}

/**
 * ⚡ 2. ACTIONS CONTRACT: Ghi rõ các hàm / sự kiện xử lý (Handlers)
 */
export interface UseVoiceAssistantActions {
  /** Bắt đầu thu âm micro */
  startRecording: () => void;
  /** Dừng thu âm và tự động gửi file âm thanh lên backend */
  stopRecording: () => void;
  /** Hủy bỏ lượt thu âm hiện tại */
  cancelRecording: () => void;
  /** Cập nhật văn bản gõ tay dự phòng */
  setManualText: (text: string) => void;
  /** Gửi khẩu lệnh văn bản thủ công */
  submitManualText: (text: string) => Promise<void>;
  /** Xác nhận tạo task từ dữ liệu xem trước */
  confirmCreateTask: (formData: ParsedTaskData) => Promise<boolean>;
  /** Xóa toàn bộ trạng thái về ban đầu */
  resetState: () => void;
}

/**
 * 📦 3. HOOK RETURN CONTRACT: Tổng hợp những gì Custom Hook trả ra cho UI
 */
export type UseVoiceAssistantReturn = UseVoiceAssistantState & UseVoiceAssistantActions;

/**
 * 🎨 4. PRESENTER PROPS CONTRACT: Ràng buộc Props của UI Component
 */
export interface VoiceAssistantPresenterProps {
  isOpen: boolean;
  onClose: () => void;
  state: UseVoiceAssistantState;
  actions: UseVoiceAssistantActions;
  currentProjectId?: string;
  onTaskCreatedSuccess?: () => void;
}
