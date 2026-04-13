/**
 * ChatListItem — shared component for chat conversation list previews.
 * Used by both Subcontractor and Company chat list screens.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '~components/Common';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';

const ChatListItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={() => onPress(item)} activeOpacity={0.7}>
    <View style={styles.avatarWrap}>
      {item.avatarUri ? (
        <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{item.name?.[0] ?? '?'}</Text>
        </View>
      )}
      {item.isOnline && <View style={styles.onlineDot} />}
    </View>

    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
    </View>

    <View style={styles.meta}>
      <Text style={styles.time}>{item.time}</Text>
      {item.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
    color: '#10375C',
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5, borderColor: '#FFFFFF',
  },
  info: { flex: 1 },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11.5),
    color: '#10375C',
    marginBottom: 3,
  },
  preview: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  meta: { alignItems: 'flex-end', gap: 6 },
  time: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
  },
  badge: {
    backgroundColor: '#F97316',
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(8),
    color: '#FFFFFF',
  },
});

export default ChatListItem;
