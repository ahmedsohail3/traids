/**
 * MessageBubble — shared component for individual chat messages.
 * Renders sent (right) and received (left) messages differently.
 * Supports context menu (Edit/Reply/Copy/Delete) on long press.
 */
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Image, Modal } from 'react-native';
import { Text } from '~components/Common';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Check } from 'lucide-react-native';

const MENU_ITEMS = ['Edit', 'Reply', 'Copy', 'Delete Message'];

const MessageBubble = ({ message, isSent, onDelete }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  if (message.deletedForAll) {
    return (
      <View style={[styles.row, isSent ? styles.rowRight : styles.rowLeft]}>
        <View style={styles.deletedBubble}>
          <Text style={styles.deletedText}>🚫 You deleted this message</Text>
        </View>
      </View>
    );
  }

  if (message.deletedForMe) {
    return (
      <View style={[styles.row, isSent ? styles.rowRight : styles.rowLeft]}>
        <View style={styles.deletedBubble}>
          <Text style={styles.deletedText}>🚫 Message deleted for me</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.row, isSent ? styles.rowRight : styles.rowLeft]}>
        {/* Received: avatar on left */}
        {!isSent && (
          <Image
            source={{ uri: message.avatarUri || `https://i.pravatar.cc/150?u=${message.senderId}` }}
            style={styles.avatar}
          />
        )}

        <View style={[styles.col, isSent ? styles.colRight : styles.colLeft]}>
          {/* Sender name + time */}
          <View style={[styles.metaRow, isSent ? styles.metaRowRight : styles.metaRowLeft]}>
            {!isSent && <Text style={styles.senderName}>{message.senderName}</Text>}
            <Text style={styles.metaTime}>{message.time}</Text>
            {isSent && <Text style={styles.senderName}>{message.senderName}</Text>}
          </View>

          <View style={[styles.bubbleRow, isSent ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
            {/* Context menu trigger */}
            {isSent && (
              <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuDots}>
                <Text style={styles.menuDotsText}>•••</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onLongPress={() => setMenuVisible(true)}
              activeOpacity={0.85}
              style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}
            >
              <Text style={[styles.bubbleText, isSent && styles.bubbleTextSent]}>
                {message.text}
              </Text>
            </TouchableOpacity>

            {/* Read receipt (sent only) */}
            {isSent && (
              <View style={styles.ticks}>
                <Check size={RFValue(9)} color="#94A3B8" strokeWidth={3} />
                <Check size={RFValue(9)} color="#94A3B8" strokeWidth={3} style={{ marginLeft: -4 }} />
              </View>
            )}

            {/* MoreMenu for received */}
            {!isSent && (
              <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuDots}>
                <Text style={styles.menuDotsText}>•••</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sent: avatar on right */}
        {isSent && (
          <Image
            source={{ uri: message.avatarUri || `https://i.pravatar.cc/150?u=me` }}
            style={styles.avatar}
          />
        )}
      </View>

      {/* Context menu modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuCard}>
                {MENU_ITEMS.map((label, idx) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.menuItem, idx < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
                    onPress={() => {
                      setMenuVisible(false);
                      if (label === 'Delete Message') onDelete?.(message.id);
                    }}
                  >
                    <Text style={[styles.menuItemText, label === 'Delete Message' && styles.menuItemDelete]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E2E8F0' },
  col: { maxWidth: '72%' },
  colLeft: { alignItems: 'flex-start' },
  colRight: { alignItems: 'flex-end' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaRowLeft: { justifyContent: 'flex-start' },
  metaRowRight: { justifyContent: 'flex-end' },
  senderName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9.5),
  },
  metaTime: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(8.5),
    color: '#475569',
  },
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleReceived: {
    backgroundColor: '#10375C',
    borderTopLeftRadius: 2,
  },
  bubbleSent: {
    backgroundColor: '#EFEFEF',
    borderTopRightRadius: 2,
  },
  bubbleText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#FFFFFF',
    lineHeight: RFValue(16),
  },
  bubbleTextSent: { color: '#10375C' },
  ticks: { flexDirection: 'row', alignSelf: 'flex-end', marginBottom: 2 },
  menuDots: { padding: 4 },
  menuDotsText: {
    fontSize: RFValue(10),
    color: '#94A3B8',
    letterSpacing: -2,
  },
  // Deleted states
  deletedBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deletedText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  // Context menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: { paddingVertical: 13, paddingHorizontal: 18 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuItemText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11.5),
    color: '#10375C',
  },
  menuItemDelete: { color: '#EF4444', fontFamily: FontFamily.semiBold },
});

export default MessageBubble;
