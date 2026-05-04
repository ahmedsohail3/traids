import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { Images } from '~assets';
import { useDispatch } from 'react-redux';
import { setCredentials } from '~redux/reducers/authSlice';
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
  const dispatch = useDispatch();
  const accountType = route?.params?.accountType || 'company';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Log the user in, setting their role
      dispatch(setCredentials({ type: accountType }));
    }, 1500);
  }, [validate, dispatch, accountType]);

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
          onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })); }}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <TextInput
          label="Password*"
          value={password}
          onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })); }}
          placeholder="Enter your email" /* Placeholder from screenshot matching */
          secureTextEntry
          error={errors.password}
        />

        {/* Remember + Forgot row */}
        <View style={styles.forgotRow}>
          {/* Note: Screenshot has a checkbox "Remember me", stubbed as empty view for layout alignment */}
          <View style={{ flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.checkboxStub} />
            <Text style={{fontSize: RFValue(10), color: colors.textSecondary }}>Remember me</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
            <Text style={{fontSize: RFValue(10), color: colors.secondary }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(18),
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    marginBottom: 24,
  },
  form: { marginBottom: 4 },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 24,
  },
  checkboxStub: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#0A2540',
    borderRadius: 1,
    marginRight: 6,
  },
  forgotText: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.medium,
  },
  btn: { marginBottom: 24 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  registerText: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
  },
  registerLink: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.bold,
  },
});

export default LoginScreen;
