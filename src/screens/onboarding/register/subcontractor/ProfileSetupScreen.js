import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, UploadField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useSubcontractorSignup from '~hooks/useSubcontractorSignup';
import { pickImageFromLibrary, pickDocument } from '~utils/filePicker';
import useAlert from '~hooks/useAlert';

const ProfileSetupScreen = ({ navigation }) => {
  const {
    formData,
    errors,
    loading,
    error,
    submitted,
    updateField,
    clearError,
    validateStep,
    submit,
    reset,
  } = useSubcontractorSignup();

  const { showAlert } = useAlert();

  // Navigate to PaymentSetup once signup API succeeds
  useEffect(() => {
    if (submitted) {
      reset();
      navigation.navigate('SubPaymentSetup');
    }
  }, [submitted]);

  // Show API-level error via alert
  useEffect(() => {
    if (error) {
      showAlert({ title: 'Signup Failed', message: error, type: 'error' });
    }
  }, [error]);

  const handlePickPhoto = useCallback(async () => {
    const file = await pickImageFromLibrary();
    if (file) updateField('profileImage', file);
  }, [updateField]);

  const handlePickWorkExamples = useCallback(async () => {
    const file = await pickDocument();
    if (file) updateField('workExamples', file);
  }, [updateField]);

  const handleContinue = useCallback(() => {
    if (!validateStep(3)) return;
    submit();
  }, [validateStep, submit]);

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
        file={formData.profileImage}
        onPress={handlePickPhoto}
        onRemove={() => updateField('profileImage', null)}
      />

      <TextInput
        label="Hourly Rate (£) *"
        value={formData.hourlyRate}
        onChangeText={(v) => { updateField('hourlyRate', v.replace(/[^0-9.]/g, '')); clearError('hourlyRate'); }}
        placeholder="£12"
        keyboardType="decimal-pad"
        error={errors.hourlyRate}
      />

      <TextInput
        label="Enter Password *"
        value={formData.password}
        onChangeText={(v) => { updateField('password', v); clearError('password'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      <TextInput
        label="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(v) => { updateField('confirmPassword', v); clearError('confirmPassword'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <TextInput
        label="Email *"
        value={formData.email}
        onChangeText={(v) => { updateField('email', v); clearError('email'); }}
        placeholder="Your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <TextInput
        label="About / Description"
        value={formData.professionalBio}
        onChangeText={(v) => updateField('professionalBio', v)}
        placeholder="Tell companies about your experience, specialities, and what makes you stand out..."
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      {/* Work Examples — optional */}
      <UploadField
        label="Work Examples (optional)"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={formData.workExamples}
        onPress={handlePickWorkExamples}
        onRemove={() => updateField('workExamples', null)}
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
  cancelBtn:   { flex: 1 },
  continueBtn: { flex: 2 },
});

export default ProfileSetupScreen;
