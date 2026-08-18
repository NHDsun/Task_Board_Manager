import React, { useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { AudioWaveVisualizer } from './AudioWaveVisualizer';

interface SolarisVoiceAssistantWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (commandText: string) => void;
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
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const handleSendAction = () => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText) return;
    stopListening();

    if (onExecuteCommand) {
      onExecuteCommand(fullText);
      onClose();
    }
  };

  if (!isOpen) return null;

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
                Trợ Lý Giọng Nói Solaris Voice Command
              </h2>
              <p className="text-[11px] text-slate-400">
                {isListening ? (
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
          {/* Warning if browser not supported */}
          {!isSupported && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Trình duyệt hiện tại chưa hỗ trợ Web Speech API. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge.</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 🎙️ Visualizer Wave Section */}
          <AudioWaveVisualizer isListening={isListening} volume={audioVolume} />

          {/* 📝 Live Speech-to-Text Transcript Subtitle Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1 min-h-[72px] flex flex-col justify-center text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
              Phụ Đề Nhận Diện Trực Tiếp (Live Transcript)
            </span>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {transcript && <span className="text-white font-bold">{transcript} </span>}
              {interimTranscript && (
                <span className="text-amber-300 italic animate-pulse">{interimTranscript}</span>
              )}
              {!transcript && !interimTranscript && (
                <span className="text-slate-600 italic text-xs">
                  "Hãy thử nói: 'Tạo task thiết kế UI cho Nam mức độ khẩn cấp'..."
                </span>
              )}
            </p>
          </div>

          {/* Quick Sample Voice Command Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-amber-400" /> Mẫu câu lệnh gợi ý:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                🎙️ "Tạo task Kiểm thử QA mức độ khẩn cấp deadline ngày mai"
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                🎙️ "Tạo task Thiết kế Banner Marketing cho Nam"
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                🎙️ "Tìm kiếm task hệ thống auth"
              </span>
            </div>
          </div>
        </div>

        {/* 🔻 Sticky Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 sm:p-5 pt-3 relative z-10 shrink-0 bg-[#0F172A]/90 backdrop-blur-sm">
          <button
            onClick={resetTranscript}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer"
          >
            Xóa Lời Nói
          </button>

          <div className="flex items-center gap-2.5">
            {isListening ? (
              <button
                onClick={stopListening}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MicOff className="w-3.5 h-3.5 text-rose-400" /> Tạm Dừng Nghe
              </button>
            ) : (
              <button
                onClick={startListening}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Mic className="w-3.5 h-3.5" /> Tiếp Tục Nói
              </button>
            )}

            <button
              onClick={handleSendAction}
              disabled={!transcript.trim() && !interimTranscript.trim()}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Thực Thi Khẩu Lệnh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
