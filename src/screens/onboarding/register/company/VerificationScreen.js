import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, UploadField } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useCompanySignup from '~hooks/useCompanySignup';
import useCompanyCardSetup from '~hooks/useCompanyCardSetup';
import useAuth from '~hooks/useAuth';
import useAlert from '~hooks/useAlert';

const STEP_ROUTE = { 1: 'BusinessDetails', 3: 'CompanyDetails' };

const VerificationScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    formData, errors, updateField, clearError,
    validateStep, submit, loading, error, submitted, reset, stepWithErrors,
    paymentMethodId,
  } = useCompanySignup();

  const { showAlert } = useAlert();
  const { startSession } = useAuth();
  const { saveCard, savingCard } = useCompanyCardSetup();

  /**
   * Everything that can only happen once the company exists.
   *
   * Signup returns no JWT, so we log in silently first, then confirm the card
   * that was tokenised back at step 2 against a fresh SetupIntent — the same
   * order the web flow uses (account → setup-intent → confirm → save).
   */
  const finishRegistration = useCallback(async () => {
    const { workEmail, password, primaryContactName, companyName } = formData;
    const pmId = paymentMethodId;

    let sessionOk = false;
    try {
      await startSession(workEmail, password, 'company').unwrap();
      sessionOk = true;
    } catch {
      sessionOk = false;
    }

    // No card to attach — registration is done either way
    if (!pmId) {
      reset();
      navigation.navigate('Login');
      return;
    }

    if (!sessionOk) {
      showAlert({
        title: 'Card Not Saved',
        message: 'Your account is ready, but we could not save your card. You can add it after logging in.',
        type: 'error',
      });
      reset();
      navigation.navigate('Login');
      return;
    }

    const saved = await saveCard({
      paymentMethodId: pmId,
      name: primaryContactName || companyName,
    });

    if (!saved) {
      // Declined or failed 3DS — the account exists, so send them back to
      // re-enter a card, where the retry finishes the setup on its own.
      showAlert({
        title: 'Card Declined',
        message: 'Your account was created, but the card could not be saved. Please try another card.',
        type: 'error',
      });
      navigation.navigate('CardDetails', { retry: true });
      return;
    }

    reset();
    navigation.navigate('Login');
  }, [formData, paymentMethodId, startSession, saveCard, reset, navigation, showAlert]);

  // Signup succeeded — hand off to the post-account work
  useEffect(() => {
    if (submitted) finishRegistration();
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
          loading={loading || savingCard}
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
