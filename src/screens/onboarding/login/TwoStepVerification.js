import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button } from '~components/Common';
import OTPInput from '~components/Common/OTPInput';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import AuthContainer from './AuthContainer';

const OtpVerificationScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const email = route?.params?.email || 'johndoe@gmail.com';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleVerify = useCallback(() => {
    if (otp.length < 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }
    setOtpError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('NewPassword');
    }, 1200);
  }, [otp, navigation]);

  const handleResend = useCallback(() => {
    setResending(true);
    setOtp('');
    setTimeout(() => setResending(false), 2000);
  }, []);

  return (
    <AuthContainer showBack onBackPress={() => navigation.goBack()}>
      <Text variant='sectionTitle' style={{ color: colors.textPrimary, marginBottom: 6 }}>Two-Step verification</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: 24 }}>
        Please enter the OTP to verify your account. A code has been sent to{' '}
        <Text style={{ color: colors.secondary, fontFamily: FontFamily.semiBold }}>{email}</Text>
      </Text>

      {/* OTP */}
      <View style={styles.otpContainer}>
        <OTPInput length={6} value={otp} onChange={v => { setOtp(v); setOtpError(''); }} />
      </View>

      {otpError ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{otpError}</Text>
      ) : null}

      <Button
        title="Reset Password"
        onPress={handleVerify}
        loading={loading}
        disabled={otp.length < 6}
        style={styles.btn}
      />

      {/* Resend */}
      <View style={styles.resendRow}>
        <Text style={{ color: colors.textSecondary }}>
          Didn't get the code?{' '}
        </Text>
        <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
          <Text style={{ color: colors.secondary, fontFamily: FontFamily.semiBold, textDecorationLine: 'underline' }}>
            {resending ? 'Sending...' : 'Resend it'}
          </Text>
        </TouchableOpacity>
      </View>
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
  emailHighlight: {
    fontFamily: FontFamily.semiBold,
  },
  otpContainer: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    marginBottom: 12,
    marginTop: 4,
  },
  btn: {
    marginTop: 24,
    marginBottom: 20,
  },
  resendRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
  },
  resendLink: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
  },
});

export default OtpVerificationScreen;
