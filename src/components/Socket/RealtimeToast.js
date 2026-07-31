/**
 * RealtimeToast
 *
 * A non-blocking banner that slides in from the top when a new realtime
 * event arrives and auto-dismisses after 4 seconds.
 * Mounted once inside each role navigator — never inside a screen.
 */
import { useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { clearLatestEvent } from '~redux/reducers/socketSlice';
import useRealtimeNotifications from '~hooks/useRealtimeNotifications';
import {
  getNotificationMeta,
  resolveNotificationRoute,
  getRoleStackRoute,
} from '~hooks/useNotifications';

const TOAST_DURATION_MS = 4000;
const SLIDE_MS          = 280;

const RealtimeToast = () => {
  const dispatch        = useDispatch();
  const insets          = useSafeAreaInsets();
  const navigation      = useNavigation();
  const { latestEvent } = useRealtimeNotifications();
  const conversations   = useSelector((s) => s.chat?.conversations ?? []);
  const userType        = useSelector((s) => s.auth?.user?.type ?? 'company');

  const translateY   = useRef(new Animated.Value(-120)).current;
  const timerRef     = useRef(null);
  const currentIdRef = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue:         -120,
      duration:        SLIDE_MS,
      useNativeDriver: true,
    }).start(() => dispatch(clearLatestEvent()));
  }, [dispatch, translateY]);

  const show = useCallback(() => {
    Animated.timing(translateY, {
      toValue:         0,
      duration:        SLIDE_MS,
      useNativeDriver: true,
    }).start();

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(hide, TOAST_DURATION_MS);
  }, [translateY, hide]);

  // Tapping the toast opens whatever the event refers to — the conversation, the
  // job, etc. The toast sits outside the role navigator's stack, so its navigation
  // object is RootNavigator's: target the screen through its parent route.
  const handlePress = useCallback(() => {
    hide();

    const route = resolveNotificationRoute(latestEvent, { userType, conversations });
    if (!route) return;

    navigation.navigate(getRoleStackRoute(userType), {
      screen: route.name,
      params: route.params,
    });
  }, [hide, latestEvent, conversations, navigation, userType]);

  useEffect(() => {
    if (!latestEvent) return;
    // Only animate in if it's a new event
    if (latestEvent.id === currentIdRef.current) return;
    currentIdRef.current = latestEvent.id;
    show();
  }, [latestEvent, show]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!latestEvent) return null;

  const meta = getNotificationMeta(latestEvent.type);

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8, transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${meta.color}20` }]}>
          <Icon name={meta.icon} size={RFValue(16)} color={meta.color} />
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {latestEvent.title}
          </Text>
          {latestEvent.message ? (
            <Text style={styles.message} numberOfLines={2}>
              {latestEvent.message}
            </Text>
          ) : null}
          {latestEvent.senderName ? (
            <Text style={styles.sender} numberOfLines={1}>
              From {latestEvent.senderName}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity onPress={hide} hitSlop={8} style={styles.closeBtn}>
          <Icon name="close" size={RFValue(12)} color="#64748B" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position:   'absolute',
    left:       16,
    right:      16,
    zIndex:     9999,
    elevation:  20,
  },
  toast: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#FFFFFF',
    borderRadius:     14,
    paddingHorizontal: 14,
    paddingVertical:  12,
    gap:              10,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 4 },
    shadowOpacity:    0.14,
    shadowRadius:     12,
    elevation:        10,
    borderLeftWidth:  3,
    borderLeftColor:  '#F2A154',
  },
  iconWrap: {
    width:          RFValue(34),
    height:         RFValue(34),
    borderRadius:   RFValue(17),
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  body:    { flex: 1 },
  title:   { fontFamily: FontFamily.semiBold, fontSize: RFValue(11), color: '#10375C', marginBottom: 2 },
  message: { fontFamily: FontFamily.regular,  fontSize: RFValue(10), color: '#64748B', lineHeight: RFValue(14) },
  sender:  { fontFamily: FontFamily.medium,   fontSize: RFValue(9),  color: '#F2A154', marginTop: 2 },
  closeBtn:{ padding: 2 },
});

export default RealtimeToast;
