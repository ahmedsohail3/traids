import { useEffect, useCallback, useMemo } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { useAlertContext } from '~providers/AlertProvider';
import useNotifications, {
  useNotificationPress,
  useMarkAllNotificationsRead,
} from '~hooks/useNotifications';
import NotificationCard from '~components/Notifications/NotificationCard';

const NotificationsScreen = ({ navigation }) => {
  const { colors }                                                  = useTheme();
  const { notifications, loadingNotifications, getNotifications }   = useNotifications();
  const { markAllRead, markingAllRead }                             = useMarkAllNotificationsRead();
  const { showConfirm }                                             = useAlertContext();

  useEffect(() => { getNotifications(); }, []);

  const handlePress = useNotificationPress(navigation);

  const handleMarkAllRead = useCallback(() => {
    showConfirm({
      title:       'Mark All as Read',
      message:     'Mark all notifications as read?',
      confirmText: 'Mark All',
      cancelText:  'Cancel',
      onConfirm:   () => markAllRead(),
    });
  }, [showConfirm, markAllRead]);

  const keyExtractor = useCallback((item) => item._id ?? String(item.id), []);

  const renderItem = useCallback(
    ({ item }) => (
      <NotificationCard
        item={item}
        onPress={handlePress}
        colors={colors}
      />
    ),
    [handlePress, colors],
  );

  const renderEmpty = useCallback(() => {
    if (loadingNotifications) return null;
    return (
      <View style={styles.emptyWrap}>
        <Icon name="notifications-off-outline" size={RFValue(40)} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptySub}>
          You'll see updates about your jobs, messages, and offers here.
        </Text>
      </View>
    );
  }, [loadingNotifications]);

  const ItemSeparator = useMemo(
    () => () => <View style={styles.separator} />,
    [],
  );

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Notifications"
        subtitle="Stay updated with your latest activity."
        showBackButton
      />

      {loadingNotifications && notifications.length === 0 && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#10375C" />
        </View>
      )}

      <View style={styles.listWrap}>
        {/* Mark All Read toolbar — only shown when there are unread items */}
        {hasUnread && (
          <View style={styles.toolbar}>
            <TouchableOpacity
              onPress={handleMarkAllRead}
              disabled={markingAllRead}
              style={styles.markAllBtn}
              activeOpacity={0.7}
            >
              <Icon name="checkmark-done-outline" size={RFValue(14)} color="#F2A154" />
              <Text style={styles.markAllText}>
                {markingAllRead ? 'Marking…' : 'Mark All as Read'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={notifications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={ItemSeparator}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loadingNotifications}
              onRefresh={getNotifications}
              colors={['#10375C']}
              tintColor="#10375C"
            />
          }
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyContainer : styles.listContent
          }
          removeClippedSubviews
          maxToRenderPerBatch={15}
          windowSize={10}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root:        { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listWrap: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markAllText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#F2A154',
  },

  listContent:    { paddingVertical: 8 },
  emptyContainer: { flex: 1 },
  separator:      { height: 1, backgroundColor: '#F8FAFC', marginHorizontal: 16 },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  emptySub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: RFValue(15),
  },
});

export default NotificationsScreen;
