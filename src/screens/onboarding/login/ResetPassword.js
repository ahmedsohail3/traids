import { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { useSelector } from 'react-redux';
import useAuth from '~hooks/useAuth';
import AuthContainer from './AuthContainer';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { forgotPassword, resetFlow, clearResetError } = useAuth();
  const userType = route?.params?.userType || 'company';
  console.log("userType",userType);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Navigate on the request succeeding, never on resetFlow.email changing:
  // requesting a reset twice for the same address writes back an identical
  // string, so a state-watching effect would see no change and never fire —
  // the OTP would send but the screen would not open.
  const handleReset = useCallback(async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    clearResetError();
    try {
      await forgotPassword(email.trim(), userType).unwrap();
      navigation.navigate('TwoStepVerification');
    } catch {
      // Rejection already lands in resetFlow.error, rendered under the field.
    }
  }, [email, userType, forgotPassword, clearResetError, navigation]);

  return (
    <AuthContainer showBack onBackPress={() => navigation.goBack()}>
      <Text variant='sectionTitle' style={{ color: colors.textPrimary, marginBottom: 6 }}>Reset Password</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: 24 }}>
        Enter your email and we'll send you a link to reset your password.
      </Text>

      <TextInput
        label="Email Address"
        value={email}
        onChangeText={v => { setEmail(v); setEmailError(''); }}
        placeholder="example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError || resetFlow.error}
        containerStyle={styles.inputContainer}
      />

      <Button
        title="Reset Password"
        onPress={handleReset}
        loading={resetFlow.loading}
        style={styles.btn}
      />
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(18),
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    marginBottom: 28,
  },
  inputContainer: { marginBottom: 28 },
  btn: { },
});

export default ResetPasswordScreen;
