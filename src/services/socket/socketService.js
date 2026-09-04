/**
 * socketService.js
 *
 * Manages the single Socket.IO instance for the application.
 * Singleton — only one socket can be active at a time.
 * No Redux imports — all dispatching is done in hooks.
 */
import Config from 'react-native-config';
import {io} from 'socket.io-client';

const SOCKET_URL = Config.SOCKET_URL || Config.SOCKET_STAGING_URL;

console.log('socket url', SOCKET_URL);

let _socket = null;

/**
 * Initialize the socket connection with the given JWT access token.
 * If a connected socket already exists, returns it without creating a new one.
 */
export const initSocket = token => {
  if (_socket?.connected) {
    console.log('[Socket] Already connected — reusing existing socket.');
    return _socket;
  }

  // Disconnect stale socket if it exists but isn't connected
  if (_socket) {
    _socket.removeAllListeners();
    _socket.disconnect();
    _socket = null;
  }

  console.log('[Socket] Initialising connection…');

  _socket = io(SOCKET_URL, {
    auth: {token},
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 10000,
  });

  return _socket;
};

/**
 * Cleanly disconnect and destroy the socket instance.
 * Removes all listeners before disconnecting to prevent zombie handlers.
 */
export const disconnectSocket = () => {
  if (_socket) {
    console.log('[Socket] Disconnecting…');
    _socket.removeAllListeners();
    _socket.disconnect();
    _socket = null;
  }
};

/** Returns the active socket instance, or null if not initialised. */
export const getSocket = () => _socket;

/** True when the socket is alive and connected. */
export const isSocketConnected = () => _socket?.connected ?? false;

// ── Room management ───────────────────────────────────────────────────────────

export const joinConversation = conversationId => {
  if (!_socket?.connected || !conversationId) {
    if (__DEV__)
      console.warn(
        '[Socket] joinConversation — not ready | connected:',
        _socket?.connected,
        '| id:',
        conversationId,
      );
    return;
  }
  console.log(
    '[Socket] conversationId type:',
    typeof conversationId,
    '| value:',
    conversationId,
  );
  _socket.emit('joinConversation', {conversationId}, ack => {
    if (__DEV__) {
      if (ack?.success) {
        console.log(
          '[Socket] Room joined ✓ — room:',
          ack.room,
          '| conv:',
          conversationId,
        );
      } else {
        console.warn(
          '[Socket] Room join FAILED — conv:',
          conversationId,
          '| ack:',
          JSON.stringify(ack),
        );
      }
    }
  });
};

export const leaveConversation = conversationId => {
  if (_socket && conversationId) {
    console.log('[Socket] Leaving conversation room:', conversationId);
    _socket.emit('leaveConversation', {conversationId});
  }
};
