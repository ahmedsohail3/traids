import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, UploadField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useSubcontractorSignup from '~hooks/useSubcontractorSignup';
import { pickImageFromLibrary, pickDocument } from '~utils/filePicker';
import useAlert from '~hooks/useAlert';
import useAuth from '~hooks/useAuth';

const ProfileSetupScreen = ({ navigation }) => {
  const {
    formData,
    loading,
    error,
    submitted,
    updateField,
    stepWithErrors,
    submit,
    reset,
  } = useSubcontractorSignup();

  const { showAlert } = useAlert();
  const { startSession } = useAuth();

  // Navigate to PaymentSetup once signup API succeeds.
  // Signup returns no JWT, so log in silently here — the next screen's Stripe
  // onboarding call needs one. Credentials are read before reset() wipes them,
  // and the login runs in the background while the user reads that screen.
  useEffect(() => {
    if (!submitted) return;
    const { email, password } = formData;
    if (email && password) startSession(email, password, 'subcontractor');
    reset();
    navigation.navigate('SubPaymentSetup');
  }, [submitted]);

  // Show API-level error via alert, and send the user back to the step that owns
  // the failing field (email / password / hourly rate all live on Personal Details)
  useEffect(() => {
    if (!error) return;
    showAlert({ title: 'Signup Failed', message: error, type: 'error' });
    if (stepWithErrors() === 1) navigation.navigate('SubPersonalDetails');
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
    submit();
  }, [submit]);

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
