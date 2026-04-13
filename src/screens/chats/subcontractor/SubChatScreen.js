/**
 * SubChatScreen — Individual conversation view for Subcontractor.
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
    id: '1', senderId: 'company', senderName: 'Acme Construction',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=company1',
  },
  {
    id: '2', senderId: MY_ID, senderName: 'Walliamson',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=me',
  },
  {
    id: '3', senderId: 'company', senderName: 'Acme Construction',
    text: 'At that time, no one was truly happy.',
    time: 'Yesterday at 10:44 AM',
    avatarUri: 'https://i.pravatar.cc/150?u=company1',
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
  name: 'Acme Construction',
  role: 'Residential Construction',
  logoEmoji: '🏗️',
  about: 'BuildRight Construction is a premier construction and infrastructure contractor dedicated to delivering excellence in every project. With over 15 years of industry experience, we specialize in commercial fit-outs, residential developments, and large-scale renovation projects.',
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const SubChatScreen = ({ route }) => {
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
      {/* Dark blue app header with back arrow */}
      <Header
        title="Messages"
        subtitle="Manage your chat system here."
        showBackButton
      />

      {/* Chat container card */}
      <View style={styles.container}>

      {/* Contact name + "Active Now" — tappable to open profile modal */}
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => setProfileVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.contactName}>{conversation?.name ?? 'Acme Construction'}</Text>
        <Text style={styles.contactStatus}>Active Now</Text>
      </TouchableOpacity>

        {/* Messages */}
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

        {/* Input */}
        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
        />
      </View>

      {/* Profile bottom sheet */}
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
  },

  listContainer: { paddingTop: 16, paddingBottom: 8 },
});

export default SubChatScreen;
