import { useSelector } from 'react-redux';

/**
 * Exposes the realtime notification queue from socketSlice.
 * Use in components that need to display or react to live notification events.
 */
const useRealtimeNotifications = () => {
  const realtimeNotifications = useSelector((s) => s.socket.realtimeNotifications);
  const latestEvent           = useSelector((s) => s.socket.latestEvent);

  return { realtimeNotifications, latestEvent };
};

export default useRealtimeNotifications;
