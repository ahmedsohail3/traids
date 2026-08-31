import { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  BackHandler,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MessageSquare } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const CustomPrompt = ({ config, onDismiss, dismissRequested = false }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const {
    title,
    message,
    placeholder = '',
    defaultValue = '',
    keyboardType = 'default',
    maxLength,
    confirmText = 'Submit',
    cancelText = 'Cancel',
    onSubmit,
    onCancel,
    validate,
  } = config;

  const [value, setValue] = useState(defaultValue);
  const [validationError, setValidationError] = useState('');

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
    ]).start(() => {
      // Auto-focus after entrance animation
      setTimeout(() => inputRef.current?.focus(), 50);
    });
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

  const handleSubmit = useCallback(() => {
    if (validate) {
      const errorMsg = validate(value);
      if (errorMsg) {
        setValidationError(errorMsg);
        return;
      }
    }
    setValidationError('');
    handleDismiss(() => onSubmit?.(value));
  }, [value, validate, handleDismiss, onSubmit]);

  const handleCancel = useCallback(() => {
    handleDismiss(onCancel);
  }, [handleDismiss, onCancel]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCancel();
      return true;
    });
    return () => sub.remove();
  }, [handleCancel]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnim }]}
        accessibilityViewIsModal
        accessibilityLiveRegion="polite">
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleCancel} />
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
          <View style={styles.iconWrap}>
            <MessageSquare size={RFValue(22)} color="#10375C" strokeWidth={1.8} />
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
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          )}

          {/* Input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                borderColor: validationError ? '#EF4444' : colors.inputBorder,
                backgroundColor: colors.inputBackground,
                color: colors.inputText,
              },
            ]}
            value={value}
            onChangeText={(t) => {
              setValue(t);
              if (validationError) setValidationError('');
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType={keyboardType}
            maxLength={maxLength}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            accessibilityLabel={placeholder || title}
          />

          {/* Validation error */}
          {!!validationError && (
            <Text style={styles.errorText}>{validationError}</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
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
            <TouchableOpacity
              style={[styles.btn, styles.btnConfirm]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={confirmText}>
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
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
    backgroundColor: '#DBEAFE',
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
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    marginBottom: 6,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#EF4444',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#10375C',
    minHeight: 46,
  },
  btnConfirmText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#FFFFFF',
  },
});

export default CustomPrompt;
