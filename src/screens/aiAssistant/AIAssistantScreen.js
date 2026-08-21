/**
 * AIAssistantScreen — "AI Help Assistant"
 *
 * Opened from the dashboard FAB. Two states, both from the Figma design:
 *   • Empty        — orb, greeting and quick-action pills (no messages yet)
 *   • Conversation — bot / user bubbles, response actions, suggested questions
 *
 * All content is hardcoded (see CANNED_* below) until the assistant endpoint
 * exists — sending a message seeds the greeting, echoes what was typed and
 * replies with the canned answer.
 */
import { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Send,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react-native';
import { Text, GradientBackground } from '~components/Common';
import useKeyboardInset from '~hooks/useKeyboardInset';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';

// ─── Hardcoded content (replace with the assistant API) ───────────────────────

const QUICK_ACTIONS = [
  'Conversation History',
  'Help Articles',
  'Contact Support',
  'Talk to Human',
  'Upload Screenshot',
];

const CANNED_GREETING = {
  id: 'greeting',
  from: 'bot',
  title: '👋 Hi James! How can I help you today?',
  body: 'I can answer questions about jobs, subcontractors, payments, subscriptions, invoices, contracts, account settings, and platform features.',
};

const CANNED_ANSWER = {
  from: 'bot',
  title: 'To post a new job, follow these steps:',
  body: [
    '1. Go to Jobs from the sidebar',
    '2. Click "Post New Job" button',
    '3. Enter project details and requirements',
    '4. Set your budget range',
    '5. Review and Publish',
  ].join('\n'),
  showActions: true,
  followUp: 'What details to include?',
};

const SUGGESTED_QUESTIONS = [
  'How do I hire a subcontractor?',
  'How do subscriptions work?',
  'Where can I view invoices?',
];

// ─── Header ───────────────────────────────────────────────────────────────────

const AssistantHeader = ({ onBack, topInset }) => (
  <View style={[styles.header, { paddingTop: topInset + 10 }]}>
    <TouchableOpacity style={styles.backWrap} onPress={onBack} activeOpacity={0.7}>
      <ChevronLeft size={RFValue(14)} color="#0F172A" strokeWidth={2.5} />
    </TouchableOpacity>
    <GradientBackground style={styles.headerAvatar}>
      <Image source={Images.aiBotWhite} style={styles.headerBot} resizeMode="contain" />
    </GradientBackground>
    <View>
      <Text style={styles.headerTitle}>AI Help Assistant</Text>
      <Text style={styles.headerSubtitle}>Your Smart Platform Assistant</Text>
    </View>
  </View>
);

// ─── Message pieces ───────────────────────────────────────────────────────────

const BotAvatar = () => (
  <GradientBackground style={styles.botAvatar}>
    <Image source={Images.aiBotWhite} style={styles.botAvatarIcon} resizeMode="contain" />
  </GradientBackground>
);

const BotMessage = ({ message }) => (
  <View style={styles.botRow}>
    <BotAvatar />
    <View style={styles.botBody}>
      <View style={styles.botCard}>
        <Text style={styles.botTitle}>{message.title}</Text>
        <Text style={styles.botText}>{message.body}</Text>
      </View>

      {message.showActions && (
        <View style={styles.actionsRow}>
          <Copy size={RFValue(11)} color="#94A3B8" strokeWidth={2} />
          <RefreshCw size={RFValue(11)} color="#94A3B8" strokeWidth={2} />
          <ThumbsUp size={RFValue(11)} color="#94A3B8" strokeWidth={2} />
          <ThumbsDown size={RFValue(11)} color="#94A3B8" strokeWidth={2} />
          {message.followUp && (
            <View style={styles.followUpChip}>
              <Text style={styles.followUpText}>{message.followUp}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  </View>
);

const UserMessage = ({ message }) => (
  <View style={styles.userRow}>
    <GradientBackground style={styles.userBubble}>
      <Text style={styles.userText}>{message.body}</Text>
    </GradientBackground>
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ onQuickAction }) => (
  <View style={styles.empty}>
    <Image source={Images.aiAssistantOrb} style={styles.orb} resizeMode="contain" />
    <View style={styles.orbShadow} />
    <Text style={styles.emptyTitle}>How can I help you today?</Text>
    <Text style={styles.emptySubtitle}>
      Ready to hire? Let's find qualified candidates together today.
    </Text>
    <View style={styles.pills}>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action}
          activeOpacity={0.8}
          onPress={() => onQuickAction(action)}
          style={styles.pill}>
          <Text style={styles.pillText}>{action}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const AIAssistantScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { keyboardInset, keyboardVisible, onLayout } = useKeyboardInset(insets.bottom);
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  const send = useCallback((text) => {
    const question = text.trim();
    if (!question) return;
    setDraft('');
    setMessages((prev) => {
      // The greeting only appears once the conversation actually starts.
      const base = prev.length === 0 ? [CANNED_GREETING] : prev;
      const turn = base.length;
      return [
        ...base,
        { id: `user-${turn}`, from: 'user', body: question },
        { ...CANNED_ANSWER, id: `bot-${turn}` },
      ];
    });
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const hasConversation = messages.length > 0;
  const bottomGap = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={onLayout}>
      <AssistantHeader onBack={() => navigation.goBack()} topInset={insets.top} />

      {hasConversation ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.conversation}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {messages.map((message) =>
            message.from === 'bot' ? (
              <BotMessage key={message.id} message={message} />
            ) : (
              <UserMessage key={message.id} message={message} />
            ),
          )}

          {/* Suggested questions */}
          <Text style={styles.suggestedLabel}>SUGGESTED QUESTIONS</Text>
          <View style={styles.suggestedList}>
            {SUGGESTED_QUESTIONS.map((question) => (
              <TouchableOpacity
                key={question}
                activeOpacity={0.8}
                onPress={() => send(question)}
                style={styles.questionItem}>
                <Text style={styles.questionText} numberOfLines={1}>
                  • {question}
                </Text>
                <ChevronRight size={RFValue(11)} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <EmptyState onQuickAction={send} />
      )}

      {/* Sticky input */}
      <View
        style={[
          styles.inputWrap,
          { paddingBottom: keyboardVisible ? keyboardInset + 12 : bottomGap },
        ]}>
        <View style={styles.inputBar}>
          <Paperclip size={RFValue(14)} color="#94A3B8" strokeWidth={2} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask anything about the platform..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={() => send(draft)}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => send(draft)}
            style={styles.sendButton}>
            <Send size={RFValue(12)} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backWrap: {
    width: RFValue(28),
    height: RFValue(28),
    borderRadius: RFValue(28) / 2,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: RFValue(32),
    height: RFValue(32),
    borderRadius: RFValue(32) / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBot: { width: RFValue(15), height: RFValue(15) },
  headerTitle: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: RFValue(9),
    fontFamily: FontFamily.regular,
    color: '#64748B',
    marginTop: 2,
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  orb: { width: RFValue(110), height: RFValue(110) },
  orbShadow: {
    width: RFValue(96),
    height: RFValue(10),
    borderRadius: RFValue(48),
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    marginTop: -6,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: RFValue(18),
    fontFamily: FontFamily.bold,
    color: '#10375C',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
    fontFamily: FontFamily.regular,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
  },
  pill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.medium,
    color: '#0F172A',
  },

  // Conversation
  conversation: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  botAvatar: {
    width: RFValue(22),
    height: RFValue(22),
    borderRadius: RFValue(22) / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatarIcon: { width: RFValue(11), height: RFValue(11) },
  botBody: { flex: 1, gap: 8 },
  botCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderTopLeftRadius: 2,
    padding: 14,
    gap: 6,
  },
  botTitle: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
    color: '#0F172A',
  },
  botText: {
    fontSize: RFValue(11),
    lineHeight: RFValue(16),
    fontFamily: FontFamily.regular,
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followUpChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  followUpText: {
    fontSize: RFValue(8),
    fontFamily: FontFamily.medium,
    color: '#475569',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    borderBottomRightRadius: 2,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userText: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    color: '#FFFFFF',
  },

  // Suggested questions
  suggestedLabel: {
    fontSize: RFValue(9),
    fontFamily: FontFamily.bold,
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 8,
  },
  suggestedList: { gap: 6 },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
  },
  questionText: {
    flex: 1,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    color: '#64748B',
  },

  // Input
  inputWrap: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: RFValue(42),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    color: '#0F172A',
  },
  sendButton: {
    width: RFValue(28),
    height: RFValue(28),
    borderRadius: RFValue(28) / 2,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AIAssistantScreen;
