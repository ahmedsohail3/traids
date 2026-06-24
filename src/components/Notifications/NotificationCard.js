import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { getNotificationMeta, formatNotificationTime } from '~hooks/useNotifications';

/**
 * Shared notification card used by both NotificationsScreen (compact=false)
 * and NotificationDropdownModal (compact=true).
 *
 * Props:
 *   item     — notification object
 *   onPress  — called with item
 *   compact  — dropdown variant: smaller icon, dot indicator, no sender row
 *   colors   — theme colors (optional; falls back to defaults)
 */
const NotificationCard = React.memo(({ item, onPress, compact = false, colors = {} }) => {
  const meta = getNotificationMeta(item.type);

  const bgColor = compact
    ? '#FFFFFF'
    : item.isRead
    ? (colors.surface ?? '#FFFFFF')
    : '#EFF6FF';

  const iconSize  = compact ? RFValue(16) : RFValue(18);
  const wrapSize  = compact ? RFValue(36) : RFValue(40);
  const msgLines  = compact ? 2 : 3;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconWrap,
          { width: wrapSize, height: wrapSize, borderRadius: wrapSize / 2, backgroundColor: `${meta.color}18` },
        ]}
      >
        <Icon name={meta.icon} size={iconSize} color={meta.color} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text
            style={[styles.title, compact ? styles.titleCompact : styles.titleFull]}
            numberOfLines={1}
          >
            {item.title ?? meta.label}
          </Text>
          <Text style={styles.time}>{formatNotificationTime(item.createdAt)}</Text>
        </View>

        {item.message ? (
          <Text
            style={[styles.message, compact ? styles.messageCompact : styles.messageFull]}
            numberOfLines={msgLines}
          >
            {item.message}
          </Text>
        ) : null}

        {!compact && item.senderName ? (
          <Text style={styles.sender} numberOfLines={1}>From {item.senderName}</Text>
        ) : null}
      </View>

      {/* Unread indicator */}
      {!item.isRead && (
        compact
          ? <View style={styles.unreadDot} />
          : <View style={styles.unreadBar} />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body:    { flex: 1 },
  topRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },

  title:        { flex: 1, color: '#10375C' },
  titleFull:    { fontFamily: FontFamily.semiBold, fontSize: RFValue(12) },
  titleCompact: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11) },

  time: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#94A3B8', marginLeft: 8 },

  message:        { lineHeight: RFValue(14) },
  messageFull:    { fontFamily: FontFamily.regular, fontSize: RFValue(11), lineHeight: RFValue(15), marginBottom: 4 },
  messageCompact: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B' },

  sender: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#F2A154' },

  // Full-screen: vertical orange bar on right
  unreadBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: '#F2A154',
    borderRadius: 2,
    flexShrink: 0,
  },
  // Dropdown: small orange dot on top-right
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2A154',
    alignSelf: 'flex-start',
    marginTop: 4,
    flexShrink: 0,
  },
});

export default NotificationCard;
