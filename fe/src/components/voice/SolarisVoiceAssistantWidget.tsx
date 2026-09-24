import React, { useEffect, useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  User,
  FolderKanban,
  RotateCcw,
  Flag,
  PenLine,
  Languages,
  Keyboard,
} from 'lucide-react';
import { useVoiceRecognition, type VoiceLanguageMode } from '../../hooks/useVoiceRecognition';
import { AudioWaveVisualizer } from './AudioWaveVisualizer';
import { audioChimes } from '../../utils/audioChimes';
import { api } from '../../services/api';
import axios, { AxiosError } from 'axios';

interface SolarisVoiceAssistantWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (commandText: string) => void;
}

interface ParsedTaskData {
  title?: string;
  description?: string | null;
  priority?: string;
  projectName?: string | null;
  assigneeEmail?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
}

interface CreatedTaskModel {
  id: string;
  title: string;
  description?: string | null;
  priority?: string;
  dueDate?: string | null;
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

interface CreatedVoiceTaskResponse {
  success: boolean;
  message: string;
  task: CreatedTaskModel;
  parsedData: ParsedTaskData;
}

export const SolarisVoiceAssistantWidget: React.FC<SolarisVoiceAssistantWidgetProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    audioVolume,
    isSupported,
    languageMode,
    error: micError,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
    setLanguageMode,
  } = useVoiceRecognition();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<CreatedVoiceTaskResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      setCreatedResult(null);
      setApiError(null);
      startListening();
    } else {
      stopListening();
      setIsSubmitting(false);
      setCreatedResult(null);
      setApiError(null);
    }
  }, [isOpen]);

  // Keyboard Shortcuts (Space to toggle, Enter to submit, Esc to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Enter hoặc Ctrl+Enter khi đang không submit
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || document.activeElement !== textareaRef.current)) {
        e.preventDefault();
        handleSendAction();
        return;
      }

      // Space để toggle Mic khi không gõ trong ô textarea
      if (e.code === 'Space' && document.activeElement !== textareaRef.current && !isSubmitting && !createdResult) {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isListening, isSubmitting, createdResult, transcript, interimTranscript]);

  const handleSendAction = async (customText?: string) => {
    const fullText = (customText || transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (!fullText || isSubmitting) return;

    stopListening();
    setIsSubmitting(true);
    setApiError(null);
    setCreatedResult(null);

    try {
      const response = await api.post<CreatedVoiceTaskResponse>('/tasks/voice/create', {
        rawAudioText: fullText,
      });

      const data = response.data;
      setCreatedResult(data);
      audioChimes.playSuccessChime();

      if (onExecuteCommand) {
        onExecuteCommand(fullText);
      }
    } catch (error: unknown) {
      audioChimes.playErrorChime();
      console.error('Lỗi khi gửi khẩu lệnh giọng nói lên backend:', error);
      let serverMessage =
        'Đã xảy ra lỗi khi kết nối AI Groq Voice. Vui lòng kiểm tra lại cấu hình GROQ_API_KEY ở Backend.';

      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string | string[] }>;
        const msg = axiosErr.response?.data?.message;
        if (msg) {
          serverMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        } else if (axiosErr.message) {
          serverMessage = axiosErr.message;
        }
      } else if (error instanceof Error) {
        serverMessage = error.message;
      }

      setApiError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndRecordAgain = () => {
    setCreatedResult(null);
    setApiError(null);
    resetTranscript();
    startListening();
  };

  const handleSampleClick = (sampleText: string) => {
    const cleanSample = sampleText.replace(/^🎙️\s*"?|"?$/g, '').trim();
    setManualTranscript(cleanSample);
    handleSendAction(cleanSample);
  };

  if (!isOpen) return null;

  const currentRawText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();

  const getPriorityBadgeColor = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'IMPORTANT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'LOW':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col solar-glass-card rounded-3xl bg-[#0F172A]/95 border-2 border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.3)] relative overflow-hidden animate-solar-warp-in">
        {/* Background Ambient Aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* 🔝 Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 pb-3 relative z-10 shrink-0 bg-[#0F172A]/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                Trợ Lý Giọng Nói Solaris Song Ngữ AI
              </h2>
              <p className="text-[11px] text-slate-400">
                {isSubmitting ? (
                  <span className="text-purple-400 font-bold animate-pulse flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Solaris AI & Groq đang xử lý dữ liệu...
                  </span>
                ) : createdResult ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã tạo công việc thành công!
                  </span>
                ) : isListening ? (
                  <span className="text-amber-400 font-bold animate-pulse">● Đang lắng nghe giọng nói...</span>
                ) : (
                  <span>Sẵn sàng tiếp nhận khẩu lệnh</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📜 Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 relative z-10 custom-scrollbar">
          {/* 🌐 Language Switcher Toolbar */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 pl-1">
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>Chế độ Ngôn ngữ:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguageMode('bilingual')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  languageMode === 'bilingual'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                🌐 Song Ngữ (Vi-En)
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('vi-VN')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  languageMode === 'vi-VN'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('en-US')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  languageMode === 'en-US'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* Warning if browser not supported */}
          {!isSupported && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Trình duyệt hiện tại chưa hỗ trợ Web Speech API. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge.</span>
            </div>
          )}

          {/* Microphone / Network Error message */}
          {micError && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Thông Báo Nhận Diện Giọng Nói</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed text-[11px]">{micError}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={startListening}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <RotateCcw className="w-3 h-3" /> Thử Kết Nối Lại Micro
                </button>
                <span className="text-[10px] text-slate-400">hoặc gõ trực tiếp bên dưới</span>
              </div>
            </div>
          )}

          {/* Backend API Error */}
          {apiError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Không thể tạo công việc từ khẩu lệnh</span>
              </div>
              <p className="text-rose-200/90 leading-relaxed">{apiError}</p>
              <button
                type="button"
                onClick={() => handleSendAction()}
                className="mt-1 px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Thử lại câu lệnh này
              </button>
            </div>
          )}

          {/* 🌟 Result Card After Creation */}
          {createdResult ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#132338] to-[#0d1829] border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] space-y-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Nhiệm Vụ Đã Được Tạo Tự Động
                  </span>
                </div>
                {createdResult.task?.priority && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${getPriorityBadgeColor(
                      createdResult.task.priority
                    )}`}
                  >
                    <Flag className="w-3 h-3" />
                    {createdResult.task.priority}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold text-slate-400">Tiêu đề:</div>
                <div className="text-sm font-bold text-white leading-snug">
                  {createdResult.task?.title || createdResult.parsedData?.title}
                </div>
                {createdResult.task?.description && (
                  <p className="text-xs text-slate-300 mt-1">{createdResult.task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400">Dự án</div>
                    <div className="text-white font-semibold truncate">
                      {createdResult.task?.project?.name || createdResult.parsedData?.projectName || 'Dự án mặc định'}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400">Giao cho</div>
                    <div className="text-white font-semibold truncate">
                      {createdResult.task?.assignee?.fullName ||
                        createdResult.task?.assignee?.email ||
                        createdResult.parsedData?.assigneeEmail ||
                        'Chính bạn'}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400">Hạn chót</div>
                    <div className="text-white font-semibold truncate">
                      {createdResult.task?.dueDate
                        ? new Date(createdResult.task.dueDate).toLocaleDateString('vi-VN')
                        : createdResult.parsedData?.dueDate || 'Không thời hạn'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 🎙️ Visualizer Wave Section */}
              <AudioWaveVisualizer isListening={isListening && !isSubmitting} volume={audioVolume} />

              {/* 📝 Live Speech-to-Text & Editable Transcript Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 focus-within:border-amber-500/50 space-y-1.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <PenLine className="w-3 h-3 text-amber-400" />
                    Khẩu lệnh nhận diện (Có thể gõ/chỉnh sửa trực tiếp):
                  </span>
                  {isListening && (
                    <span className="text-[10px] text-amber-400 font-bold animate-pulse">● Đang nghe</span>
                  )}
                </div>

                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '')}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  placeholder={
                    languageMode === 'en-US'
                      ? "Say or type: 'Create QA testing task for Alex urgent deadline tomorrow'..."
                      : "Hãy nói hoặc gõ: 'Tạo task Fix bug login cho Nam mức độ khẩn cấp deadline ngày mai'..."
                  }
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none resize-none leading-relaxed font-medium"
                />

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono border-t border-slate-900">
                  <span className="flex items-center gap-1">
                    <Keyboard className="w-3 h-3 text-slate-400" /> Phím tắt: [Space] Bật/Tắt Mic | [Enter] Gửi lệnh | [Esc] Thoát
                  </span>
                  <span>{currentRawText.length} ký tự</span>
                </div>
              </div>

              {/* Quick Sample Voice Command Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-amber-400" /> Mẫu câu lệnh gợi ý (Click để tạo ngay):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                  {[
                    '🎙️ Tạo task Fix bug API Authentication cho Nam mức độ khẩn cấp deadline ngày mai',
                    '🎙️ Tạo task Thiết kế Banner Marketing cho Nam',
                    '🎙️ Create QA testing and deploy task for Alex urgent tomorrow',
                    '🎙️ Tạo task Tối ưu hiệu năng Database mức độ quan trọng',
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSampleClick(sample)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-left cursor-pointer transition-all disabled:opacity-50"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 🔻 Sticky Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 sm:p-5 pt-3 relative z-10 shrink-0 bg-[#0F172A]/90 backdrop-blur-sm">
          {createdResult ? (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handleResetAndRecordAgain}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Tạo Nhiệm Vụ Khác
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn Tất
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={resetTranscript}
                disabled={isSubmitting || !currentRawText}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Xóa Lời Nói
              </button>

              <div className="flex items-center gap-2.5">
                {isListening ? (
                  <button
                    type="button"
                    onClick={stopListening}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <MicOff className="w-3.5 h-3.5 text-rose-400" /> Tạm Dừng Nghe
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Mic className="w-3.5 h-3.5" /> Tiếp Tục Nói
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSendAction()}
                  disabled={!currentRawText || isSubmitting}
                  className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Groq AI Đang Xử Lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      Thực Thi Khẩu Lệnh
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
