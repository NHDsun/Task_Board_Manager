import { useState, useCallback } from 'react';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { audioChimes } from '../../../utils/audioChimes';
import { api } from '../../../services/api';
import axios, { AxiosError } from 'axios';
import type {
  UseVoiceAssistantReturn,
  VoiceParseResponse,
  ParsedTaskData,
} from './voiceAssistant.types';

/**
 * 🧠 CUSTOM HOOK: Quản lý toàn bộ State, Lifecycle & Logic gọi API của Voice Assistant
 * Đáp ứng yêu cầu: "Tách ra hook state", "Tách riêng UI với hook".
 */
export const useVoiceAssistantState = (currentProjectId?: string): UseVoiceAssistantReturn => {
  const [manualText, setManualText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState('');
  const [previewData, setPreviewData] = useState<VoiceParseResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  /**
   * Xử lý gửi file âm thanh WebM lên Backend bóc băng & trích xuất
   */
  const handleAudioReady = useCallback(
    async (blob: Blob) => {
      if (!blob || blob.size === 0 || isSubmitting) return;

      setIsSubmitting(true);
      setSubmittingStatus('Groq Whisper đang bóc băng & AI đang trích xuất khẩu lệnh...');
      setApiError(null);
      setPreviewData(null);

      try {
        const formData = new FormData();
        const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
        formData.append('audio', blob, `voice-command.${ext}`);

        const queryParam = currentProjectId ? `?projectId=${encodeURIComponent(currentProjectId)}` : '';
        const response = await api.post<VoiceParseResponse>(`/tasks/voice/parse-audio${queryParam}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const responseData = response.data as unknown as { data?: VoiceParseResponse } | VoiceParseResponse;
        const payload: VoiceParseResponse =
          responseData && typeof responseData === 'object' && 'data' in responseData && responseData.data
            ? responseData.data
            : (responseData as VoiceParseResponse);

        setPreviewData(payload);
        audioChimes.playSuccessChime();
      } catch (error: unknown) {
        audioChimes.playErrorChime();
        let serverMessage = 'Đã xảy ra lỗi khi kết nối Groq AI. Vui lòng kiểm tra lại GROQ_API_KEY ở Backend.';
        if (axios.isAxiosError(error)) {
          const axiosErr = error as AxiosError<{ message?: string | string[]; error?: string }>;
          const msg = axiosErr.response?.data?.message || axiosErr.response?.data?.error;
          if (msg) serverMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        } else if (error instanceof Error) {
          serverMessage = error.message;
        }
        setApiError(serverMessage);
      } finally {
        setIsSubmitting(false);
        setSubmittingStatus('');
      }
    },
    [currentProjectId, isSubmitting]
  );

  const {
    isRecording,
    audioVolume,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    resetAudio,
  } = useAudioRecorder(handleAudioReady);

  /**
   * Xử lý gửi văn bản gõ tay thủ công (Text Fallback)
   */
  const submitManualText = useCallback(
    async (textToSend: string) => {
      const fullText = textToSend.trim();
      if (!fullText || isSubmitting) return;

      cancelRecording();
      setIsSubmitting(true);
      setSubmittingStatus('Groq AI đang phân tích cú pháp câu lệnh...');
      setApiError(null);
      setPreviewData(null);

      try {
        const response = await api.post<VoiceParseResponse>('/tasks/voice/parse-text', {
          rawAudioText: fullText,
          projectId: currentProjectId,
        });

        const responseData = response.data as unknown as { data?: VoiceParseResponse } | VoiceParseResponse;
        const payload: VoiceParseResponse =
          responseData && typeof responseData === 'object' && 'data' in responseData && responseData.data
            ? responseData.data
            : (responseData as VoiceParseResponse);

        setPreviewData(payload);
        audioChimes.playSuccessChime();
      } catch (error: unknown) {
        audioChimes.playErrorChime();
        let serverMessage = 'Đã xảy ra lỗi khi phân tích câu lệnh qua Groq AI.';
        if (axios.isAxiosError(error)) {
          const axiosErr = error as AxiosError<{ message?: string | string[]; error?: string }>;
          const msg = axiosErr.response?.data?.message || axiosErr.response?.data?.error;
          if (msg) serverMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        }
        setApiError(serverMessage);
      } finally {
        setIsSubmitting(false);
        setSubmittingStatus('');
      }
    },
    [cancelRecording, currentProjectId, isSubmitting]
  );

  /**
   * Gọi API xác nhận tạo Task chính thức vào Database
   */
  const confirmCreateTask = useCallback(
    async (formData: ParsedTaskData): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmittingStatus('Đang khởi tạo thẻ việc lên bảng Kanban...');
      setApiError(null);

      try {
        await api.post('/tasks/voice/confirm', {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          projectId: formData.projectId,
          assigneeId: formData.assigneeId || undefined,
          dueDate: formData.dueDate || undefined,
          rawVoice: previewData?.rawAudioText,
        });

        audioChimes.playSuccessChime();
        setPreviewData(null);
        setManualText('');
        return true;
      } catch (error: unknown) {
        audioChimes.playErrorChime();
        setApiError('Lỗi khi lưu thẻ việc vào cơ sở dữ liệu.');
        return false;
      } finally {
        setIsSubmitting(false);
        setSubmittingStatus('');
      }
    },
    [previewData?.rawAudioText]
  );

  const resetState = useCallback(() => {
    cancelRecording();
    resetAudio();
    setPreviewData(null);
    setApiError(null);
    setManualText('');
    setIsSubmitting(false);
    setSubmittingStatus('');
  }, [cancelRecording, resetAudio]);

  return {
    // States
    isRecording,
    isSubmitting,
    submittingStatus,
    previewData,
    apiError,
    manualText,
    audioVolume,
    recordingDuration,

    // Actions
    startRecording,
    stopRecording,
    cancelRecording,
    setManualText,
    submitManualText,
    confirmCreateTask,
    resetState,
  };
};
