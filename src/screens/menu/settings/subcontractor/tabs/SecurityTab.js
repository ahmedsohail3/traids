import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

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

  const [form, setForm] = useState({
    newPw: '',
    confirmPw: '',
  });
  const [errors, setErrors] = useState({});

  const setItem = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const allRulesPassed = PASSWORD_RULES.every(r => r.test(form.newPw));

  const handleSave = useCallback(() => {
    const newErrors = {};
    if (!form.newPw) newErrors.newPw = 'Password is required';
    else if (!allRulesPassed) newErrors.newPw = 'Password does not meet requirements';
    if (form.newPw !== form.confirmPw) newErrors.confirmPw = 'Passwords do not match';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // TODO: Final save submission logic
    console.log("Changes Saved via validation check");
  }, [form.newPw, form.confirmPw, allRulesPassed]);

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

      <Button title="Save Changes" variant="secondary" onPress={handleSave} style={{ marginTop: 24 }} />
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
    marginTop: 4 
  },
});

export default SecurityTab;
