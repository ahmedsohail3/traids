import { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, UploadField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { CheckCircle } from 'lucide-react-native';
import RegisterContainer from '../RegisterContainer';
import useSubcontractorSignup from '~hooks/useSubcontractorSignup';
import useUploadSubcontractorDocument from '~hooks/useUploadSubcontractorDocument';
import useAlert from '~hooks/useAlert';
import { pickDocument } from '~utils/filePicker';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (text) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length > 4)
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
  if (cleaned.length > 2)
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return cleaned;
};

const isoToDDMMYYYY = (iso) => {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
};

// ─── ExpiryRow — manual text entry ───────────────────────────────────────────

const ExpiryRow = ({ value, onChangeText }) => (
  <TextInput
    label="Expiry Date"
    value={value}
    onChangeText={onChangeText}
    placeholder="DD/MM/YYYY"
    keyboardType="number-pad"
    maxLength={10}
  />
);

// ─── ExtractedExpiryBadge — shows auto-detected date ─────────────────────────

const ExtractedExpiryBadge = ({ date }) => (
  <View style={styles.extractedBadge}>
    <CheckCircle size={RFValue(13)} color="#16A34A" />
    <View style={styles.extractedText}>
      <Text style={styles.extractedLabel}>Expiry date extracted</Text>
      <Text style={styles.extractedDate}>{date}</Text>
    </View>
  </View>
);

// ─── DocumentSection ──────────────────────────────────────────────────────────

const DocumentSection = ({ label, documentType, fileField, urlField, expiryField }) => {
  const { formData, errors, updateField, clearError } = useSubcontractorSignup();
  const { uploading, documentUrl, expiresAt, upload, clear } =
    useUploadSubcontractorDocument(documentType);
  const { showAlert } = useAlert();

  const handlePickFile = useCallback(async () => {
    if (uploading) return;
    const file = await pickDocument();
    if (!file) return;

    updateField(fileField, file);

    try {
      const result = await upload(file);
      updateField(urlField, result.url);
      clearError(fileField);
      if (result.expiresAt) {
        updateField(expiryField, isoToDDMMYYYY(result.expiresAt));
      }
    } catch (err) {
      updateField(fileField, null);
      showAlert({
        title:   'Invalid Document',
        message: typeof err?.message === 'string'
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Failed to upload document. Please try again.',
        type: 'error',
      });
    }
  }, [uploading, fileField, urlField, expiryField, updateField, clearError, upload, showAlert]);

  const handleRemove = useCallback(() => {
    if (uploading) return;
    updateField(fileField, null);
    updateField(urlField, null);
    updateField(expiryField, '');
    clear();
  }, [uploading, fileField, urlField, expiryField, updateField, clear]);

  const showExtractedExpiry = !!documentUrl && !!expiresAt;
  const showManualExpiry    = !!documentUrl && !expiresAt;
  const fieldError          = errors[fileField];

  return (
    <>
      <UploadField
        label={`${label} *`}
        hint={uploading ? 'Uploading…' : 'JPG, PNG, PDF (max. 5MB)'}
        file={uploading ? null : formData[fileField]}
        onPress={handlePickFile}
        onRemove={handleRemove}
        style={fieldError ? styles.fieldErrorSpacing : undefined}
      />

      {fieldError ? <Text style={styles.fieldError}>{fieldError}</Text> : null}

      {uploading && (
        <View style={styles.uploadingRow}>
          <ActivityIndicator size="small" color="#10375C" />
          <Text style={styles.uploadingText}>Uploading document…</Text>
        </View>
      )}

      {showExtractedExpiry && (
        <ExtractedExpiryBadge date={formData[expiryField]} />
      )}

      {showManualExpiry && (
        <ExpiryRow
          value={formData[expiryField]}
          onChangeText={(t) => updateField(expiryField, formatDate(t))}
        />
      )}
    </>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const QualificationScreen = ({ navigation }) => {
  const { validateStep } = useSubcontractorSignup();

  const handleContinue = useCallback(() => {
    if (!validateStep(2)) return;
    navigation.navigate('SubProfileSetup');
  }, [validateStep, navigation]);

  return (
    <RegisterContainer
      title="Subcontractor Registration"
      onBack={() => navigation.goBack()}
      currentStep={2}
      totalSteps={4}>

      <Text variant="sectionTitle" style={styles.heading}>
        Qualification &amp; CIS
      </Text>

      <DocumentSection
        label="Insurance"
        documentType="insurance"
        fileField="insuranceDocuments"
        urlField="insuranceDocumentUrl"
        expiryField="insuranceExpiresAt"
      />

      <DocumentSection
        label="Tickets"
        documentType="tickets"
        fileField="ticketsDocuments"
        urlField="ticketsDocumentUrl"
        expiryField="ticketsExpiresAt"
      />

      <DocumentSection
        label="Certification"
        documentType="certification"
        fileField="certificationDocuments"
        urlField="certificationDocumentUrl"
        expiryField="certificationExpiresAt"
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
        />
      </View>
    </RegisterContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  heading: {
    fontFamily: FontFamily.bold,
    marginBottom: 20,
  },
  // The upload card owns the usual 20 bottom margin — collapse it so the error
  // text sits against the field it belongs to.
  fieldErrorSpacing: { marginBottom: 4 },
  fieldError: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#DC2626',
    marginBottom: 20,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  uploadingText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  extractedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  extractedText: {
    flex: 1,
  },
  extractedLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#16A34A',
    marginBottom: 2,
  },
  extractedDate: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#15803D',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn:   { flex: 1 },
  continueBtn: { flex: 2 },
});

export default QualificationScreen;
