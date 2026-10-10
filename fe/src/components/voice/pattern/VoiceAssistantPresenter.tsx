import React, { useState, useEffect } from 'react';
import { Mic, MicOff, SendHorizontal, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import type { VoiceAssistantPresenterProps, ParsedTaskData } from './voiceAssistant.types';
import { Button, Badge, Card, Input, Modal } from '../../base';
import { AudioWaveVisualizer } from '../AudioWaveVisualizer';

/**
 * 🎨 PRESENTER COMPONENT: Chỉ chịu trách nhiệm hiển thị giao diện (Pure UI / Presenter)
 * Được ráp lại từ các Base Component nhỏ: Modal, Card, Button, Badge, Input.
 * Không gọi trực tiếp API hay quản lý side-effect nặng.
 * Đáp ứng yêu cầu: "Build base ráp component từ nhỏ đến lớn", "Tách riêng UI với hook".
 */
export const VoiceAssistantPresenter: React.FC<VoiceAssistantPresenterProps> = ({
  isOpen,
  onClose,
  state,
  actions,
  currentProjectId,
  onTaskCreatedSuccess,
}) => {
  const {
    isRecording,
    isSubmitting,
    submittingStatus,
    previewData,
    apiError,
    manualText,
    audioVolume,
    recordingDuration,
  } = state;

  const {
    startRecording,
    stopRecording,
    setManualText,
    submitManualText,
    confirmCreateTask,
    resetState,
  } = actions;

  // Local Form state for Preview editing before confirmation
  const [formData, setFormData] = useState<ParsedTaskData>({
    title: '',
    description: '',
    priority: 'NORMAL',
    projectId: currentProjectId || '',
    projectName: '',
    assigneeId: '',
    assigneeName: '',
    assigneeEmail: '',
    dueDate: '',
  });

  // Khi có dữ liệu preview mới từ AI, đồng bộ vào form xem trước
  useEffect(() => {
    if (previewData?.parsedData) {
      setFormData(previewData.parsedData);
    }
  }, [previewData]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirm = async () => {
    const success = await confirmCreateTask(formData);
    if (success) {
      onTaskCreatedSuccess?.();
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <span className="text-base font-bold text-white tracking-wide">Trợ Lý Giọng Nói AI</span>
            <span className="block text-[11px] font-mono text-slate-400 font-normal">
              Bóc tách khẩu lệnh tự động • Whisper & LLaMA 3.3
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 1. Trạng thái Lỗi (nếu có) */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            <span>{apiError}</span>
          </div>
        )}

        {/* 2. KHU VỰC THU ÂM (Audio Recording Area) */}
        {!previewData && (
          <Card variant="glass" padding="md" className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              {/* Nút micro trung tâm */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSubmitting}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 ring-4 ring-amber-500/10'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            {/* Trạng thái thu âm & Sóng âm */}
            {isRecording ? (
              <div className="space-y-2 w-full max-w-xs">
                <Badge variant="danger" dot>
                  ĐANG THU ÂM • {recordingDuration}s
                </Badge>
                <div className="h-10 w-full flex items-center justify-center">
                  <AudioWaveVisualizer volume={audioVolume} isListening={isRecording} />
                </div>
                <p className="text-xs text-slate-400">Nói câu lệnh và bấm nút để hoàn tất</p>
              </div>
            ) : isSubmitting ? (
              <div className="space-y-2">
                <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
                <p className="text-xs font-medium text-amber-400">{submittingStatus}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Bấm để nói câu lệnh tạo việc</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Ví dụ: <span className="italic text-slate-300">"Tạo task fix bug API Authentication cho Nam deadline ngày mai mức độ khẩn cấp"</span>
                </p>
              </div>
            )}

            {/* Ô nhập tay dự phòng (Text Fallback) */}
            <div className="w-full pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Input
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitManualText(manualText)}
                  placeholder="Hoặc gõ câu lệnh vào đây nếu môi trường ồn ào..."
                  disabled={isRecording || isSubmitting}
                />
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => submitManualText(manualText)}
                  disabled={!manualText.trim() || isSubmitting}
                >
                  <SendHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 3. KHU VỰC XEM TRƯỚC & XÁC NHẬN (Interactive Preview Drawer) */}
        {previewData && (
          <Card variant="default" padding="md" className="space-y-4 border-amber-500/30">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Đã Trích Xuất Xong (Kiểm Tra Trước Khi Lưu)
                </span>
              </div>
              <Badge variant="warning">{formData.priority}</Badge>
            </div>

            {/* Transcript thô */}
            <div className="p-3 rounded-xl bg-slate-950 text-xs font-mono text-slate-300 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Khẩu lệnh đã nghe:</span>
              "{previewData.rawAudioText}"
            </div>

            {/* Form chỉnh sửa nhanh */}
            <div className="grid grid-cols-1 gap-3">
              <Input
                label="Tiêu Đề Task"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Hạn Chót (Due Date)"
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide mb-1.5">
                    Độ Ưu Tiên
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="LOW">Thấp (Low)</option>
                    <option value="NORMAL">Bình thường (Normal)</option>
                    <option value="IMPORTANT">Quan trọng (Important)</option>
                    <option value="URGENT">Khẩn cấp (Urgent)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={resetState}>
                Thử Lại Câu Khác
              </Button>
              <Button variant="corona" isLoading={isSubmitting} onClick={handleConfirm}>
                Xác Nhận Tạo Task
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};
