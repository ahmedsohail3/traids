import { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import useProfile from '~hooks/useProfile';
import useAlert from '~hooks/useAlert';
import { buildCompanyProfileFormData } from '~utils/buildFormData';
import useSettingsForm from '~hooks/useSettingsForm';

const seedForm = () => ({ newPw: '', confirmPw: '' });

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: p => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: p => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number', test: p => /\d/.test(p) },
];

const RuleRow = ({ label, passed, colors }) => (
  <View style={styles.ruleRow}>
    <View
      style={[
        styles.ruleDot,
        { backgroundColor: passed ? colors.success : colors.border },
      ]}
    />
    <Text
      style={[
        styles.ruleText,
        { color: passed ? colors.success : colors.textMuted },
      ]}>
      {label}
    </Text>
  </View>
);

const SecurityTab = () => {
  const { colors } = useTheme();
  const { updateCompanyProfile, updatingProfile } = useProfile();
  const { showAlert } = useAlert();

  // No profile to seed from — the baseline is a pair of empty fields, so the
  // form is dirty exactly when the user has typed something.
  const { values: form, setValue, setValues: setForm, dirty } =
    useSettingsForm(null, seedForm);
  const [errors, setErrors] = useState({});

  const setItem = (k, v) => {
    setValue(k, v);
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const allRulesPassed = PASSWORD_RULES.every(r => r.test(form.newPw));

  const handleSave = useCallback(async () => {
    const newErrors = {};
    if (!form.newPw) newErrors.newPw = 'Password is required';
    else if (!allRulesPassed) newErrors.newPw = 'Password does not meet requirements';
    if (form.newPw !== form.confirmPw) newErrors.confirmPw = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const formData = buildCompanyProfileFormData({ password: form.newPw });
      await updateCompanyProfile(formData);
      showAlert({ title: 'Success', message: 'Password updated successfully.', type: 'success' });
      setForm({ newPw: '', confirmPw: '' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? 'Update failed.', type: 'error' });
    }
  }, [form.newPw, form.confirmPw, allRulesPassed, updateCompanyProfile, setForm]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>

      <TextInput
        label="New Password"
        value={form.newPw}
        onChangeText={v => setItem('newPw', v)}
        placeholder="Enter your new password"
        secureTextEntry
        error={errors.newPw}
      />

      {form.newPw.length > 0 && (
        <View style={styles.rulesContainer}>
          {PASSWORD_RULES.map(r => (
            <RuleRow key={r.key} label={r.label} passed={r.test(form.newPw)} colors={colors} />
          ))}
        </View>
      )}

      <TextInput
        label="Confirm Password"
        value={form.confirmPw}
        onChangeText={v => setItem('confirmPw', v)}
        placeholder="Confirm your new password"
        secureTextEntry
        error={errors.confirmPw}
        containerStyle={styles.confirmInput}
      />

      <TouchableOpacity
        style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled, { marginTop: 24 }]}
        onPress={handleSave}
        disabled={saveDisabled}
        activeOpacity={0.8}>
        {updatingProfile ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10 },
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
  confirmInput: {
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#F2A154',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
});

export default SecurityTab;
