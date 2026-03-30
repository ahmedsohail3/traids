import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

const CompanyDetailsScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const [contactName, setContactName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    const e = {};
    if (!contactName.trim()) e.contactName = 'Primary contact name is required';
    if (!workEmail.trim()) e.workEmail = 'Work email is required';
    else if (!/\S+@\S+\.\S+/.test(workEmail)) e.workEmail = 'Enter a valid email';
    if (!phone.trim()) e.phone = 'Phone number is required';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!address.trim()) e.address = 'Head office address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [contactName, workEmail, phone, password, confirmPassword, address]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Verification');
    }, 500);
  }, [validate, navigation]);

  return (
    <RegisterContainer
      onBack={() => navigation.goBack()}
      currentStep={3}
      totalSteps={4}>

      <Text
        variant="sectionTitle"
        style={{ fontFamily: FontFamily.bold, marginBottom: 20 }}>
        Company Registration
      </Text>

      <TextInput
        label="Primary Contact Name *"
        value={contactName}
        onChangeText={v => { setContactName(v); setErrors(p => ({ ...p, contactName: '' })); }}
        placeholder="John Doe"
        autoCapitalize="words"
        error={errors.contactName}
      />

      <TextInput
        label="Work Email *"
        value={workEmail}
        onChangeText={v => { setWorkEmail(v); setErrors(p => ({ ...p, workEmail: '' })); }}
        placeholder="john@acme.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.workEmail}
      />

      <TextInput
        label="Phone Number *"
        value={phone}
        onChangeText={v => { setPhone(v); setErrors(p => ({ ...p, phone: '' })); }}
        placeholder="+44 7706 900083"
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <TextInput
        label="Enter Password *"
        value={password}
        onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      <TextInput
        label="Confirm Password *"
        value={confirmPassword}
        onChangeText={v => { setConfirmPassword(v); setErrors(p => ({ ...p, confirmPassword: '' })); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <TextInput
        label="Head Office Address *"
        value={address}
        onChangeText={v => { setAddress(v); setErrors(p => ({ ...p, address: '' })); }}
        placeholder="123 Construction Way, London, UK"
        autoCapitalize="words"
        error={errors.address}
      />

      {/* Bottom action row */}
      <View style={styles.actionRow}>
        <Button
          title="Cancel"
          variant="outline"
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        />
        <Button
          title="Save & Continue"
          style={styles.continueBtn}
          onPress={handleContinue}
          loading={loading}
        />
      </View>
    </RegisterContainer>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: { flex: 1 },
  continueBtn: { flex: 2 },
});

export default CompanyDetailsScreen;
