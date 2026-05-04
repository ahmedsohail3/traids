/**
 * CompanyChatScreen — Individual conversation view for Company role.
 * Features: sent/received messages, context menu, deleted states, profile modal.
 */
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Text } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import Header from '~components/Header';
import MessageBubble from '~components/Chat/MessageBubble';
import MessageInput from '~components/Chat/MessageInput';
import ViewProfileModal from '~components/Chat/ViewProfileModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const MY_ID = 'me';

const MOCK_MESSAGES = [
  {
    id: '1', senderId: 'subcontractor', senderName: 'Michael Chen',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=michale',
  },
  {
    id: '2', senderId: MY_ID, senderName: 'Walliamson',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=me',
  },
  {
    id: '3', senderId: 'subcontractor', senderName: 'Michael Chen',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=michale',
  },
  {
    id: '4', senderId: MY_ID, senderName: 'Walliamson',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=me',
  },
  {
    id: '5', senderId: MY_ID, senderName: 'Walliamson',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=me',
  },
];

const MOCK_PROFILE = {
  name: 'Michael Chen',
  role: 'Subcontractor',
  logoEmoji: '👷',
  about: 'I am a highly skilled subcontractor with experience in large scale project management and delivery.',
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const CompanyChatScreen = ({ route }) => {
  const { colors } = useTheme();
  const { conversation } = route?.params || {};
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [profileVisible, setProfileVisible] = useState(false);
  const listRef = useRef(null);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        senderId: MY_ID,
        senderName: 'Walliamson',
        text,
        time: 'Now',
        avatarUri: 'https://i.pravatar.cc/150?u=me',
      },
    ]);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleDelete = (msgId) => {
    setMessages(prev =>
      prev.map(m => m.id !== msgId ? m : {
        ...m,
        deletedForAll: m.senderId === MY_ID ? true : undefined,
        deletedForMe: m.senderId !== MY_ID ? true : undefined,
      })
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <Header
        title="Messages"
        subtitle="Manage your chat system here."
        showBackButton
      />

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => setProfileVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.contactName}>{conversation?.name ?? 'Michael Chen'}</Text>
          <Text style={styles.contactStatus}>Active Now</Text>
        </TouchableOpacity>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isSent={item.senderId === MY_ID}
              onDelete={handleDelete}
            />
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
        />
      </View>

      <ViewProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        profile={MOCK_PROFILE}
      />
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  container: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 40,
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
    color: '#22C55E'
  },

  listContainer: { paddingTop: 16, paddingBottom: 8 },
});

export default CompanyChatScreen;
