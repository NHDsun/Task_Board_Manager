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

export interface UseVoiceAssistantState {
  isRecording: boolean;
  isSubmitting: boolean;
  submittingStatus: string;
  previewData: VoiceParseResponse | null;
  apiError: string | null;
  manualText: string;
  audioVolume: number;
  recordingDuration: number;
}

export interface UseVoiceAssistantActions {
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  setManualText: (text: string) => void;
  submitManualText: (text: string) => Promise<void>;
  confirmCreateTask: (formData: ParsedTaskData) => Promise<boolean>;
  resetState: () => void;
}

export type UseVoiceAssistantReturn = UseVoiceAssistantState & UseVoiceAssistantActions;

export interface VoiceAssistantPresenterProps {
  isOpen: boolean;
  onClose: () => void;
  state: UseVoiceAssistantState;
  actions: UseVoiceAssistantActions;
  currentProjectId?: string;
  onTaskCreatedSuccess?: () => void;
}
