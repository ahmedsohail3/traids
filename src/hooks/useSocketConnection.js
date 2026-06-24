/**
 * useSocketConnection
 *
 * Manages the full socket lifecycle based on authentication state.
 * Mount this hook once inside each role-specific navigator (CompanyNavigator,
 * SubNavigator). It will:
 *   • Connect when the user is authenticated
 *   • Register all Redux-dispatching event listeners
 *   • Disconnect and clean up when the user logs out
 *
 * No socket logic should exist in screens — this hook is the single owner.
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAccessToken } from '~utils';
import {
  initSocket,
  disconnectSocket,
} from '~services/socket/socketService';
import { SOCKET_EVENTS } from '~services/socket/socketEvents';
import {
  buildNotificationFromEvent,
  buildToastEvent,
} from '~services/socket/socketHelpers';
import {
  socketConnected,
  socketDisconnected,
  setConnectionStatus,
  incrementUnreadMessageCount,
  addRealtimeEvent,
} from '~redux/reducers/socketSlice';
import {
  addRealtimeNotification,
  fetchNotifications,
} from '~redux/reducers/notificationsSlice';
import {
  incrementUnread,
  updateConversation,
  fetchConversations,
} from '~redux/reducers/chatSlice';


const useSocketConnection = () => {
  const dispatch        = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated ?? false);
  const userType        = useSelector((s) => s.auth?.user?.type ?? 'company');

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      dispatch(socketDisconnected());
      return;
    }

    let sock;
    const handlers = {};

    const connect = async () => {
      const token = await getAccessToken();
      if (!token) return;

      dispatch(setConnectionStatus('connecting'));
      sock = initSocket(token);

      console.log('sock', sock)

      // If the socket singleton was already connected (e.g. effect re-ran due to
      // Fast Refresh or dep change), the 'connect' event won't fire again.
      // Sync Redux state immediately so room-join effects don't stall.
      if (sock.connected) {
        console.log('[Socket] Already connected — syncing Redux state, id:', sock.id);
        dispatch(socketConnected({ socketId: sock.id }));
      }

      // ── Lifecycle ──────────────────────────────────────────────────────────

      handlers.onConnect = () => {
        if (__DEV__) console.log('[Socket ✓] connect — transport up | id:', sock.id);
        dispatch(socketConnected({ socketId: sock.id }));
      };

      handlers.onDisconnect = (reason) => {
        if (__DEV__) console.warn('[Socket ✗] disconnect — reason:', reason);
        dispatch(socketDisconnected());
        dispatch(setConnectionStatus('disconnected'));
      };

      handlers.onConnectError = (err) => {
        if (__DEV__) console.warn('[Socket ✗] connect_error —', err.message);
        dispatch(setConnectionStatus('error'));
      };

      handlers.onConnected = (payload) => {
        if (__DEV__) console.log('[Socket ✓] connected (server ack) — userId:', payload?.userId, '| userType:', payload?.userType);
      };

      // ── Global chat: newMessage (badge — user NOT in the conversation room) ──

      handlers.onNewMessage = (payload) => {
        console.log('onNewMessage',payload)
        if (__DEV__) console.log('[Socket ✓] newMessage — conv:', payload?.conversationId, '| from:', payload?.senderName, '| preview:', payload?.preview);

        const { conversationId, preview } = payload ?? {};
        const unreadField =
          userType === 'company' ? 'unreadCountCompany' : 'unreadCountSubcontractor';

        if (conversationId) {
          dispatch(incrementUnread({ conversationId, field: unreadField }));
          dispatch(updateConversation({ _id: conversationId, lastMessage: preview ?? '' }));
          dispatch(fetchConversations());
        }

        dispatch(incrementUnreadMessageCount());

        // Refresh notification list — unreadCount is derived from it in the reducer
        dispatch(fetchNotifications());

        const notification = buildNotificationFromEvent(SOCKET_EVENTS.NEW_MESSAGE, payload);
        const toast        = buildToastEvent(SOCKET_EVENTS.NEW_MESSAGE, payload);
        if (notification) dispatch(addRealtimeNotification(notification));
        if (toast)        dispatch(addRealtimeEvent(toast));
      };

      // ── Company events ──────────────────────────────────────────────────────

      const makeCompanyHandler = (eventType) => (payload) => {
        if (__DEV__) console.log('[Socket ✓] company event:', eventType, '| payload:', JSON.stringify(payload));
        const notification = buildNotificationFromEvent(eventType, payload);
        const toast        = buildToastEvent(eventType, payload);
        if (notification) dispatch(addRealtimeNotification(notification));
        if (toast)        dispatch(addRealtimeEvent(toast));
      };

      handlers.onNewJobApplication = makeCompanyHandler(SOCKET_EVENTS.NEW_JOB_APPLICATION);
      handlers.onOfferAccepted     = makeCompanyHandler(SOCKET_EVENTS.OFFER_ACCEPTED);
      handlers.onOfferRejected     = makeCompanyHandler(SOCKET_EVENTS.OFFER_REJECTED);
      handlers.onJobStatusUpdate   = makeCompanyHandler(SOCKET_EVENTS.JOB_STATUS_UPDATE);

      // ── Subcontractor events ────────────────────────────────────────────────

      const makeSubHandler = (eventType) => (payload) => {
        if (__DEV__) console.log('[Socket ✓] sub event:', eventType, '| payload:', JSON.stringify(payload));
        const notification = buildNotificationFromEvent(eventType, payload);
        const toast        = buildToastEvent(eventType, payload);
        if (notification) dispatch(addRealtimeNotification(notification));
        if (toast)        dispatch(addRealtimeEvent(toast));
      };

      handlers.onApplicationAccepted = makeSubHandler(SOCKET_EVENTS.APPLICATION_ACCEPTED);
      handlers.onApplicationRejected = makeSubHandler(SOCKET_EVENTS.APPLICATION_REJECTED);
      handlers.onOfferReceived       = makeSubHandler(SOCKET_EVENTS.OFFER_RECEIVED);
      handlers.onJobAssigned         = makeSubHandler(SOCKET_EVENTS.JOB_ASSIGNED);

      // ── Register all listeners ──────────────────────────────────────────────

      sock.on(SOCKET_EVENTS.CONNECT,              handlers.onConnect);
      sock.on(SOCKET_EVENTS.DISCONNECT,           handlers.onDisconnect);
      sock.on(SOCKET_EVENTS.CONNECT_ERROR,        handlers.onConnectError);
      sock.on(SOCKET_EVENTS.CONNECTED,            handlers.onConnected);
      sock.on(SOCKET_EVENTS.NEW_MESSAGE,          handlers.onNewMessage);
      sock.on(SOCKET_EVENTS.NEW_JOB_APPLICATION,  handlers.onNewJobApplication);
      sock.on(SOCKET_EVENTS.OFFER_ACCEPTED,       handlers.onOfferAccepted);
      sock.on(SOCKET_EVENTS.OFFER_REJECTED,       handlers.onOfferRejected);
      sock.on(SOCKET_EVENTS.JOB_STATUS_UPDATE,    handlers.onJobStatusUpdate);
      sock.on(SOCKET_EVENTS.APPLICATION_ACCEPTED, handlers.onApplicationAccepted);
      sock.on(SOCKET_EVENTS.APPLICATION_REJECTED, handlers.onApplicationRejected);
      sock.on(SOCKET_EVENTS.OFFER_RECEIVED,       handlers.onOfferReceived);
      sock.on(SOCKET_EVENTS.JOB_ASSIGNED,         handlers.onJobAssigned);

      if (__DEV__) {
        console.log(
          '[Socket] Listeners registered — events:',
          [
            SOCKET_EVENTS.CONNECT, SOCKET_EVENTS.DISCONNECT, SOCKET_EVENTS.CONNECT_ERROR,
            SOCKET_EVENTS.CONNECTED, SOCKET_EVENTS.NEW_MESSAGE,
            SOCKET_EVENTS.NEW_JOB_APPLICATION, SOCKET_EVENTS.OFFER_ACCEPTED,
            SOCKET_EVENTS.OFFER_REJECTED, SOCKET_EVENTS.JOB_STATUS_UPDATE,
            SOCKET_EVENTS.APPLICATION_ACCEPTED, SOCKET_EVENTS.APPLICATION_REJECTED,
            SOCKET_EVENTS.OFFER_RECEIVED, SOCKET_EVENTS.JOB_ASSIGNED,
          ].join(', '),
        );
      }
    };

    connect();

    return () => {
      if (sock) {
        sock.off(SOCKET_EVENTS.CONNECT,              handlers.onConnect);
        sock.off(SOCKET_EVENTS.DISCONNECT,           handlers.onDisconnect);
        sock.off(SOCKET_EVENTS.CONNECT_ERROR,        handlers.onConnectError);
        sock.off(SOCKET_EVENTS.CONNECTED,            handlers.onConnected);
        sock.off(SOCKET_EVENTS.NEW_MESSAGE,          handlers.onNewMessage);
        sock.off(SOCKET_EVENTS.NEW_JOB_APPLICATION,  handlers.onNewJobApplication);
        sock.off(SOCKET_EVENTS.OFFER_ACCEPTED,       handlers.onOfferAccepted);
        sock.off(SOCKET_EVENTS.OFFER_REJECTED,       handlers.onOfferRejected);
        sock.off(SOCKET_EVENTS.JOB_STATUS_UPDATE,    handlers.onJobStatusUpdate);
        sock.off(SOCKET_EVENTS.APPLICATION_ACCEPTED, handlers.onApplicationAccepted);
        sock.off(SOCKET_EVENTS.APPLICATION_REJECTED, handlers.onApplicationRejected);
        sock.off(SOCKET_EVENTS.OFFER_RECEIVED,       handlers.onOfferReceived);
        sock.off(SOCKET_EVENTS.JOB_ASSIGNED,         handlers.onJobAssigned);
        if (__DEV__) console.log('[Socket] Listeners removed (useSocketConnection cleanup)');
      }
    };
  }, [isAuthenticated, userType, dispatch]);
};

export default useSocketConnection;
