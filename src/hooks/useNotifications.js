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

// ── Route resolution ──────────────────────────────────────────────────────────
// Single source of truth for "which screen does this notification/toast open?".
// Both the notification lists and the realtime toast go through it, so a socket
// event and its notification-list twin always land on the same screen.
//
// Returns a route relative to the role stack (CompanyNavigator / SubNavigator),
// or null when the event carries nothing to open.

// Job-shaped notification types — every one of these opens the job it refers to.
const JOB_TYPES = new Set([
  'newJobApplication',
  'offerAccepted',
  'applicationRejected',
  'jobOffer',
]);

export const resolveNotificationRoute = (
  notification,
  { userType = 'company', conversations = [] } = {},
) => {
  if (!notification) return null;
  const isSub = userType === 'subcontractor';

  if (notification.type === 'newMessage') {
    const { conversationId } = notification;
    // Some message events arrive without a conversationId — open the chat list
    // rather than leaving the press dead. Both roles name this tab 'Chats'.
    if (!conversationId) {
      return {
        name:   isSub ? 'SubTabs' : 'CompanyTabs',
        params: { screen: 'Chats' },
      };
    }
    // Fall back to a minimal conversation — the chat screen fetches its
    // messages by _id anyway.
    const conversation =
      conversations.find((c) => c._id === conversationId) ??
      { _id: conversationId, name: notification.senderName ?? 'Chat' };
    return { name: isSub ? 'SubChat' : 'CompanyChat', params: { conversation } };
  }

  if (JOB_TYPES.has(notification.type)) {
    if (notification.jobId) {
      return {
        name:   isSub ? 'SubJobDetail' : 'CompanyJobDetail',
        params: { jobId: notification.jobId },
      };
    }
    // Some offer events only carry an offerId — no job to open, so fall back to
    // the jobs list rather than leaving the press dead.
    return {
      name:   isSub ? 'SubTabs' : 'CompanyTabs',
      params: { screen: isSub ? 'JobBoard' : 'Jobs' },
    };
  }

  return null;
};

// RootNavigator's route for each role stack — needed when navigating from
// outside that stack (the toast lives there).
export const getRoleStackRoute = (userType) =>
  (userType === 'subcontractor' ? 'SubApp' : 'CompanyApp');

// ── Navigation handler ────────────────────────────────────────────────────────
// markRead is optional — pass it to mark before navigating.
// `navigation` must belong to the role stack; pass { userType, conversations },
// or use useNotificationPress below, which wires both up for you.

export const handleNotificationPress = (
  notification,
  navigation,
  markRead,
  options = {},
) => {
  if (!notification) return;
  const id = notification._id ?? notification.id;
  if (markRead && id && !notification.isRead) markRead(id);
  if (!navigation) return;

  const route = resolveNotificationRoute(notification, options);
  if (route) navigation.navigate(route.name, route.params);
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

// ── useNotificationPress ──────────────────────────────────────────────────────
// Marks the notification read and routes to the right screen for the user's role.

export const useNotificationPress = (navigation) => {
  const { markAsRead } = useMarkNotificationRead();
  const conversations  = useSelector((s) => s.chat?.conversations ?? []);
  const userType       = useSelector((s) => s.auth?.user?.type ?? 'company');

  return useCallback(
    (notification) =>
      handleNotificationPress(notification, navigation, markAsRead, { userType, conversations }),
    [navigation, markAsRead, userType, conversations],
  );
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
