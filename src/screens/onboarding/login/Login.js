import { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { Images } from '~assets';
import useAuth from '~hooks/useAuth';
import AuthContainer from './AuthContainer';

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <Image
    source={Images.logoTraids}
    style={styles.logoBox}
    resizeMode="contain"
  />
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const LoginScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { login, loading, error, clearError } = useAuth();
  const accountType = route?.params?.accountType || 'company';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = useCallback(() => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Invalid email address';
    if (!password) next.password = 'Password is required';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(() => {
    if (!validate()) return;
    login(email, password, accountType);
  }, [validate, login, email, password, accountType]);

  return (
    <AuthContainer>
      {/* Logo */}
      <View style={styles.logoRow}>
        <Logo />
        <Text style={[styles.brand, { color: colors.textPrimary }]}>Traids.</Text>
      </View>

      <Text variant="sectionTitle" style={{ color: colors.textPrimary, marginBottom: 6 }}>Sign in to</Text>
      <Text variant='body' style={{ color: colors.textSecondary, marginBottom: 24 }}>
        Enter your credentials to access your account
      </Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          label="Email*"
          value={email}
          onChangeText={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: '' })); clearError(); }}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={fieldErrors.email}
        />
        <TextInput
          label="Password*"
          value={password}
          onChangeText={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: '' })); clearError(); }}
          placeholder="Enter your password"
          secureTextEntry
          error={fieldErrors.password}
        />

        {/* Remember + Forgot row */}
        <View style={styles.forgotRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.checkboxStub} />
            <Text style={{ fontSize: RFValue(10), color: colors.textSecondary }}>Remember me</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ResetPassword', { userType: accountType })}>
            <Text style={{ fontSize: RFValue(10), color: colors.secondary }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* API error */}
        {!!error && (
          <Text style={[styles.apiError, { color: colors.error ?? '#D0342C' }]}>
            {error}
          </Text>
        )}
      </View>

      <Button title="Login" onPress={handleLogin} loading={loading} style={styles.btn} />

      {/* Register */}
      <View style={styles.registerRow}>
        <Text style={{ color: colors.textSecondary }}>
          Don't have an Account?{' '}
        </Text>
        <Text
          style={{ color: colors.primary, fontFamily: FontFamily.bold }}
          onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoBox: {
    width: RFValue(28),
    height: RFValue(28),
  },
  brand: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(18),
  },
  form: { marginBottom: 4 },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 16,
  },
  checkboxStub: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#0A2540',
    borderRadius: 1,
    marginRight: 6,
  },
  apiError: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    marginBottom: 12,
    textAlign: 'center',
  },
  btn: { marginBottom: 24 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
});

export default LoginScreen;
