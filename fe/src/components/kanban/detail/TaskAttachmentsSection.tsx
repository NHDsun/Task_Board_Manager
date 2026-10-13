import React from 'react';
import {
  Paperclip,
  Upload,
  Link as LinkIcon,
  Plus,
  FileText,
  ExternalLink,
  Download,
  Trash2,
  Lock,
} from 'lucide-react';

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  size?: string;
  createdAt: string;
}

interface TaskAttachmentsSectionProps {
  attachments: AttachmentItem[];
  isMyTask: boolean;
  showAddUrlForm: boolean;
  setShowAddUrlForm: (v: boolean) => void;
  urlTitleInput: string;
  setUrlTitleInput: (v: string) => void;
  urlInput: string;
  setUrlInput: (v: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddUrlAttachment: (e: React.FormEvent) => void;
  onDownloadAttachment: (att: AttachmentItem) => void;
  onRemoveAttachment: (id: string) => void;
}

export const TaskAttachmentsSection: React.FC<TaskAttachmentsSectionProps> = ({
  attachments,
  isMyTask,
  showAddUrlForm,
  setShowAddUrlForm,
  urlTitleInput,
  setUrlTitleInput,
  urlInput,
  setUrlInput,
  onFileUpload,
  onAddUrlAttachment,
  onDownloadAttachment,
  onRemoveAttachment,
}) => {
  return (
    <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-sm">Tài Liệu Đính Kèm & Links ({attachments.length})</h3>
        </div>

        {isMyTask ? (
          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Upload Tệp</span>
              <input type="file" onChange={onFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setShowAddUrlForm(!showAddUrlForm)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Chèn URL</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
            <Lock className="w-3 h-3" /> Chỉ chính chủ Task mới có quyền đính kèm tệp/URL
          </span>
        )}
      </div>

      {isMyTask && showAddUrlForm && (
        <form
          onSubmit={onAddUrlAttachment}
          className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-3 animate-fade-in"
        >
          <h4 className="font-bold text-amber-300 text-xs">Chèn Đường Dẫn URL Hoặc Tài Liệu Mẫu</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={urlTitleInput}
              onChange={(e) => setUrlTitleInput(e.target.value)}
              placeholder="Tiêu đề gợi nhớ (VD: Figma Design System)"
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Đường dẫn URL (VD: https://figma.com/file/...)"
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddUrlForm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Liên Kết
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between gap-3 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  att.type === 'file'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {att.type === 'file' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <a
                  href={
                    att.url.startsWith('/uploads/')
                      ? `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '')}${att.url}`
                      : att.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-200 hover:text-amber-400 truncate block transition-colors flex items-center gap-1"
                >
                  <span className="truncate">{att.name}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <span className="text-[10px] text-slate-500 font-mono">
                  {att.size ? `${att.size} • ` : ''}
                  {att.createdAt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onDownloadAttachment(att)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Tải tệp/dữ liệu này về máy"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải Về</span>
              </button>

              {isMyTask && (
                <button
                  onClick={() => onRemoveAttachment(att.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Xóa tệp/URL này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
