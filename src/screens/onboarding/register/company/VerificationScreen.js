import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, UploadField } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useCompanySignup from '~hooks/useCompanySignup';
import useAlert from '~hooks/useAlert';

const STEP_ROUTE = { 1: 'BusinessDetails', 3: 'CompanyDetails' };

const VerificationScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    formData, errors, updateField, clearError,
    validateStep, submit, loading, error, submitted, reset, stepWithErrors,
  } = useCompanySignup();

  const { showAlert } = useAlert();

  // Navigate away once the API call succeeds, then wipe signup state
  useEffect(() => {
    if (submitted) {
      reset();
      navigation.navigate('Login');
    }
  }, [submitted]);

  // Show API-level error via alert, and send the user back to the step that owns
  // the failing field (registration number, work email, phone number, …)
  useEffect(() => {
    if (!error) return;
    showAlert({ title: 'Signup Failed', message: error, type: 'error' });
    const route = STEP_ROUTE[stepWithErrors()];
    if (route) navigation.navigate(route);
  }, [error]);

  // In a real app this would open the document picker
  const handlePickFile = useCallback((field) => {
    // TODO: integrate @react-native-documents/picker
    updateField(field, { name: 'document.pdf', uri: '', type: 'application/pdf' });
  }, [updateField]);

  const handleContinue = useCallback(() => {
    if (!validateStep(4)) return;
    submit();
  }, [validateStep, submit]);

  console.log('formData', formData);
  console.log('errors', errors);
  console.log('loading', loading);
  console.log('submitted', submitted);

  return (
    <RegisterContainer
      onBack={() => navigation.goBack()}
      currentStep={4}
      totalSteps={4}>

      <Text
        variant="sectionTitle"
        style={{ fontFamily: FontFamily.bold, marginBottom: 20 }}>
        Verification
      </Text>

      <UploadField
        label="Company Document *"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={formData.companyDocuments}
        onPress={() => { handlePickFile('companyDocuments'); clearError('companyDocuments'); }}
        style={errors.companyDocuments ? { borderColor: colors.error } : undefined}
      />
      {errors.companyDocuments ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>{errors.companyDocuments}</Text>
      ) : null}

      <UploadField
        label="Insurance Certificate *"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={formData.insuranceCertificate}
        onPress={() => { handlePickFile('insuranceCertificate'); clearError('insuranceCertificate'); }}
        style={errors.insuranceCertificate ? { borderColor: colors.error } : undefined}
      />
      {errors.insuranceCertificate ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>{errors.insuranceCertificate}</Text>
      ) : null}

      <UploadField
        label="Health & Safety Policy"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={formData.healthAndSafetyPolicy}
        onPress={() => handlePickFile('healthAndSafetyPolicy')}
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
  fieldError: {
    fontSize: 10,
    marginTop: -14,
    marginBottom: 14,
    fontFamily: FontFamily.regular,
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:  { flex: 1 },
  continueBtn:{ flex: 2 },
});

export default VerificationScreen;
