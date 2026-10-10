import React from 'react';
import { useVoiceAssistantState } from './useVoiceAssistantState';
import { VoiceAssistantPresenter } from './VoiceAssistantPresenter';

export interface VoiceAssistantContainerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId?: string;
  onTaskCreatedSuccess?: () => void;
}

/**
 * 📦 CONTAINER COMPONENT: Kết nối Custom Hook (Logic) với Presenter (UI)
 * Theo đúng kiến trúc Container - Presenter Pattern.
 */
export const VoiceAssistantContainer: React.FC<VoiceAssistantContainerProps> = ({
  isOpen,
  onClose,
  currentProjectId,
  onTaskCreatedSuccess,
}) => {
  // Lấy toàn bộ state và actions từ hook chuyên biệt
  const voiceAssistant = useVoiceAssistantState(currentProjectId);

  const {
    isRecording,
    isSubmitting,
    submittingStatus,
    previewData,
    apiError,
    manualText,
    audioVolume,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    setManualText,
    submitManualText,
    confirmCreateTask,
    resetState,
  } = voiceAssistant;

  return (
    <VoiceAssistantPresenter
      isOpen={isOpen}
      onClose={onClose}
      currentProjectId={currentProjectId}
      onTaskCreatedSuccess={onTaskCreatedSuccess}
      state={{
        isRecording,
        isSubmitting,
        submittingStatus,
        previewData,
        apiError,
        manualText,
        audioVolume,
        recordingDuration,
      }}
      actions={{
        startRecording,
        stopRecording,
        cancelRecording,
        setManualText,
        submitManualText,
        confirmCreateTask,
        resetState,
      }}
    />
  );
};
