import {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {Text, Button, TextInput} from '~components/Common';
import {FontFamily} from '~theme/fonts';
import {useTheme} from '~context/ThemeContext';
import useAuth from '~hooks/useAuth';
import {useSelector} from 'react-redux';
import {usePreventRemove} from '@react-navigation/native';
import PasswordSuccessModal from './PasswordSuccessModal';
import AuthContainer, {AUTH_DESCRIPTION_FONT_SIZE} from './AuthContainer';

const PASSWORD_RULES = [
  {key: 'length', label: 'At least 8 characters', test: p => p.length >= 8},
  {key: 'upper', label: 'One uppercase letter', test: p => /[A-Z]/.test(p)},
  {key: 'number', label: 'One number', test: p => /\d/.test(p)},
];

const RuleRow = ({label, passed, colors}) => (
  <View style={styles.ruleRow}>
    <View
      style={[
        styles.ruleDot,
        {backgroundColor: passed ? colors.success : colors.border},
      ]}
    />
    <Text
      style={[
        styles.ruleText,
        {color: passed ? colors.success : colors.textMuted},
      ]}>
      {label}
    </Text>
  </View>
);

const NewPasswordScreen = ({navigation}) => {
  const {colors} = useTheme();
  const {resetPassword, resetFlow, clearResetFlow} = useAuth();
  const userType = useSelector(s => s.auth.user.type);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [successVisible, setSuccessVisible] = useState(false);
  // The OTP behind us has already been consumed, so there is nothing valid to go
  // back to. Blocks the Android hardware back and — with gestureEnabled:false in
  // AuthNavigator — the iOS swipe. `beforeRemove` fires for navigation.reset()
  // too, so the guard has to be released before the success exit below rather
  // than left permanently on, or the user would be stuck here.
  const [exiting, setExiting] = useState(false);
  usePreventRemove(!exiting, () => {});

  useEffect(() => {
    if (!exiting) return;
    clearResetFlow();
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  }, [exiting, clearResetFlow, navigation]);

  const allRulesPassed = PASSWORD_RULES.every(r => r.test(password));

  useEffect(() => {
    if (resetFlow.isComplete) {
      setSuccessVisible(true);
    }
  }, [resetFlow.isComplete]);

  const handleReset = useCallback(() => {
    const newErrors = {};
    if (!password) newErrors.password = 'Password is required';
    else if (!allRulesPassed)
      newErrors.password = 'Password does not meet requirements';
    if (password !== confirm) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    resetPassword(password, userType);
  }, [password, confirm, allRulesPassed, resetPassword, userType]);

  return (
    <>
      <AuthContainer reserveBackSpace>
        <Text
          variant="sectionTitle"
          style={{color: colors.textPrimary, marginBottom: 6}}>
          Create A New Password
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: AUTH_DESCRIPTION_FONT_SIZE,
            marginBottom: 24,
          }}>
          Please choose a password that hasn't been used before. Must be at
          least 8 characters.
        </Text>

        <TextInput
          label="Set New Password*"
          value={password}
          onChangeText={v => {
            setPassword(v);
            setErrors(p => ({...p, password: ''}));
          }}
          placeholder="New Password"
          secureTextEntry
          error={errors.password}
        />

        {/* Password rules */}
        {password.length > 0 && (
          <View style={styles.rulesContainer}>
            {PASSWORD_RULES.map(r => (
              <RuleRow
                key={r.key}
                label={r.label}
                passed={r.test(password)}
                colors={colors}
              />
            ))}
          </View>
        )}

        <TextInput
          label="Confirm New Password"
          value={confirm}
          onChangeText={v => {
            setConfirm(v);
            setErrors(p => ({...p, confirm: ''}));
          }}
          placeholder="Confirm New Password"
          secureTextEntry
          error={errors.confirm}
          containerStyle={styles.confirmInput}
        />

        {resetFlow.error ? (
          <Text
            style={[styles.ruleText, {color: colors.error, marginBottom: 8}]}>
            {resetFlow.error}
          </Text>
        ) : null}

        <Button
          title="Reset Password"
          onPress={handleReset}
          loading={resetFlow.loading}
          style={styles.btn}
        />
      </AuthContainer>

      <PasswordSuccessModal
        visible={successVisible}
        onContinue={() => {
          setSuccessVisible(false);
          setExiting(true);
        }}
      />
    </>
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
    marginBottom: 24,
  },
  rulesContainer: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  ruleText: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
  },
  confirmInput: {marginTop: 4},
  btn: {marginTop: 8},
});

export default NewPasswordScreen;
