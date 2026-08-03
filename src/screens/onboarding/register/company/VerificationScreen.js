import { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '~components/Common';
import DocumentPickerField from '~components/Common/DocumentPickerField';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useCompanySignup from '~hooks/useCompanySignup';
import useCompanyCardSetup from '~hooks/useCompanyCardSetup';
import useAuth from '~hooks/useAuth';
import useAlert from '~hooks/useAlert';

const STEP_ROUTE = { 1: 'BusinessDetails', 3: 'CompanyDetails' };

// The three files POST /company/signup expects, in the order the design lists them.
const DOCUMENTS = [
  { field: 'companyDocuments',     label: 'Company Document *' },
  { field: 'insuranceCertificate', label: 'Insurance Certificate *' },
  { field: 'healthAndSafetyPolicy', label: 'Health & Safety Policy' },
];

const VerificationScreen = ({ navigation }) => {
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
      navigation.navigate('Login', { accountType: 'company' });
      return;
    }

    if (!sessionOk) {
      showAlert({
        title: 'Card Not Saved',
        message: 'Your account is ready, but we could not save your card. You can add it after logging in.',
        type: 'error',
      });
      reset();
      navigation.navigate('Login', { accountType: 'company' });
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
    navigation.navigate('Login', { accountType: 'company' });
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

  // Picked files are held as { uri, type, name } and sent straight through as
  // multipart parts by companySignupApi — no separate upload step here.
  const handleFileChange = useCallback((field, file) => {
    updateField(field, file);
    if (file) clearError(field);
  }, [updateField, clearError]);

  const handleContinue = useCallback(() => {
    if (!validateStep(4)) return;
    submit();
  }, [validateStep, submit]);

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

      {DOCUMENTS.map(({ field, label }) => (
        <DocumentPickerField
          key={field}
          label={label}
          hint="PDF, JPG or PNG (max. 5MB)"
          value={formData[field]}
          error={errors[field]}
          disabled={loading || savingCard}
          onChange={(file) => handleFileChange(field, file)}
        />
      ))}

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
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:  { flex: 1 },
  continueBtn:{ flex: 2 },
});

export default VerificationScreen;
