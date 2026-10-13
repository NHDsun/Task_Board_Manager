import React from 'react';
import { MessageSquare, Send } from 'lucide-react';

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
}

interface TaskCommentsSectionProps {
  comments: CommentItem[];
  newComment: string;
  setNewComment: (v: string) => void;
  isSubmittingComment: boolean;
  onAddComment: (e: React.FormEvent) => void;
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  comments,
  newComment,
  setNewComment,
  isSubmittingComment,
  onAddComment,
}) => {
  return (
    <div className="solar-glass-card p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
      <h3 className="font-bold text-white text-sm flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-amber-400" />
        Bình Luận & Lịch Sử Tác Nghiệp ({comments.length})
      </h3>

      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 min-w-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-amber-300 truncate">{c.author}</span>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">{c.createdAt}</span>
            </div>
            <p className="text-slate-200 break-words whitespace-pre-wrap">{c.text}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-slate-500 italic py-2">Chưa có bình luận nào. Hãy trao đổi tiến độ đầu tiên!</p>
        )}
      </div>

      <form onSubmit={onAddComment} className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Nhập bình luận hoặc trao đổi tiến độ..."
          className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
        />
        <button
          type="submit"
          disabled={isSubmittingComment}
          className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <Send className="w-4 h-4" /> {isSubmittingComment ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>
    </div>
  );
};
