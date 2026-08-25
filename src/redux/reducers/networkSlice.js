import { createSlice } from '@reduxjs/toolkit';

/**
 * networkSlice — connectivity state for the offline banner.
 *
 * Two independent signals feed this:
 *
 *   isConnected      NetInfo's live view of the device's connection. Updates the
 *                    moment the radio changes, even while the user is idle.
 *
 *   requestFailedAt  Set by the axios interceptor when a request never reached
 *                    the server. NetInfo can report "connected" on a captive
 *                    portal or a dead Wi-Fi network, so a failed request is the
 *                    ground truth that something is actually unreachable.
 *
 * The banner shows if either says we are offline.
 */
const networkSlice = createSlice({
  name: 'network',
  initialState: {
    // Assume online until told otherwise, so the banner never flashes on a cold
    // start before NetInfo has reported.
    isConnected:     true,
    // Null once a request succeeds, so the banner clears itself on recovery.
    requestFailedAt: null,
  },
  reducers: {
    setConnected: (state, { payload }) => {
      state.isConnected = payload;

      // Clear the failed-request flag on reconnect, so the banner hides itself
      // rather than waiting for the next API call. Without this a user who hit
      // one failure and then sat idle would keep the banner forever, since
      // nothing would fire a request to clear it.
      //
      // Safe to trust: useNetworkStatus resolves this from NetInfo's
      // `isInternetReachable`, which is an actual reachability probe, not just
      // radio state. If it is wrong anyway (captive portal), the next request
      // fails and re-raises the banner immediately.
      if (payload) state.requestFailedAt = null;
    },
    networkRequestFailed: (state, { payload }) => {
      state.requestFailedAt = payload ?? null;
    },
    networkRequestSucceeded: (state) => {
      state.requestFailedAt = null;
    },
  },
});

export const { setConnected, networkRequestFailed, networkRequestSucceeded } =
  networkSlice.actions;

/** True when either signal says we cannot reach the network. */
export const selectIsOffline = (s) =>
  s.network?.isConnected === false || s.network?.requestFailedAt != null;

export default networkSlice.reducer;
