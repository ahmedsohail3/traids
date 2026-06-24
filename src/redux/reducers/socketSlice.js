import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    connected:            false,
    socketId:             null,
    connectionStatus:     'idle', // 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
    unreadMessageCount:   0,
    realtimeNotifications: [],   // toast queue (max 10 kept)
    latestEvent:          null,  // current toast being displayed
  },
  reducers: {
    socketConnected: (state, { payload }) => {
      state.connected        = true;
      state.socketId         = payload?.socketId ?? null;
      state.connectionStatus = 'connected';
    },
    socketDisconnected: (state) => {
      state.connected        = false;
      state.socketId         = null;
      state.connectionStatus = 'disconnected';
    },
    setConnectionStatus: (state, { payload }) => {
      state.connectionStatus = payload;
    },
    incrementUnreadMessageCount: (state) => {
      state.unreadMessageCount += 1;
    },
    resetUnreadMessageCount: (state) => {
      state.unreadMessageCount = 0;
    },
    // Push a toast event; keep at most 10 in the queue
    addRealtimeEvent: (state, { payload }) => {
      state.realtimeNotifications = [payload, ...state.realtimeNotifications].slice(0, 10);
      state.latestEvent           = payload;
    },
    clearLatestEvent: (state) => {
      state.latestEvent = null;
    },
    clearRealtimeEvents: (state) => {
      state.realtimeNotifications = [];
      state.latestEvent           = null;
    },
  },
});

export const {
  socketConnected,
  socketDisconnected,
  setConnectionStatus,
  incrementUnreadMessageCount,
  resetUnreadMessageCount,
  addRealtimeEvent,
  clearLatestEvent,
  clearRealtimeEvents,
} = socketSlice.actions;

export default socketSlice.reducer;
