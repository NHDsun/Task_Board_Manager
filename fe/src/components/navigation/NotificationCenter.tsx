import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Flame,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Inbox,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../store/useAuthStore';

export interface NotificationItem {
  id: string;
  userId: string;
  actorId?: string;
  title: string;
  content: string;
  type:
    | 'TASK_ASSIGNED'
    | 'SUBTASK_URGENT'
    | 'SUBTASK_APPROVAL_REQUEST'
    | 'SUBTASK_APPROVED'
    | 'SUBTASK_REJECTED'
    | 'TASK_TRANSFER_REQUEST'
    | 'TASK_TRANSFER_ACCEPTED'
    | 'TASK_TRANSFER_REJECTED'
    | 'TASK_COMMENT'
    | 'MENTION'
    | 'SYSTEM';
  taskId?: string;
  subtaskId?: string;
  projectId?: string;
  isRead: boolean;
  createdAt: string;
  actor?: {
    id: string;
    fullName: string;
    avatar?: string;
    email?: string;
  };
  task?: {
    id: string;
    title: string;
    status: string;
    priority: string;
  };
}

interface NotificationCenterProps {
  onSelectTaskId?: (taskId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onSelectTaskId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'URGENT'>('ALL');
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔄 Tải thông báo và số lượng chưa đọc từ API
  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications?limit=40').catch(() => ({ data: [] })),
        api.get('/notifications/unread-count').catch(() => ({ data: { unreadCount: 0 } })),
      ]);

      const rawData = listRes.data;
      const notifList: NotificationItem[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

      setNotifications(notifList);
      setUnreadCount(
        typeof countRes.data?.unreadCount === 'number'
          ? countRes.data.unreadCount
          : notifList.filter((n) => !n.isRead).length
      );
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();

      // 🔌 Tham gia Socket.IO phòng riêng của User
      socketService.joinUser(currentUser.id);

      // ⚡ Lắng nghe thông báo Realtime từ Backend
      const handleNewNotification = (newNotif: NotificationItem) => {
        if (!newNotif) return;
        setNotifications((prev) => [newNotif, ...(Array.isArray(prev) ? prev : [])]);
        setUnreadCount((prev) => (typeof prev === 'number' ? prev + 1 : 1));

        // Hiển thị Toast thông báo nổi góc màn hình trong 5 giây
        setToastNotification(newNotif);
        setTimeout(() => {
          setToastNotification((curr) => (curr?.id === newNotif.id ? null : curr));
        }, 5000);
      };

      const handleNotificationRead = (data: { id: string; unreadCount: number }) => {
        setNotifications((prev) =>
          Array.isArray(prev)
            ? prev.map((n) => (n.id === data?.id ? { ...n, isRead: true } : n))
            : []
        );
        if (data && typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      };

      const handleReadAll = () => {
        setNotifications((prev) =>
          Array.isArray(prev) ? prev.map((n) => ({ ...n, isRead: true })) : []
        );
        setUnreadCount(0);
      };

      socketService.on('notification:new', handleNewNotification);
      socketService.on('notification:read', handleNotificationRead);
      socketService.on('notification:read-all', handleReadAll);

      return () => {
        socketService.off('notification:new', handleNewNotification);
        socketService.off('notification:read', handleNotificationRead);
        socketService.off('notification:read-all', handleReadAll);
        socketService.leaveUser(currentUser.id);
      };
    }
  }, [currentUser?.id]);

  // 🔒 Đóng dropdown khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 👁️ Đánh dấu 1 thông báo là đã đọc
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        Array.isArray(prev)
          ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          : []
      );
      setUnreadCount((prev) => Math.max(0, (typeof prev === 'number' ? prev : 1) - 1));
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  };

  // ✅ Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => ({ ...n, isRead: true })) : []
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  // 🗑️ Xóa thông báo
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      const safeList = Array.isArray(notifications) ? notifications : [];
      const wasUnread = safeList.find((n) => n.id === id)?.isRead === false;
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.filter((n) => n.id !== id) : []
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, (typeof prev === 'number' ? prev : 1) - 1));
      }
    } catch (err) {
      console.error('Lỗi xóa thông báo:', err);
    }
  };

  // 🎯 Xử lý khi bấm vào thông báo
  const handleItemClick = (notif: NotificationItem) => {
    if (!notif) return;
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (notif.taskId && onSelectTaskId) {
      onSelectTaskId(notif.taskId);
      setIsOpen(false);
    }
  };

  // 🔍 Lọc thông báo theo Tab (Bảo vệ Array 100%)
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const filteredNotifications = safeNotifications.filter((n) => {
    if (!n) return false;
    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'URGENT') return n.type === 'SUBTASK_URGENT';
    return true;
  });

  // 🎨 Icon & Màu sắc theo loại thông báo
  const getNotificationVisuals = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SUBTASK_URGENT':
        return {
          icon: Flame,
          color: 'text-rose-400',
          bg: 'bg-rose-500/20 border-rose-500/40',
          badge: 'KHẨN CẤP',
        };
      case 'SUBTASK_APPROVED':
      case 'TASK_TRANSFER_ACCEPTED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20 border-emerald-500/40',
          badge: 'ĐÃ DUYỆT',
        };
      case 'SUBTASK_REJECTED':
      case 'TASK_TRANSFER_REJECTED':
        return {
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-500/20 border-rose-500/40',
          badge: 'TỪ CHỐI',
        };
      case 'SUBTASK_APPROVAL_REQUEST':
      case 'TASK_TRANSFER_REQUEST':
        return {
          icon: Inbox,
          color: 'text-purple-400',
          bg: 'bg-purple-500/20 border-purple-500/40',
          badge: 'CHỜ DUYỆT',
        };
      case 'TASK_COMMENT':
        return {
          icon: MessageSquare,
          color: 'text-blue-400',
          bg: 'bg-blue-500/20 border-blue-500/40',
          badge: 'BÌNH LUẬN',
        };
      default:
        return {
          icon: ClipboardList,
          color: 'text-amber-400',
          bg: 'bg-amber-500/20 border-amber-500/40',
          badge: 'GIAO VIỆC',
        };
    }
  };

  // 🕒 Tính thời gian tương đối
  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Chuông Thông Báo Top Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer shadow-md flex items-center justify-center ${
          isOpen
            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40 hover:bg-slate-800'
        }`}
        title="Trung Tâm Thông Báo Cá Nhân"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce text-amber-400' : ''}`} />

        {/* Badge Đếm Số Lượng Chưa Đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[10px] flex items-center justify-center shadow-lg shadow-rose-500/40 border border-slate-950 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 🚀 Flyout Dropdown Panel UI Pro Max */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 md:w-[440px] rounded-3xl bg-[#0F172A]/95 border border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 overflow-hidden space-y-3 animate-solar-warp-in">
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Trung Tâm Thông Báo</h3>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {unreadCount} thông báo chưa đọc
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Bộ Lọc Tab (Tất cả, Chưa đọc, Khẩn cấp) */}
          <div className="px-4 flex items-center gap-2">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
              { id: 'URGENT', label: 'Khẩn cấp 🔥' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Danh Sách Thông Báo Cuộn Mượt */}
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-slate-800/60 px-2">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Không có thông báo nào trong mục này.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const visual = getNotificationVisuals(notif.type);
                const IconComponent = visual.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 group my-1 ${
                      notif.isRead
                        ? 'bg-transparent hover:bg-slate-900/50 opacity-70 hover:opacity-100'
                        : 'bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 shadow-sm'
                    }`}
                  >
                    {/* Icon loại thông báo */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${visual.bg}`}
                    >
                      <IconComponent className={`w-4 h-4 ${visual.color}`} />
                    </div>

                    {/* Nội dung thông báo */}
                    <div className="flex-1 overflow-hidden space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                          {notif.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {notif.content}
                      </p>

                      {/* Footer Badge Task liên quan */}
                      {notif.task && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 border border-slate-800 truncate max-w-[200px]">
                            📁 {notif.task.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Nút hành động nhanh (Đánh dấu đã đọc / Xóa) */}
                    <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all"
                          title="Đánh dấu đã đọc"
                        >
                          <CheckCheck className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-all"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 🌠 Realtime Popup Toast (Bay vào góc màn hình khi có thông báo mới) */}
      {toastNotification && (
        <div
          onClick={() => handleItemClick(toastNotification)}
          className="fixed top-6 right-6 max-w-sm rounded-2xl bg-[#0F172A]/95 border border-amber-400 p-4 shadow-[0_0_40px_rgba(245,158,11,0.4)] backdrop-blur-2xl z-50 flex items-start gap-3 cursor-pointer animate-solar-warp-in"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-5 h-5 animate-pulse text-rose-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-black text-white">{toastNotification.title}</h4>
            <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
              {toastNotification.content}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setToastNotification(null);
            }}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
