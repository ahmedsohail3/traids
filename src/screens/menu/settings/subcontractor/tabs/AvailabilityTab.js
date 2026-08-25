import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { buildSubcontractorProfileFormData } from '~utils/buildFormData';
import useAlert from '~hooks/useAlert';
import useSettingsForm from '~hooks/useSettingsForm';

// Defaults to available until the profile says otherwise.
const seedForm = (profile) => ({
  available: profile.availability === undefined ? true : Boolean(profile.availability),
});

const AvailabilityTab = ({ profile, updateProfile, updatingProfile }) => {
  const { showAlert } = useAlert();
  const { values, setValue, dirty } = useSettingsForm(profile, seedForm);
  const available = values.available;

  const handleSave = useCallback(async () => {
    try {
      const formData = buildSubcontractorProfileFormData({ availability: available });
      await updateProfile(formData);
      showAlert({ title: 'Success', message: 'Availability updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? err ?? 'Update failed.', type: 'error' });
    }
  }, [available, updateProfile]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>Available for Work</Text>
          <Text style={styles.settingSub}>Toggle to show companies you are available</Text>
        </View>
        <Switch
          value={available}
          onValueChange={(v) => setValue('available', v)}
          trackColor={{ false: '#E2E8F0', true: '#10375C' }}
          thumbColor="#FFFFFF"
        />
      </View>

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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 4,
  },
  settingSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  saveButton: {
    backgroundColor: '#F2A154',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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

export default AvailabilityTab;
