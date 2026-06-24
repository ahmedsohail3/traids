import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getConversationsApi, getMessagesApi, markConversationAsReadApi, sendMessageApi, sendFirstMessageApi } from '~services/chatService';
import { buildChatMessageFormData, buildFirstMessageFormData } from '~utils/buildFormData';
import { getErrorMessage } from '~utils';

const DEFAULT_LIMIT = 50;

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getConversationsApi();
      return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ chatId, limit = DEFAULT_LIMIT, skip = 0 }, { rejectWithValue }) => {
    try {
      const res = await getMessagesApi(chatId, limit, skip);
      const messages = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      return { chatId, messages, skip, limit };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const markConversationAsRead = createAsyncThunk(
  'chat/markConversationAsRead',
  async ({ chatId, userType }, { rejectWithValue }) => {
    try {
      await markConversationAsReadApi(chatId);
      const field =
        userType === 'company' ? 'unreadCountCompany' : 'unreadCountSubcontractor';
      return { conversationId: chatId, field };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, attachments = [] }, { rejectWithValue }) => {
    try {
      const formData = buildChatMessageFormData({ conversationId, content, attachments });
      const res      = await sendMessageApi(formData);
      // API returns the created message; fall back to constructing one from input
      const message  = res.data ?? res;
      return { conversationId, message, content, attachments };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendFirstMessage = createAsyncThunk(
  'chat/sendFirstMessage',
  async ({ subcontractorId, content, attachments = [] }, { rejectWithValue, getState }) => {
    try {
      const companyId = getState().profile?.data?._id ?? null;
      console.log('companyId', companyId);
      console.log('subcontractorId', subcontractorId);
      const formData  = buildFirstMessageFormData({ subcontractorId, companyId, content, attachments });
      const res      = await sendFirstMessageApi(formData);
      // Normalise: API may return { data: { conversation, message } } or { conversation, message }
      const body     = res.data ?? res;
      return {
        conversation: body.conversation ?? body,
        message:      body.message      ?? null,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    // Conversations
    conversations:   [],
    loading:         false,
    error:           null,

    // Messages — keyed by chatId for per-chat isolation
    // messagesByChatId[chatId] = { messages: [], pagination: { limit, skip, hasMore } }
    messagesByChatId: {},
    loadingMessages:  false,
    messagesError:    null,

    // Send
    sendingMessage:   false,
    sendMessageError: null,
    // Send first message (new conversation)
    sendingFirstMessage:   false,
    sendFirstMessageError: null,
  },
  reducers: {
    // ── Conversations ──────────────────────────────────────────────────────────
    clearConversations: (state) => {
      state.conversations = [];
      state.error         = null;
    },
    updateConversation: (state, { payload }) => {
      const idx = state.conversations.findIndex((c) => c._id === payload._id);
      if (idx !== -1) {
        state.conversations[idx] = { ...state.conversations[idx], ...payload };
      }
    },
    incrementUnread: (state, { payload: { conversationId, field } }) => {
      const conv = state.conversations.find((c) => c._id === conversationId);
      if (conv && field in conv) {
        conv[field] = (conv[field] ?? 0) + 1;
      }
    },
    markAsRead: (state, { payload: { conversationId, field } }) => {
      const conv = state.conversations.find((c) => c._id === conversationId);
      if (conv) conv[field] = 0;
    },

    // ── Messages ───────────────────────────────────────────────────────────────
    clearMessages: (state, { payload: chatId }) => {
      delete state.messagesByChatId[chatId];
      state.messagesError = null;
    },
    clearAllMessages: (state) => {
      state.messagesByChatId = {};
      state.messagesError    = null;
    },
    // Socket: append a realtime message to its chat (dedup by _id)
    prependMessage: (state, { payload: { chatId, message } }) => {
      const entry = state.messagesByChatId[chatId];
      if (!entry) return;
      const id = message._id ?? message.id;
      const alreadyExists = id
        ? entry.messages.some((m) => (m._id ?? m.id) === id)
        : false;
      if (!alreadyExists) {
        entry.messages.push(message);
        entry.pagination.skip = (entry.pagination.skip ?? 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchConversations ─────────────────────────────────────────────────
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchConversations.fulfilled, (state, { payload }) => {
        state.loading       = false;
        state.conversations = payload;
      })
      .addCase(fetchConversations.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload ?? 'Failed to load conversations.';
      })

      // ── fetchMessages ──────────────────────────────────────────────────────
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
        state.messagesError   = null;
      })
      .addCase(fetchMessages.fulfilled, (state, { payload }) => {
        const { chatId, messages, skip, limit } = payload;
        const existing = state.messagesByChatId[chatId];

        if (skip === 0) {
          // Initial fetch / refresh — replace entire message list for this chat
          state.messagesByChatId[chatId] = {
            messages,
            pagination: {
              limit,
              skip:    messages.length,
              hasMore: messages.length === limit,
            },
          };
        } else {
          // Pagination — prepend older messages (they come in with lower createdAt)
          const prev     = existing?.messages ?? [];
          const combined = [...messages, ...prev];
          state.messagesByChatId[chatId] = {
            messages: combined,
            pagination: {
              limit,
              skip:    (existing?.pagination?.skip ?? 0) + messages.length,
              hasMore: messages.length === limit,
            },
          };
        }

        state.loadingMessages = false;
      })
      .addCase(fetchMessages.rejected, (state, { payload }) => {
        state.loadingMessages = false;
        state.messagesError   = payload ?? 'Failed to load messages.';
      })

      // ── markConversationAsRead ─────────────────────────────────────────────
      // Optimistic: fulfilled fires immediately after the API call succeeds.
      // Only the affected conversation's unread field is zeroed — no refetch needed.
      .addCase(markConversationAsRead.fulfilled, (state, { payload }) => {
        const { conversationId, field } = payload;
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (conv) conv[field] = 0;
      })

      // ── sendMessage ────────────────────────────────────────────────────────
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage   = true;
        state.sendMessageError = null;
      })
      .addCase(sendMessage.fulfilled, (state, { payload }) => {
        const { conversationId, message } = payload;
        state.sendingMessage = false;

        // Insert the returned message into the per-chat cache
        const entry = state.messagesByChatId[conversationId];
        if (entry) {
          entry.messages.push(message);
          entry.pagination.skip += 1;
        }

        // Update the matching conversation's last-message fields
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (conv) {
          const now         = new Date().toISOString();
          const content     = message.content ?? message.text ?? '';
          const attachCount = (message.attachments ?? payload.attachments ?? []).length;
          conv.lastMessage          = content;
          conv.lastAttachmentCount  = content ? 0 : attachCount;
          conv.lastMessageAt        = message.createdAt ?? now;
          conv.updatedAt            = now;
        }
      })
      .addCase(sendMessage.rejected, (state, { payload }) => {
        state.sendingMessage   = false;
        state.sendMessageError = payload ?? 'Failed to send message.';
      })

      // ── sendFirstMessage ───────────────────────────────────────────────────
      .addCase(sendFirstMessage.pending, (state) => {
        state.sendingFirstMessage   = true;
        state.sendFirstMessageError = null;
      })
      .addCase(sendFirstMessage.fulfilled, (state, { payload }) => {
        state.sendingFirstMessage = false;
        const { conversation, message } = payload;
        if (!conversation?._id) return;

        // Prepend new conversation unless it already exists (idempotent)
        const exists = state.conversations.some((c) => c._id === conversation._id);
        if (!exists) state.conversations.unshift(conversation);

        // Seed the message cache so the chat screen shows the first message immediately
        if (message) {
          state.messagesByChatId[conversation._id] = {
            messages:   [message],
            pagination: { limit: 50, skip: 1, hasMore: false },
          };
        }
      })
      .addCase(sendFirstMessage.rejected, (state, { payload }) => {
        state.sendingFirstMessage   = false;
        state.sendFirstMessageError = payload ?? 'Failed to send message.';
      });
  },
});

export const {
  clearConversations,
  updateConversation,
  incrementUnread,
  markAsRead,
  clearMessages,
  clearAllMessages,
  prependMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
