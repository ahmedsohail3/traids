/**
 * OfflineBanner
 *
 * Persistent bar shown whenever the app cannot reach the network — either the
 * device reports no connection, or a request failed to land. Stays up until
 * connectivity returns, unlike RealtimeToast which auto-dismisses: this is a
 * state the user needs to keep seeing, not an event that passed.
 *
 * Mounted once inside each role navigator — never inside a screen.
 */
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import { WifiOff } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import Text from './Text';
import { FontFamily } from '~theme/fonts';
import { selectIsOffline } from '~redux/reducers/networkSlice';

const SLIDE_MS = 260;

// Rendered height of the bar: paddingVertical (11 top + 11 bottom) plus the
// taller of its icon and text line. Exported so anything else anchored to the
// top of the screen can drop below it instead of underneath it — see
// RealtimeToast. Derived from the same RFValue inputs as the styles below, so
// it tracks them across device sizes rather than drifting from a fixed guess.
export const OFFLINE_BANNER_HEIGHT = 22 + RFValue(16);

// Gap between the banner and whatever sits under it.
export const OFFLINE_BANNER_GAP = 8;

const OfflineBanner = () => {
  const isOffline = useSelector(selectIsOffline);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  // Keeps the view mounted through the slide-out; unmounting on isOffline alone
  // would cut the animation off mid-flight.
  const wasOffline = useRef(false);

  useEffect(() => {
    wasOffline.current = wasOffline.current || isOffline;
    Animated.timing(translateY, {
      toValue: isOffline ? 0 : -120,
      duration: SLIDE_MS,
      useNativeDriver: true,
    }).start();
  }, [isOffline, translateY]);

  if (!isOffline && !wasOffline.current) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
      accessibilityLiveRegion="polite">
      <View style={styles.banner}>
        <WifiOff size={RFValue(15)} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.text} numberOfLines={1}>
          No internet connection
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10000,
    elevation: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
  },
  text: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#FFFFFF',
  },
});

export default OfflineBanner;
