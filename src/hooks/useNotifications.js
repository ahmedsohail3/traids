import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  clearNotifications,
  markNotificationRead  as markNotificationReadThunk,
  markAllNotificationsRead as markAllNotificationsReadThunk,
} from '~redux/reducers/notificationsSlice';

// ── Notification type metadata ────────────────────────────────────────────────

const NOTIFICATION_META = {
  newMessage:          { icon: 'chatbubble-outline',       color: '#1E3A8A', label: 'New Message'          },
  newJobApplication:   { icon: 'briefcase-outline',        color: '#F2A154', label: 'New Application'      },
  offerAccepted:       { icon: 'checkmark-circle-outline', color: '#22C55E', label: 'Offer Accepted'       },
  jobOffer:            { icon: 'paper-plane-outline',      color: '#8B5CF6', label: 'Job Offer'            },
  applicationRejected: { icon: 'close-circle-outline',     color: '#EF4444', label: 'Application Rejected' },
};

const DEFAULT_META = { icon: 'notifications-outline', color: '#64748B', label: 'Notification' };

export const getNotificationMeta = (type) => NOTIFICATION_META[type] ?? DEFAULT_META;

// ── Relative time formatter ───────────────────────────────────────────────────

export const formatNotificationTime = (dateStr) => {
  if (!dateStr) return '';
  const date   = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins   = Math.floor(diffMs / 60000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours  = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days   = Math.floor(hours / 24);
  if (days < 7)   return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// ── Navigation handler ────────────────────────────────────────────────────────
// markRead is optional — pass it to mark before navigating

export const handleNotificationPress = (notification, navigation, markRead) => {
  if (!notification) return;
  const id = notification._id ?? notification.id;
  if (markRead && id && !notification.isRead) markRead(id);
  if (!navigation) return;
  switch (notification.type) {
    case 'newMessage':
      if (notification.conversationId) {
        navigation.navigate('CompanyChat', { conversationId: notification.conversationId });
      }
      break;
    case 'newJobApplication':
    case 'offerAccepted':
    case 'applicationRejected':
      if (notification.jobId) {
        navigation.navigate('CompanyJobDetail', { jobId: notification.jobId });
      }
      break;
    default:
      break;
  }
};

// ── Primary hook ──────────────────────────────────────────────────────────────

const useNotifications = () => {
  const dispatch = useDispatch();

  const notifications        = useSelector((s) => s.notifications.notifications);
  const loadingNotifications = useSelector((s) => s.notifications.loadingNotifications);
  const notificationsError   = useSelector((s) => s.notifications.notificationsError);
  const unreadCount          = useSelector((s) => s.notifications.unreadCount);

  const getNotifications   = useCallback(() => dispatch(fetchNotifications()),  [dispatch]);
  const resetNotifications = useCallback(() => dispatch(clearNotifications()),  [dispatch]);

  return {
    notifications,
    loadingNotifications,
    notificationsError,
    unreadCount,
    getNotifications,
    resetNotifications,
  };
};

export default useNotifications;

// ── useMarkNotificationRead ───────────────────────────────────────────────────

export const useMarkNotificationRead = () => {
  const dispatch      = useDispatch();
  const markingRead   = useSelector((s) => s.notifications.markingRead);
  const markReadError = useSelector((s) => s.notifications.markReadError);

  const markAsRead = useCallback(
    (notificationId) => dispatch(markNotificationReadThunk(notificationId)),
    [dispatch],
  );

  return { markAsRead, markingRead, markReadError };
};

// ── useMarkAllNotificationsRead ───────────────────────────────────────────────

export const useMarkAllNotificationsRead = () => {
  const dispatch         = useDispatch();
  const markingAllRead   = useSelector((s) => s.notifications.markingAllRead);
  const markAllReadError = useSelector((s) => s.notifications.markAllReadError);

  const markAllRead = useCallback(
    () => dispatch(markAllNotificationsReadThunk()),
    [dispatch],
  );

  return { markAllRead, markingAllRead, markAllReadError };
};
