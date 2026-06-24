import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '~services/notificationsService';
import { getErrorMessage } from '~utils';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getNotificationsApi();
      return {
        notifications: Array.isArray(res.notifications) ? res.notifications : [],
        total:         res.total      ?? 0,
        page:          res.page       ?? 1,
        totalPages:    res.totalPages ?? 1,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);


export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await markNotificationAsReadApi(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsReadApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications:        [],
    loadingNotifications: false,
    notificationsError:   null,
    unreadCount:          0,
    total:                0,
    page:                 1,
    totalPages:           1,
    // mark single
    markingRead:          false,
    markReadError:        null,
    // mark all
    markingAllRead:       false,
    markAllReadError:     null,
    // snapshot for mark-all revert on failure
    _prevNotifications:   null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications      = [];
      state.unreadCount        = 0;
      state.notificationsError = null;
    },
    // Called by socket event handlers — prepends a realtime notification
    addRealtimeNotification: (state, { payload }) => {
      if (!payload) return;
      // Avoid duplicate local IDs
      const exists = state.notifications.some((n) => n._id === payload._id);
      if (!exists) {
        state.notifications = [payload, ...state.notifications];
        if (!payload.isRead) state.unreadCount = state.unreadCount + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchNotifications ──────────────────────────────────────────────────
      .addCase(fetchNotifications.pending, (state) => {
        state.loadingNotifications = true;
        state.notificationsError   = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loadingNotifications = false;
        state.notifications        = payload.notifications;
        state.total                = payload.total;
        state.page                 = payload.page;
        state.totalPages           = payload.totalPages;
        state.unreadCount          = payload.notifications.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, { payload }) => {
        state.loadingNotifications = false;
        state.notificationsError   = payload ?? 'Failed to load notifications.';
      })

      // ── markNotificationRead — optimistic ───────────────────────────────────
      .addCase(markNotificationRead.pending, (state, { meta }) => {
        state.markingRead   = true;
        state.markReadError = null;
        const id    = meta.arg;
        const notif = state.notifications.find((n) => (n._id ?? n.id) === id);
        if (notif && !notif.isRead) {
          notif.isRead      = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.fulfilled, (state) => {
        state.markingRead = false;
      })
      .addCase(markNotificationRead.rejected, (state, { meta, payload }) => {
        state.markingRead   = false;
        state.markReadError = payload ?? 'Failed to mark notification as read.';
        const id    = meta.arg;
        const notif = state.notifications.find((n) => (n._id ?? n.id) === id);
        if (notif && notif.isRead) {
          notif.isRead      = false;
          state.unreadCount = state.unreadCount + 1;
        }
      })

      // ── markAllNotificationsRead — optimistic ────────────────────────────────
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.markingAllRead     = true;
        state.markAllReadError   = null;
        state._prevNotifications = state.notifications.map((n) => ({ ...n }));
        state.notifications.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.markingAllRead     = false;
        state._prevNotifications = null;
      })
      .addCase(markAllNotificationsRead.rejected, (state, { payload }) => {
        state.markingAllRead   = false;
        state.markAllReadError = payload ?? 'Failed to mark all notifications as read.';
        if (state._prevNotifications) {
          state.notifications      = state._prevNotifications;
          state.unreadCount        = state._prevNotifications.filter((n) => !n.isRead).length;
          state._prevNotifications = null;
        }
      });
  },
});

export const { clearNotifications, addRealtimeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
