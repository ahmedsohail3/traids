import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import AuthContainer from './AuthContainer';

const ResetPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleReset = useCallback(() => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('TwoStepVerification', { email });
    }, 1200);
  }, [email, navigation]);

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
        placeholder="example@gmail.com" /* Placeholder from screenshot matching */
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        containerStyle={styles.inputContainer}
      />

      <Button
        title="Reset Password"
        onPress={handleReset}
        loading={loading}
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
