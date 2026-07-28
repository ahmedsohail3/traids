import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { Images } from '~assets';

const { height } = Dimensions.get('window');



const PasswordSuccessModal = ({ visible, onContinue }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 160,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleContinue = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onContinue?.());
  }, [slideAnim, onContinue]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleContinue}>
      <TouchableWithoutFeedback onPress={handleContinue}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            transform: [{ translateY: slideAnim }],
            shadowColor: colors.shadowColor,
          },
        ]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <Image source={Images.checkmarkIcon} style={styles.successIcon} />

        <Text variant='sectionTitle' style={{ color: colors.textPrimary, marginBottom: 6 }}>Password Reset Successfully!</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>
          Your password has been successfully reset.{'\n'}You can now log in.
        </Text>

        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    height: height * 0.5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    alignItems: 'center',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 28,
  },
  // Success icon
  successIcon: {
    width: RFValue(90),
    height: RFValue(90),
    resizeMode: 'contain',
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
    textAlign: 'center',
    marginBottom: 10,
  },
  successDesc: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    textAlign: 'center',
    marginBottom: 28,
  },
  continueBtn: {},
});

export default PasswordSuccessModal;
