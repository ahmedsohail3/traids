import {useState, useCallback} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {Text, Button} from '~components/Common';
import OTPInput from '~components/Common/OTPInput';
import {FontFamily} from '~theme/fonts';
import {useTheme} from '~context/ThemeContext';
import {useSelector} from 'react-redux';
import useAuth from '~hooks/useAuth';
import AuthContainer from './AuthContainer';

const OtpVerificationScreen = ({navigation}) => {
  const {colors} = useTheme();
  const {verifyResetToken, forgotPassword, resetFlow, clearResetError} =
    useAuth();
  const userType = useSelector(s => s.auth.user.type);
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Navigate on the verification succeeding, never on resetFlow.isTokenVerified
  // changing: it is a boolean, so a second verification writes true over true —
  // no change, no effect, no navigation. Watching it also meant a stale `true`
  // left over from an earlier attempt would jump straight to NewPassword on
  // mount, skipping OTP entry with a token the backend would reject.
  const handleVerify = useCallback(async () => {
    if (otp.length < 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }
    setOtpError('');
    clearResetError();
    try {
      await verifyResetToken(otp, userType).unwrap();
      navigation.navigate('NewPassword');
    } catch {
      // Rejection already lands in resetFlow.error, rendered below the input.
    }
  }, [otp, userType, verifyResetToken, clearResetError, navigation]);

  const handleResend = useCallback(() => {
    setResending(true);
    setOtp('');
    forgotPassword(resetFlow.email, userType).finally(() =>
      setResending(false),
    );
  }, [forgotPassword, resetFlow.email, userType]);

  return (
    <AuthContainer showBack onBackPress={() => navigation.goBack()}>
      <Text
        variant="sectionTitle"
        style={{color: colors.textPrimary, marginBottom: 6}}>
        Two-Step verification
      </Text>
      {/* Held to two lines: the copy plus an email address runs to three at the
          body size, so let it shrink to fit rather than reword it. */}
      <Text
        style={{color: colors.textSecondary, marginBottom: 24}}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}>
        Please enter the OTP to verify your account. A code has been sent to{' '}
        <Text
          style={{color: colors.secondary, fontFamily: FontFamily.semiBold}}>
          {resetFlow.email || 'your email'}
        </Text>
      </Text>

      {/* OTP */}
      <View style={styles.otpContainer}>
        <OTPInput
          length={6}
          value={otp}
          onChange={v => {
            setOtp(v);
            setOtpError('');
          }}
        />
      </View>

      {otpError || resetFlow.error ? (
        <Text style={[styles.errorText, {color: colors.error}]}>
          {otpError || resetFlow.error}
        </Text>
      ) : null}

      <Button
        title="Reset Password"
        onPress={handleVerify}
        loading={resetFlow.loading}
        disabled={otp.length < 6}
        style={styles.btn}
      />

      {/* Resend */}
      <View style={styles.resendRow}>
        <Text style={{color: colors.textSecondary}}>Didn't get the code? </Text>
        <TouchableOpacity
          onPress={handleResend}
          disabled={resending || resetFlow.loading}
          activeOpacity={0.7}>
          <Text
            style={{
              color: colors.secondary,
              fontFamily: FontFamily.semiBold,
              textDecorationLine: 'underline',
            }}>
            {resending ? 'Sending...' : 'Resend it'}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
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
});

export default OtpVerificationScreen;
