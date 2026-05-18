import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, UploadField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

const ProfileSetupScreen = ({ navigation }) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [hourlyRate, setHourlyRate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [about, setAbout] = useState('');
  const [workExamples, setWorkExamples] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const clearError = useCallback(
    field => setErrors(prev => ({ ...prev, [field]: '' })),
    [],
  );

  const handlePickFile = useCallback(setter => {
    // TODO: integrate @react-native-documents/picker / image picker
    setter({ name: 'photo.jpg', uri: '' });
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!hourlyRate.trim()) e.hourlyRate = 'Hourly rate is required';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Minimum 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [hourlyRate, password, confirmPassword, email]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SubPaymentSetup');
    }, 500);
  }, [validate, navigation]);

  return (
    <RegisterContainer
      title="Subcontractor Registration"
      onBack={() => navigation.goBack()}
      currentStep={3}
      totalSteps={4}>

      <Text variant="sectionTitle" style={styles.heading}>
        Profile Setup
      </Text>

      {/* Upload Photo */}
      <UploadField
        label="Upload Photo"
        hint="JPG, PNG or WEBP up to 5MB. Square image recommended."
        file={photoFile}
        onPress={() => handlePickFile(setPhotoFile)}
      />

      <TextInput
        label="Hourly Rate (£) *"
        value={hourlyRate}
        onChangeText={v => { setHourlyRate(v.replace(/[^0-9.]/g, '')); clearError('hourlyRate'); }}
        placeholder="£12"
        keyboardType="decimal-pad"
        error={errors.hourlyRate}
      />

      <TextInput
        label="Enter Password *"
        value={password}
        onChangeText={v => { setPassword(v); clearError('password'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      <TextInput
        label="Confirm Password *"
        value={confirmPassword}
        onChangeText={v => { setConfirmPassword(v); clearError('confirmPassword'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <TextInput
        label="Email *"
        value={email}
        onChangeText={v => { setEmail(v); clearError('email'); }}
        placeholder="Your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <TextInput
        label="About / Description"
        value={about}
        onChangeText={setAbout}
        placeholder="Tell companies about your experience, specialities, and what makes you stand out..."
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      {/* Work Examples — optional */}
      <UploadField
        label="Work Examples (optional)"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={workExamples}
        onPress={() => handlePickFile(setWorkExamples)}
      />

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
  heading: {
    fontFamily: FontFamily.bold,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: { flex: 1 },
  continueBtn: { flex: 2 },
});

export default ProfileSetupScreen;
