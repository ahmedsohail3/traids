/**
 * useNetworkStatus
 *
 * Subscribes to NetInfo and mirrors the device's connectivity into Redux, so
 * the offline banner reacts the moment the radio drops rather than waiting for
 * a request to fail.
 *
 * Mounted once, alongside the navigators — never inside a screen.
 */
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { setConnected } from '~redux/reducers/networkSlice';
import { replayOfflineQueue } from '~utils/axiosInstance';

const useNetworkStatus = () => {
  const dispatch = useDispatch();
  // Tracks the previous value so the replay fires on the offline → online edge
  // only, not on every NetInfo emission while already connected.
  const wasOnline = useRef(true);

  useEffect(() => {
    // `isInternetReachable` is null until NetInfo has probed, so fall back to
    // `isConnected` rather than reading that null as "offline" and flashing the
    // banner on a cold start.
    const resolve = (state) =>
      state.isInternetReachable ?? state.isConnected ?? true;

    const apply = (state) => {
      const online = resolve(state);
      dispatch(setConnected(online));

      // Reconnected: replay the reads that were held open while we were down,
      // so their original callers resolve and the screens fill themselves in.
      if (online && !wasOnline.current) replayOfflineQueue();
      wasOnline.current = online;
    };

    NetInfo.fetch().then(apply);

    const unsubscribe = NetInfo.addEventListener(apply);

    return () => unsubscribe();
  }, [dispatch]);
};

export default useNetworkStatus;
