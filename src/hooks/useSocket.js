import { useSelector } from 'react-redux';

/**
 * Read-only selector hook for socket state.
 * Use this anywhere you need to know if the socket is connected or
 * to read realtime events / unread message count.
 */
const useSocket = () => {
  const connected              = useSelector((s) => s.socket.connected);
  const socketId               = useSelector((s) => s.socket.socketId);
  const connectionStatus       = useSelector((s) => s.socket.connectionStatus);
  const unreadMessageCount     = useSelector((s) => s.socket.unreadMessageCount);
  const realtimeNotifications  = useSelector((s) => s.socket.realtimeNotifications);
  const latestEvent            = useSelector((s) => s.socket.latestEvent);

  return {
    connected,
    socketId,
    connectionStatus,
    unreadMessageCount,
    realtimeNotifications,
    latestEvent,
  };
};

export default useSocket;
