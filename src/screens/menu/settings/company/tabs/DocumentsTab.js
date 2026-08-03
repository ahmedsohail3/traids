import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import DocumentPickerField from '~components/Common/DocumentPickerField';
import { buildCompanyProfileFormData } from '~utils/buildFormData';
import useAlert from '~hooks/useAlert';
import useSettingsForm from '~hooks/useSettingsForm';

/**
 * Convert an S3 URL to a file descriptor with isNew: false.
 * Returns null if url is falsy.
 */
const urlToFile = (url) => {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split('/');
    const name = parts[parts.length - 1] || 'document';
    return {
      uri: url,
      type: 'application/octet-stream',
      name,
      isNew: false,
    };
  } catch {
    return {
      uri: url,
      type: 'application/octet-stream',
      name: 'document',
      isNew: false,
    };
  }
};

// The company document comes back as an array; the other two as plain URLs.
const seedDocs = (profile) => ({
  company: urlToFile(
    Array.isArray(profile.companyDocuments)
      ? profile.companyDocuments[0]
      : profile.companyDocuments,
  ),
  insurance: urlToFile(profile.insuranceCertificate),
  health:    urlToFile(profile.healthAndSafetyPolicy),
});

const DocumentsTab = ({ profile, updateCompanyProfile, updatingProfile }) => {
  const { showAlert } = useAlert();
  const { values: docs, setValue, dirty } = useSettingsForm(profile, seedDocs);

  const handleDocChange = useCallback((key, file) => {
    setValue(key, file ? { ...file, isNew: true } : null);
  }, [setValue]);

  const handleSave = useCallback(async () => {
    try {
      const formData = buildCompanyProfileFormData({
        companyDocuments: docs.company,
        insuranceCertificate: docs.insurance,
        healthAndSafetyPolicy: docs.health,
      });
      await updateCompanyProfile(formData);
      showAlert({ title: 'Success', message: 'Documents updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? 'Update failed.', type: 'error' });
    }
  }, [docs, updateCompanyProfile]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>
      <DocumentPickerField
        label="Company Document"
        hint="PDF, DOC, or DOCX up to 10MB"
        value={docs.company}
        onChange={(file) => handleDocChange('company', file)}
      />

      <DocumentPickerField
        label="Insurance Certificate"
        hint="PDF, DOC, or DOCX up to 10MB"
        value={docs.insurance}
        onChange={(file) => handleDocChange('insurance', file)}
      />

      <DocumentPickerField
        label="Health and Safety Policy"
        hint="PDF, DOC, or DOCX up to 10MB"
        value={docs.health}
        onChange={(file) => handleDocChange('health', file)}
      />

      <TouchableOpacity
        style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
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
  saveButton: {
    backgroundColor: '#10375C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default DocumentsTab;
