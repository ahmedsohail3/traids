import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MessageCircle } from 'lucide-react-native';
import { Text } from '~components/Common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import Header from '~components/Header';
import MessageBubble from '~components/Chat/MessageBubble';
import DaySeparator from '~components/Chat/DaySeparator';
import MessageInput from '~components/Chat/MessageInput';
import ViewProfileModal from '~components/Chat/ViewProfileModal';
import useChat, { withDaySeparators, DAY_SEPARATOR } from '~hooks/useChat';
import useAlert from '~hooks/useAlert';
import useKeyboardInset from '~hooks/useKeyboardInset';
import useConversationSocket from '~hooks/useConversationSocket';
import useSocket from '~hooks/useSocket';

// Breathing room between the message input and the top of the keyboard.
const KEYBOARD_GAP = 24;

// Safety valve for the scroll-to-bottom retries, so a list that can't reach its
// end (bad measurement) can't spin forever.
const MAX_PIN_ATTEMPTS = 15;

const CompanyChatScreen = ({ route }) => {
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const { showAlert } = useAlert();

  // Two modes:
  //   Existing: route.params.conversation  → raw conversation object with _id
  //   New:      route.params.subcontractorId + subName + subAvatarUri
  const { conversation, subcontractorId: paramSubId, subName: paramSubName, subAvatarUri: paramSubAvatar } = route?.params ?? {};

  // Active conversation — may start null in new-conversation mode and get set after first message
  const [activeConversation, setActiveConversation] = useState(conversation ?? null);
  const activeChatId = activeConversation?._id ?? null;

  const subData  = activeConversation?.subcontractor ?? {};
  const chatName = subData.fullName ?? activeConversation?.name ?? paramSubName ?? 'Chat';

  const {
    getMessagesForChat,
    getPaginationForChat,
    loadingMessages,
    getMessages,
    loadMoreMessages,
    resetMessages,
    markConversationAsRead,
    sendMessage,
    sendingMessage,
    sendFirstMessage,
    sendingFirstMessage,
  } = useChat();

  const isSending = sendingMessage || sendingFirstMessage;

  const { connected, connectionStatus } = useSocket();

  // Join/leave conversation room + receive message:new in real time
  useConversationSocket(activeChatId, {
    onNewMessage: (msg) => {
      if (__DEV__) console.log('[Socket ✓] message:new received in room', activeChatId, msg);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    },
  });

  // DEV: log socket + room state on every relevant change
  useEffect(() => {
    if (!__DEV__) return;
    console.log('[Socket] status:', connectionStatus, '| connected:', connected, '| room:', activeChatId ?? 'none');
  }, [connected, connectionStatus, activeChatId]);

  const [profileVisible, setProfileVisible] = useState(false);
  const bottomGap = Math.max(insets.bottom, 16);
  const { keyboardInset, keyboardVisible, onLayout } = useKeyboardInset(insets.bottom);
  const listRef      = useRef(null);
  const loadGuardRef = useRef(false);
  // While false the list stays pinned to the newest message as rows render in.
  const openedAtBottomRef = useRef(false);
  const pinAttemptsRef    = useRef(0);

  // Fetch on mount when an existing chatId is available; clear cache on unmount
  useEffect(() => {
    if (activeChatId) {
      getMessages(activeChatId);
      markConversationAsRead(activeChatId);
    }
    return () => { if (activeChatId) resetMessages(activeChatId); };
  }, [activeChatId]); // intentionally omit stable callbacks

  const apiMessages = useMemo(
    () => getMessagesForChat(activeChatId, activeConversation),
    [getMessagesForChat, activeChatId, activeConversation],
  );

  // Message rows plus a "Today"/"Yesterday"/date header before each day group.
  const listData = useMemo(() => withDaySeparators(apiMessages), [apiMessages]);

  const pagination = getPaginationForChat(activeChatId);

  // Open on the latest message. A one-shot timer can't do this reliably — the
  // FlatList renders in batches, so the content keeps growing after the first
  // frame. Instead we re-pin to the end on every content size change until the
  // user takes over by dragging.
  useEffect(() => {
    openedAtBottomRef.current = false; // new conversation → land at the bottom again
    pinAttemptsRef.current    = 0;
  }, [activeChatId]);

  const handleContentSizeChange = useCallback(() => {
    if (openedAtBottomRef.current) return;
    pinAttemptsRef.current = 0; // content grew — this is a fresh run at the bottom
    listRef.current?.scrollToEnd({ animated: false });
  }, []);

  const handleListLayout = useCallback(() => {
    if (openedAtBottomRef.current) return;
    listRef.current?.scrollToEnd({ animated: false });
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    openedAtBottomRef.current = true; // hand scroll position back to the user
  }, []);

  // Opening the keyboard shrinks the list, which leaves the newest message
  // hidden below the fold. Re-reveal it in the smaller viewport — keyed on the
  // inset too, so keyboard height changes (autocorrect bar, emoji switch) also
  // re-settle at the bottom.
  useEffect(() => {
    if (!keyboardVisible) return;
    const frame = requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [keyboardVisible, keyboardInset]);

  // ── Scroll: pagination + finishing the initial pin ───────────────────────────
  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;

      // Load earlier messages only once the pin is released, i.e. only for
      // user-driven scrolls. Our own scrollToEnd emits onScroll events that
      // start at y = 0, which would otherwise page in history on open.
      if (openedAtBottomRef.current) {
        if (contentOffset.y < 80 && pagination.hasMore && !loadingMessages && !loadGuardRef.current) {
          loadGuardRef.current = true;
          loadMoreMessages(activeChatId);
          setTimeout(() => { loadGuardRef.current = false; }, 1500);
        }
        return;
      }

      // Still pinning: one scrollToEnd lands short because rows are measured in
      // batches and offscreen heights are only estimates, so the content grows
      // mid-scroll. Re-aim until we actually reach the end.
      const distanceFromEnd = contentSize.height - contentOffset.y - layoutMeasurement.height;
      if (distanceFromEnd > 2 && pinAttemptsRef.current < MAX_PIN_ATTEMPTS) {
        pinAttemptsRef.current += 1;
        listRef.current?.scrollToEnd({ animated: false });
      }
    },
    [activeChatId, loadMoreMessages, pagination.hasMore, loadingMessages],
  );

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(({ text, attachments = [] }) => {
    if ((!text && attachments.length === 0) || isSending) return;

    if (activeChatId) {
      // Existing conversation — normal send
      sendMessage({ conversationId: activeChatId, content: text, attachments }).then(() => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      });
    } else {
      // New conversation — send first message, then transition into normal mode
      sendFirstMessage({ subcontractorId: paramSubId, content: text, attachments })
        .then(({ conversation: newConv }) => {
          if (newConv?._id) {
            setActiveConversation(newConv);
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
          }
        })
        .catch((err) => {
          showAlert({ title: 'Error', message: err ?? 'Failed to send message.', type: 'error' });
        });
    }
  }, [isSending, activeChatId, sendMessage, sendFirstMessage, paramSubId, showAlert]);

  const handleDelete = useCallback((_msgId) => {
    // deletion is not yet supported by the API
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      item.type === DAY_SEPARATOR
        ? <DaySeparator label={item.label} />
        : (
          <MessageBubble
            message={item}
            isSent={item.isSent}
            onDelete={handleDelete}
          />
        )
    ),
    [handleDelete],
  );

  const keyExtractor = useCallback((item) => item.id ?? item._id, []);

  const ListHeader = useMemo(() => {
    if (!pagination.hasMore) return null;
    return (
      <View style={styles.loadMoreWrap}>
        {loadingMessages ? (
          <ActivityIndicator size="small" color="#10375C" />
        ) : (
          <TouchableOpacity
            onPress={() => loadMoreMessages(activeChatId)}
            style={styles.loadMoreBtn}
            activeOpacity={0.7}>
            <Text style={styles.loadMoreText}>Load earlier messages</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [pagination.hasMore, loadingMessages, activeChatId, loadMoreMessages]);

  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <MessageCircle size={RFValue(32)} color="#CBD5E1" strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySub}>Start the conversation below.</Text>
    </View>
  );

  const profile = useMemo(() => ({
    name:      chatName,
    role:      subData.primaryTrade ?? 'Subcontractor',
    logoEmoji: '👷',
    about:     subData.about ?? '',
    avatarUri: subData.profileImage ?? paramSubAvatar ?? null,
  }), [chatName, subData, paramSubAvatar]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Messages" subtitle="Manage your chat system here." showBackButton />

      <View style={styles.fill} onLayout={onLayout}>
        <View style={[styles.container, { marginBottom: keyboardVisible ? keyboardInset + KEYBOARD_GAP : bottomGap }]}>
          {/* Contact bar */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => setProfileVisible(true)}
            activeOpacity={0.8}>
            <Text style={styles.contactName}>{chatName}</Text>
            {__DEV__ ? (
              <View style={styles.socketDebugRow}>
                <View style={[styles.socketDot, { backgroundColor: connected ? '#22C55E' : connectionStatus === 'connecting' ? '#F59E0B' : '#EF4444' }]} />
                <Text style={[styles.socketDebugLabel, { color: connected ? '#22C55E' : connectionStatus === 'connecting' ? '#F59E0B' : '#EF4444' }]}>
                  {connected ? `Socket connected · room ${activeChatId ? 'joined' : 'pending'}` : connectionStatus}
                </Text>
              </View>
            ) : (
              <Text style={[styles.contactStatus, { color: colors.success }]}>Active Now</Text>
            )}
          </TouchableOpacity>

          {/* Initial loading */}
          {loadingMessages && apiMessages.length === 0 && (
            <View style={styles.centerLoader}>
              <ActivityIndicator size="small" color="#10375C" />
            </View>
          )}

          {/* Message list */}
          {(!loadingMessages || apiMessages.length > 0) && (
            <FlatList
              ref={listRef}
              data={listData}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListHeaderComponent={ListHeader}
              ListEmptyComponent={EmptyState}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              onScrollBeginDrag={handleScrollBeginDrag}
              onContentSizeChange={handleContentSizeChange}
              onLayout={handleListLayout}
              scrollEventThrottle={32}
              removeClippedSubviews
              maxToRenderPerBatch={20}
              windowSize={10}
            />
          )}

          <MessageInput
            onSend={handleSend}
            sendingMessage={isSending}
          />
        </View>
      </View>

      <ViewProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        profile={profile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root:      { flex: 1 },
  fill:      { flex: 1 },
  container: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  contactRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EFEFEF',
  },
  contactName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(14),
    color: '#10375C',
    marginBottom: 2,
  },
  contactStatus: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#22C55E',
  },
  socketDebugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  socketDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  socketDebugLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  listContent: { paddingTop: 12, paddingBottom: 8, flexGrow: 1 },
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadMoreWrap: { alignItems: 'center', paddingVertical: 12 },
  loadMoreBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadMoreText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(13),
    color: '#10375C',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
});

export default CompanyChatScreen;
