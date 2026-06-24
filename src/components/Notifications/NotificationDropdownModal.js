import React, { useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Modal, TouchableOpacity,
  TouchableWithoutFeedback, ActivityIndicator, FlatList,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useAlertContext } from '~providers/AlertProvider';
import useNotifications, {
  handleNotificationPress,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '~hooks/useNotifications';
import NotificationCard from './NotificationCard';

const NotificationDropdownModal = ({ visible, onClose, navigation }) => {
  const { notifications, loadingNotifications, getNotifications } = useNotifications();
  const { markAsRead }                = useMarkNotificationRead();
  const { markAllRead, markingAllRead } = useMarkAllNotificationsRead();
  const { showConfirm }               = useAlertContext();

  useEffect(() => {
    if (visible) getNotifications();
  }, [visible]);

  const preview = notifications.slice(0, 3);

  const handleItemPress = useCallback((item) => {
    onClose();
    handleNotificationPress(item, navigation, markAsRead);
  }, [onClose, navigation, markAsRead]);

  const handleMarkAllRead = useCallback(() => {
    showConfirm({
      title:       'Mark All as Read',
      message:     'Mark all notifications as read?',
      confirmText: 'Mark All',
      cancelText:  'Cancel',
      onConfirm:   () => markAllRead(),
    });
  }, [showConfirm, markAllRead]);

  const handleShowMore = useCallback(() => {
    onClose();
    navigation?.navigate?.('Notifications');
  }, [onClose, navigation]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dropdown}>

              {/* Header */}
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Notifications</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    onPress={handleMarkAllRead}
                    disabled={markingAllRead}
                    hitSlop={8}
                  >
                    <Text style={styles.markAllText}>
                      {markingAllRead ? 'Marking…' : 'Mark All Read'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeBtn}>
                    <Icon name="close" size={RFValue(16)} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content */}
              {loadingNotifications ? (
                <View style={styles.center}>
                  <ActivityIndicator size="small" color="#10375C" />
                </View>
              ) : preview.length === 0 ? (
                <View style={styles.center}>
                  <Icon name="notifications-off-outline" size={RFValue(28)} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                <FlatList
                  data={preview}
                  keyExtractor={(item) => item._id ?? String(item.id)}
                  renderItem={({ item }) => (
                    <NotificationCard
                      item={item}
                      onPress={handleItemPress}
                      compact
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  scrollEnabled={false}
                />
              )}

              {/* Show More */}
              {!loadingNotifications && (
                <TouchableOpacity style={styles.showMoreBtn} onPress={handleShowMore} activeOpacity={0.7}>
                  <Text style={styles.showMoreText}>Show All Notifications</Text>
                  <Icon name="chevron-forward" size={RFValue(13)} color="#F2A154" />
                </TouchableOpacity>
              )}

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    paddingTop: RFValue(88),
    paddingHorizontal: 16,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },

  // Header
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#F2A154',
  },
  closeBtn: {},

  separator: { height: 1, backgroundColor: '#F8FAFC', marginHorizontal: 16 },

  // States
  center:    { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, gap: 10 },
  emptyText: { fontFamily: FontFamily.regular, fontSize: RFValue(11), color: '#94A3B8' },

  // Show more
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  showMoreText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#F2A154',
  },
});

export default NotificationDropdownModal;
