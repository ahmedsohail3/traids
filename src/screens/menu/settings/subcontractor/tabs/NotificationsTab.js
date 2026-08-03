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

// Both default to on until the profile says otherwise.
const seedForm = (profile) => ({
  jobAlerts: profile.jobAlerts === undefined ? true : Boolean(profile.jobAlerts),
  reminders: profile.timesheetReminders === undefined
    ? true
    : Boolean(profile.timesheetReminders),
});

const NotificationsTab = ({ profile, updateProfile, updatingProfile }) => {
  const { showAlert } = useAlert();
  const { values, setValue, dirty } = useSettingsForm(profile, seedForm);
  const { jobAlerts, reminders } = values;

  const handleSave = useCallback(async () => {
    try {
      const formData = buildSubcontractorProfileFormData({
        jobAlerts:          jobAlerts,
        timesheetReminders: reminders,
      });
      await updateProfile(formData);
      showAlert({ title: 'Success', message: 'Notification preferences updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? err ?? 'Update failed.', type: 'error' });
    }
  }, [jobAlerts, reminders, updateProfile]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>

      <View style={styles.settingRow}>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>Job Alerts</Text>
          <Text style={styles.settingSub}>Get notified when new jobs match your trade</Text>
        </View>
        <Switch
          value={jobAlerts}
          onValueChange={(v) => setValue('jobAlerts', v)}
          trackColor={{ false: '#E2E8F0', true: '#10375C' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>Timesheet Reminders</Text>
          <Text style={styles.settingSub}>Weekly reminders to log your hours</Text>
        </View>
        <Switch
          value={reminders}
          onValueChange={(v) => setValue('reminders', v)}
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
    backgroundColor: '#10375C',
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

export default NotificationsTab;
