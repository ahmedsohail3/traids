/**
 * useConversationSocket
 *
 * Manages room membership and real-time message delivery for the active chat.
 *
 * Listens to TWO events to cover both server implementations:
 *
 *   message:new  — server sends full message payload when user IS in the room.
 *                  We append the message directly, no API call needed.
 *
 *   newMessage   — server sends a preview payload to everyone (room or not).
 *                  If it arrives for the active conversation we re-fetch to get
 *                  the full message. Acts as a reliable fallback.
 *
 * In DEV mode, onAny() logs every raw event from the server so you can see
 * exactly what event names and payloads the backend is actually sending.
 */
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  joinConversation,
  leaveConversation,
  getSocket,
} from '~services/socket/socketService';
import { SOCKET_EVENTS } from '~services/socket/socketEvents';
import { prependMessage, fetchMessages } from '~redux/reducers/chatSlice';

const useConversationSocket = (conversationId, { onNewMessage } = {}) => {
  const dispatch  = useDispatch();
  const connected = useSelector((s) => s.socket.connected);

  // Stable ref for the scroll callback — prevents listener churn on re-renders
  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => { onNewMessageRef.current = onNewMessage; });

  // ── Room join / leave ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!conversationId || !connected) return;

    joinConversation(conversationId);
    if (__DEV__) console.log('[Socket] Joined room:', conversationId);

    return () => {
      leaveConversation(conversationId);
      if (__DEV__) console.log('[Socket] Left room:', conversationId);
    };
  }, [conversationId, connected]);

  // ── Event listeners ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!conversationId || !connected) return;

    const sock = getSocket();
    if (!sock) return;

    // ── DEV: log every single event the server sends ─────────────────────────
    const anyHandler = __DEV__
      ? (event, ...args) => console.log('[Socket RAW]', event, JSON.stringify(args))
      : null;
    if (anyHandler) sock.onAny(anyHandler);

    // ── Primary: message:new ─────────────────────────────────────────────────
    // Full payload — append directly without an API call.
    const handleMessageNew = (payload) => {
      if (__DEV__) console.log('[Socket] message:new received:', payload);

      const msgConvId = payload?.conversationId;
      if (msgConvId && msgConvId !== conversationId) return;

      const id = payload.messageId ?? payload._id ?? null;

      // A synthesised id could never match the REST copy of the same message, so
      // the two would sit in the list side by side. Without one, re-fetch instead
      // of pushing a stub we can't dedup.
      if (!id) {
        dispatch(fetchMessages({ chatId: conversationId, limit: 50, skip: 0 }));
        if (onNewMessageRef.current) onNewMessageRef.current(null);
        return;
      }

      const rawMessage = {
        _id:         id,
        sender:      payload.senderId  ?? payload.sender,
        senderType:  payload.senderType,
        content:     payload.content ?? payload.text ?? '',
        attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
        createdAt:   payload.createdAt ?? new Date().toISOString(),
        jobId:       payload.jobId    ?? null,
        jobTitle:    payload.jobTitle ?? null,
      };

      dispatch(prependMessage({ chatId: conversationId, message: rawMessage }));
      if (onNewMessageRef.current) onNewMessageRef.current(rawMessage);
    };

    // ── Fallback: newMessage ─────────────────────────────────────────────────
    // Preview-only payload. If it's for this conversation, re-fetch to get
    // the full message. Handles servers that don't differentiate room members.
    const handleNewMessage = (payload) => {
      if (__DEV__) console.log('[Socket] newMessage received (fallback):', payload);

      const msgConvId = payload?.conversationId;
      if (!msgConvId || msgConvId !== conversationId) return;

      // Re-fetch latest messages — the dedup in prependMessage means even if
      // message:new also fired, the REST result won't create duplicates.
      dispatch(fetchMessages({ chatId: conversationId, limit: 50, skip: 0 }));
      if (onNewMessageRef.current) onNewMessageRef.current(null);
    };

    sock.on(SOCKET_EVENTS.MESSAGE_NEW, handleMessageNew);
    sock.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);

    if (__DEV__) {
      console.log('[Socket] Listeners attached for room:', conversationId,
        '| events:', SOCKET_EVENTS.MESSAGE_NEW, SOCKET_EVENTS.NEW_MESSAGE);
    }

    return () => {
      if (anyHandler) sock.offAny(anyHandler);
      sock.off(SOCKET_EVENTS.MESSAGE_NEW, handleMessageNew);
      sock.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      if (__DEV__) console.log('[Socket] Listeners removed for room:', conversationId);
    };
  }, [conversationId, connected, dispatch]);
};

export default useConversationSocket;
