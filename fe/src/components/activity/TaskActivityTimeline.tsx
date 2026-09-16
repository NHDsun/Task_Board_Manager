import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Clock, ArrowRight, Activity, Send } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';


interface UserProfile {
  id?: string;
  fullName: string;
  avatar?: string;
  email?: string;
}


interface ActivityItem {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  type?: string;
  user?: UserProfile;
  content?: string;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  type?: string;
  user?: UserProfile;
}

interface TimelineItem extends ActivityItem {
  itemType: 'activity' | 'comment';
}

interface TaskActivityTimelineProps {
  taskId: string;
}

export const TaskActivityTimeline: React.FC<TaskActivityTimelineProps> = ({ taskId }) => {
  const currentUser = useAuthStore((state) => state.user);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'comments' | 'history' | 'worklog'>('comments');
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!taskId) return;
    let isMounted = true;

    const fetchActivitiesAndComments = async () => {
      queueMicrotask(() => {
        if (isMounted) setIsLoading(true);
      });

      try {
        const res = await api.get(`/tasks/${taskId}/activities`);
    
        const responsePayload = res.data as { data?: { data?: ActivityItem[] } | ActivityItem[] };
        const rawData = 
          (typeof responsePayload?.data === 'object' && responsePayload?.data !== null && 'data' in responsePayload.data 
            ? (responsePayload.data as { data: ActivityItem[] }).data 
            : responsePayload?.data) || [];
            
        const items: ActivityItem[] = Array.isArray(rawData) ? rawData : [];

        if (isMounted) {

          const commentList: CommentItem[] = items.filter(
            (item) => Boolean(item.content) || item.type === 'COMMENT'
          ) as CommentItem[];
    
          const historyList: ActivityItem[] = items.filter(
            (item) => !item.content && item.type !== 'COMMENT'
          );

          setActivities(historyList);
          setComments(commentList);
        }
      } catch (err) {
        console.error('Không thể tải dữ liệu activity:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivitiesAndComments();

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  const handleSendComment = async (textToSend?: string): Promise<void> => {
    const contentToSend = textToSend || newComment;
    if (!contentToSend.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: contentToSend });
      setNewComment('');

      const comRes = await api.get(`/tasks/${taskId}/comments`).catch(() => ({ data: [] }));
      const comPayload = comRes.data as { data?: { data?: CommentItem[] } | CommentItem[] };
      const comData = 
        (typeof comPayload?.data === 'object' && comPayload?.data !== null && 'data' in comPayload.data 
          ? (comPayload.data as { data: CommentItem[] }).data 
          : comPayload?.data) || [];
          
      setComments(Array.isArray(comData) ? comData : []);
    } catch (err) {
      console.error('Không thể gửi bình luận:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allItems: TimelineItem[] = [
    ...activities.map((act): TimelineItem => ({ ...act, itemType: 'activity' })),
    ...comments.map((com): TimelineItem => ({ ...com, action: '', itemType: 'comment' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const userInitials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="space-y-4 font-sans">
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-200 tracking-wide">Activity</h3>

        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'comments' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('worklog')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'worklog' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Work log
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Sort by: <strong className="text-slate-300">Newest first</strong>
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 pt-1">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            userInitials
          )}
        </div>
        <div className="flex-1 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-blue-500/80 transition-all p-3 space-y-3 shadow-inner">
          <textarea
            id="jira-comment-input"
            rows={2}
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSendComment();
              }
            }}
          />

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              onClick={() => handleSendComment('Who is working on this...?')}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-all cursor-pointer"
            >
              Who is working on this...?
            </button>
            <button
              onClick={() => handleSendComment('Can I get more info...?')}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-all cursor-pointer"
            >
              Can I get more info...?
            </button>
            <button
              onClick={() => handleSendComment('Status update...')}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-all cursor-pointer"
            >
              Status update...
            </button>

            <button
              disabled={isSubmitting || !newComment.trim()}
              onClick={() => handleSendComment()}
              className="ml-auto px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 font-mono pl-11">
        Pro tip: press{' '}
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">M</span>{' '}
        to comment
      </div>

      <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="text-center py-6 text-xs font-mono text-slate-500 animate-pulse">Đang tải dữ liệu...</div>
        ) : activeTab === 'history' ? (
          activities.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Chưa có lịch sử thay đổi trạng thái nào.
            </div>
          ) : (
            activities.map((item: ActivityItem) => {
              const initials = item.user?.fullName
                ? item.user.fullName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'US';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    {item.user?.avatar ? (
                      <img src={item.user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-100 text-xs">
                        {item.user?.fullName || 'Thành viên'}{' '}
                        <span className="font-normal text-slate-400">changed the</span>{' '}
                        <strong className="text-slate-200">Status</strong>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {(item.oldValue || item.newValue || item.action) && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700/80 shadow-xs">
                          {item.oldValue || 'To Do'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 font-mono text-[11px] border border-blue-500/40 shadow-xs">
                          {item.newValue || item.action}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : activeTab === 'comments' ? (
          comments.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Chưa có bình luận nào. Hãy để lại lời nhắn đầu tiên!
            </div>
          ) : (
            comments.map((com: CommentItem) => (
              <div
                key={com.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                  {com.user?.fullName ? com.user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{com.user?.fullName || 'Thành viên'}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(com.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{com.content}</p>
                </div>
              </div>
            ))
          )
        ) : activeTab === 'all' ? (
          allItems.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Chưa có hoạt động hoặc bình luận nào.
            </div>
          ) : (
            allItems.map((item: TimelineItem) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                  {item.user?.fullName ? item.user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.user?.fullName || 'Thành viên'}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {item.itemType === 'comment' ? (
                    <p className="text-slate-300 leading-relaxed">{item.content}</p>
                  ) : (
                    <p className="text-slate-300">
                      Hành động: <strong className="text-blue-400">{item.action}</strong>
                    </p>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="text-center py-6 text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Tính năng Work log đang cập nhật.
          </div>
        )}
      </div>
    </div>
  );
};