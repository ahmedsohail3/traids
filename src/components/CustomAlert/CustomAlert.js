import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  BackHandler,
  Platform,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CheckCircle2, XCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const TYPE_CONFIG = {
  success: {
    Icon: CheckCircle2,
    iconColor: '#3BB273',
    iconBg: '#DCFCE7',
  },
  error: {
    Icon: XCircle,
    iconColor: '#EF4444',
    iconBg: '#FEE2E2',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: '#F97316',
    iconBg: '#FFEDD5',
  },
  info: {
    Icon: Info,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
  },
  default: {
    Icon: AlertCircle,
    iconColor: '#10375C',
    iconBg: '#DBEAFE',
  },
};

const CustomAlert = ({ config, onDismiss, dismissRequested = false }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const {
    type = 'default',
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    showCancel = false,
  } = config;

  const typeConfig = TYPE_CONFIG[type] ?? TYPE_CONFIG.default;
  const { Icon, iconColor, iconBg } = typeConfig;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  // One dismissal only. Two quick taps — or a tap racing `dismissRequested` —
  // would otherwise run the exit twice and dequeue two alerts for one dialog.
  const dismissingRef = useRef(false);

  const handleDismiss = useCallback(
    (callback) => {
      if (dismissingRef.current) return;
      dismissingRef.current = true;
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        onDismiss();
        callback?.();
      });
    },
    [onDismiss, overlayAnim, scaleAnim, opacityAnim],
  );

  // `hideAlert()` dismisses from outside the dialog — same exit animation, same
  // `onDismiss`, so the provider dequeues exactly as it does for a button press.
  useEffect(() => {
    if (dismissRequested) handleDismiss(onCancel);
  }, [dismissRequested, handleDismiss, onCancel]);

  const handleConfirm = useCallback(() => {
    handleDismiss(onConfirm);
  }, [handleDismiss, onConfirm]);

  const handleCancel = useCallback(() => {
    handleDismiss(onCancel);
  }, [handleDismiss, onCancel]);

  // Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCancel();
      return true;
    });
    return () => sub.remove();
  }, [handleCancel]);

  const isConfirm = showCancel || config.type === 'confirm';

  return (
    <Animated.View
      style={[styles.overlay, { opacity: overlayAnim }]}
      accessibilityViewIsModal
      accessibilityLiveRegion="polite">
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={isConfirm ? undefined : handleConfirm}
      />
      <Animated.View
        style={[
          styles.dialog,
          {
            backgroundColor: colors.modalBackground,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Icon size={RFValue(22)} color={iconColor} strokeWidth={1.8} />
        </View>

        {/* Title */}
        {!!title && (
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            accessibilityRole="header">
            {title}
          </Text>
        )}

        {/* Message */}
        {!!message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        )}

        {/* Buttons */}
        <View style={[styles.buttonRow, isConfirm && styles.buttonRowSplit]}>
          {isConfirm && (
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel, { borderColor: colors.border }]}
              onPress={handleCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={cancelText}>
              <Text style={[styles.btnCancelText, { color: colors.textSecondary }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnConfirm,
              { backgroundColor: iconColor },
              isConfirm && styles.btnConfirmSplit,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={confirmText}>
            <Text style={styles.btnConfirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  iconWrap: {
    width: RFValue(52),
    height: RFValue(52),
    borderRadius: RFValue(26),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: RFValue(20),
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    textAlign: 'center',
    lineHeight: RFValue(17),
    marginBottom: 24,
  },
  buttonRow: {
    width: '100%',
  },
  buttonRowSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnCancel: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  btnCancelText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },
  btnConfirm: {
    minHeight: 46,
  },
  btnConfirmSplit: {
    flex: 1,
  },
  btnConfirmText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#FFFFFF',
  },
});

export default CustomAlert;
