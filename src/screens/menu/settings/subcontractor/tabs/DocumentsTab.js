import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import DocumentPickerField from '~components/Common/DocumentPickerField';
import { buildSubcontractorProfileFormData } from '~utils/buildFormData';
import useAlert from '~hooks/useAlert';
import useSettingsForm from '~hooks/useSettingsForm';

// ── Helpers ────────────────────────────────────────────────────────────────────

const urlToFile = (url) => {
  if (!url) return null;
  try {
    const parts = decodeURIComponent(url).split('/');
    const name  = parts[parts.length - 1] || 'document';
    return { uri: url, type: 'application/octet-stream', name, isNew: false };
  } catch {
    return { uri: url, type: 'application/octet-stream', name: 'document', isNew: false };
  }
};

// Pick first URL from a documents array/string and convert to file descriptor
const firstUrlToFile = (val) => {
  if (!val) return null;
  const arr = Array.isArray(val) ? val : [val];
  return urlToFile(arr[0] ?? null);
};

const seedDocs = (profile) => ({
  insurance:     firstUrlToFile(profile.insurance?.documents),
  tickets:       firstUrlToFile(profile.tickets?.documents),
  certification: firstUrlToFile(profile.certification?.documents),
});

// ── Tab ────────────────────────────────────────────────────────────────────────

const DocumentsTab = ({ profile, updateProfile, updatingProfile }) => {
  const { showAlert } = useAlert();

  const { values, setValue, dirty } = useSettingsForm(profile, seedDocs);
  const { insurance, tickets, certification } = values;

  const handleDocChange = useCallback((key, file) => {
    setValue(key, file ? { ...file, isNew: true } : null);
  }, [setValue]);

  const handleSave = useCallback(async () => {
    try {
      const formData = buildSubcontractorProfileFormData({
        insuranceDocuments:    insurance     ? [insurance]     : [],
        ticketsDocuments:      tickets       ? [tickets]       : [],
        certificationDocuments: certification ? [certification] : [],
      });
      await updateProfile(formData);
      showAlert({ title: 'Success', message: 'Documents updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? err ?? 'Update failed.', type: 'error' });
    }
  }, [insurance, tickets, certification, updateProfile]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>

      <DocumentPickerField
        label="Insurance Document"
        hint="JPG, PNG or WEBP up to 10MB"
        value={insurance}
        onChange={(file) => handleDocChange('insurance', file)}
      />

      <DocumentPickerField
        label="Tickets Document"
        hint="JPG, PNG or WEBP up to 10MB"
        value={tickets}
        onChange={(file) => handleDocChange('tickets', file)}
      />

      <DocumentPickerField
        label="Certification Document"
        hint="JPG, PNG or WEBP up to 10MB"
        value={certification}
        onChange={(file) => handleDocChange('certification', file)}
      />

      <TouchableOpacity
        style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saveDisabled}
        activeOpacity={0.8}
      >
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
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
});

export default DocumentsTab;
