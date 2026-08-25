import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConversations,
  fetchMessages,
  markConversationAsRead as markConversationAsReadThunk,
  sendMessage as sendMessageThunk,
  sendFirstMessage as sendFirstMessageThunk,
  clearConversations,
  clearMessages,
} from '~redux/reducers/chatSlice';

// ── Time formatters ────────────────────────────────────────────────────────────

/**
 * Short format for conversation list: "2m", "14:30", "Mon", "12 Jan"
 */
const formatChatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now      = new Date();
  const diffMs   = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });

  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

/**
 * Whole-day difference by the calendar, not by elapsed 24h blocks. A message
 * sent at 23:50 must still read as "Yesterday" when the app is opened at 00:10 —
 * subtracting timestamps would call that 0 days and label it "Today".
 */
const startOfDay = (value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return NaN;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const calendarDaysAgo = (dateStr) => {
  const then = startOfDay(dateStr);
  if (isNaN(then)) return NaN;
  return Math.round((startOfDay(new Date()) - then) / 86400000);
};

/**
 * Time for a message bubble: "10:44 AM".
 *
 * Just the clock time, whatever the age. Every group of messages now sits under
 * a day separator naming its date, so repeating "Yesterday"/"Monday" on each
 * bubble underneath only restates the header.
 */
export const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ── Day separators ─────────────────────────────────────────────────────────────

export const DAY_SEPARATOR = 'day-separator';

/** Header text for a day group: "Today", "Yesterday", "Monday", "12 Jan 2025". */
export const formatDaySeparator = (dateStr) => {
  const days = calendarDaysAgo(dateStr);
  if (isNaN(days)) return '';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';

  const date = new Date(dateStr);
  if (days < 7) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Injects a separator row before the first message of each calendar day.
 * Expects messages sorted oldest → newest, which getMessagesForChat guarantees.
 */
export const withDaySeparators = (messages = []) => {
  const rows = [];
  let lastDay = null;

  for (const message of messages) {
    const createdAt = message._raw?.createdAt ?? message.createdAt;
    const day       = startOfDay(createdAt);

    if (!isNaN(day) && day !== lastDay) {
      lastDay = day;
      rows.push({
        type:  DAY_SEPARATOR,
        id:    `${DAY_SEPARATOR}-${day}`,
        label: formatDaySeparator(createdAt),
      });
    }
    rows.push(message);
  }

  return rows;
};

// ── Adapters ───────────────────────────────────────────────────────────────────

/**
 * Maps a raw API conversation → ChatListItem shape.
 * userType: 'company' | 'subcontractor'
 */
export const adaptConversation = (conv, userType) => {
  const isSubcontractor = userType === 'subcontractor';
  const sub     = typeof conv.subcontractor === 'object' ? (conv.subcontractor ?? {}) : {};
  const company = typeof conv.company       === 'object' ? (conv.company       ?? {}) : {};

  const name      = isSubcontractor
    ? (company.companyName ?? 'Unknown')
    : (sub.fullName        ?? 'Unknown');
  const trade     = isSubcontractor ? '' : (sub.primaryTrade ?? '');
  const avatarUri = isSubcontractor
    ? (company.profileImage ?? null)
    : (sub.profileImage     ?? null);

  const unread =
    userType === 'company'
      ? conv.unreadCountCompany ?? 0
      : conv.unreadCountSubcontractor ?? 0;

  return {
    id:                  conv._id,
    name,
    trade,
    avatarUri,
    lastMessage:         conv.lastMessage ?? '',
    lastAttachmentCount: conv.lastAttachmentCount ?? conv.lastMessageAttachmentCount ?? 0,
    time:                formatChatTime(conv.lastMessageAt),
    unread,
    isOnline:            false,
    _raw:                conv,
  };
};

/**
 * Maps a raw API message → MessageBubble shape.
 * userType: 'company' | 'subcontractor' — determines which side is "sent"
 * conversationData: raw conversation object (for avatar/name of the other party)
 */
export const adaptMessage = (msg, userType, conversationData, myAvatarUri = null) => {
  const isSent      = msg.senderType === userType;
  const sub         = typeof conversationData?.subcontractor === 'object'
    ? (conversationData.subcontractor ?? {}) : {};
  const company     = typeof conversationData?.company === 'object'
    ? (conversationData.company ?? {}) : {};

  const otherName   = userType === 'subcontractor'
    ? (company.companyName ?? 'Unknown')
    : (sub.fullName        ?? 'Unknown');
  const otherAvatar = userType === 'subcontractor'
    ? (company.profileImage ?? null)
    : (sub.profileImage     ?? null);

  return {
    id:          msg._id,
    senderId:    msg.sender,
    senderType:  msg.senderType,
    senderName:  isSent ? 'You' : otherName,
    text:        msg.content ?? '',
    time:        formatMessageTime(msg.createdAt),
    avatarUri:   isSent ? myAvatarUri : otherAvatar,
    attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
    isSent,
    _raw:        msg,
  };
};

// ── Stable selectors ───────────────────────────────────────────────────────────

const selectConversations     = (s) => s.chat.conversations;
const selectLoading           = (s) => s.chat.loading;
const selectError             = (s) => s.chat.error;
const selectMessagesByChatId  = (s) => s.chat.messagesByChatId;
const selectLoadingMessages   = (s) => s.chat.loadingMessages;
const selectMessagesError     = (s) => s.chat.messagesError;
const selectUserType          = (s) => s.auth?.user?.type ?? 'subcontractor';
const selectMyAvatarUri       = (s) => s.profile?.data?.profileImage ?? null;
const selectSendingMessage        = (s) => s.chat.sendingMessage;
const selectSendMessageError      = (s) => s.chat.sendMessageError;
const selectSendingFirstMessage   = (s) => s.chat.sendingFirstMessage;
const selectSendFirstMessageError = (s) => s.chat.sendFirstMessageError;

// ── Hook ──────────────────────────────────────────────────────────────────────

const useChat = () => {
  const dispatch         = useDispatch();
  const rawConvs         = useSelector(selectConversations);
  const loading          = useSelector(selectLoading);
  const error            = useSelector(selectError);
  const messagesByChatId = useSelector(selectMessagesByChatId);
  const loadingMessages  = useSelector(selectLoadingMessages);
  const messagesError    = useSelector(selectMessagesError);
  const userType         = useSelector(selectUserType);
  const myAvatarUri      = useSelector(selectMyAvatarUri);
  const sendingMessage        = useSelector(selectSendingMessage);
  const sendMessageError      = useSelector(selectSendMessageError);
  const sendingFirstMessage   = useSelector(selectSendingFirstMessage);
  const sendFirstMessageError = useSelector(selectSendFirstMessageError);

  // ── Conversations ────────────────────────────────────────────────────────────

  const conversations = useMemo(() => {
    const sorted = [...rawConvs].sort((a, b) => {
      const tA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tB - tA;
    });
    return sorted.map((c) => adaptConversation(c, userType));
  }, [rawConvs, userType]);

  const getConversations     = useCallback(() => dispatch(fetchConversations()), [dispatch]);
  const refetchConversations = useCallback(() => dispatch(fetchConversations()), [dispatch]);
  const resetConversations   = useCallback(() => dispatch(clearConversations()), [dispatch]);

  const markConversationAsRead = useCallback(
    (chatId) => {
      const conv        = rawConvs.find((c) => c._id === chatId);
      const unreadField = userType === 'company' ? 'unreadCountCompany' : 'unreadCountSubcontractor';
      if (!conv || (conv[unreadField] ?? 0) === 0) return;
      dispatch(markConversationAsReadThunk({ chatId, userType }));
    },
    [dispatch, userType, rawConvs],
  );

  // ── Messages ─────────────────────────────────────────────────────────────────

  /**
   * Returns adapted + sorted messages for the given chatId.
   * conversationData is the raw conversation object (for avatar/name mapping).
   */
  const getMessagesForChat = useCallback(
    (chatId, conversationData) => {
      const entry = messagesByChatId[chatId];
      if (!entry?.messages?.length) return [];

      const sorted = [...entry.messages].sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tA - tB;
      });

      return sorted.map((m) => adaptMessage(m, userType, conversationData, myAvatarUri));
    },
    [messagesByChatId, userType, myAvatarUri],
  );

  const getPaginationForChat = useCallback(
    (chatId) => messagesByChatId[chatId]?.pagination ?? { limit: 50, skip: 0, hasMore: true },
    [messagesByChatId],
  );

  /** Initial fetch / refresh: skip=0 replaces all messages for this chat */
  const getMessages = useCallback(
    (chatId, limit = 50) => dispatch(fetchMessages({ chatId, limit, skip: 0 })),
    [dispatch],
  );

  /** Load older messages: appends to existing list */
  const loadMoreMessages = useCallback(
    (chatId) => {
      const pagination = messagesByChatId[chatId]?.pagination;
      if (!pagination?.hasMore) return;
      dispatch(fetchMessages({ chatId, limit: pagination.limit, skip: pagination.skip }));
    },
    [dispatch, messagesByChatId],
  );

  const resetMessages = useCallback(
    (chatId) => dispatch(clearMessages(chatId)),
    [dispatch],
  );

  const sendMessage = useCallback(
    ({ conversationId, content, attachments = [] }) =>
      dispatch(sendMessageThunk({ conversationId, content, attachments })),
    [dispatch],
  );

  const sendFirstMessage = useCallback(
    ({ subcontractorId, content, attachments = [] }) =>
      dispatch(sendFirstMessageThunk({ subcontractorId, content, attachments })).unwrap(),
    [dispatch],
  );

  return {
    // Conversations
    conversations,
    loading,
    error,
    getConversations,
    refetchConversations,
    resetConversations,
    markConversationAsRead,
    userType,

    // Messages
    getMessagesForChat,
    getPaginationForChat,
    loadingMessages,
    messagesError,
    getMessages,
    loadMoreMessages,
    resetMessages,

    // Send
    sendMessage,
    sendingMessage,
    sendMessageError,
    // Send first message (new conversation)
    sendFirstMessage,
    sendingFirstMessage,
    sendFirstMessageError,
    // Raw conversations for subcontractor lookup
    rawConversations: rawConvs,
  };
};

export default useChat;
