import React, { useState, useEffect, useCallback } from 'react';
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
import { buildCompanyProfileFormData } from '~utils/buildFormData';
import useAlert from '~hooks/useAlert';

const NotificationsTab = ({ profile, updateCompanyProfile, updatingProfile }) => {
  const { showAlert } = useAlert();
  const [reminders, setReminders] = useState(true);

  useEffect(() => {
    if (profile && profile.timesheetReminders !== undefined) {
      setReminders(Boolean(profile.timesheetReminders));
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    try {
      const formData = buildCompanyProfileFormData({ timesheetReminders: reminders });
      await updateCompanyProfile(formData);
      showAlert({ title: 'Success', message: 'Notification preferences updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? 'Update failed.', type: 'error' });
    }
  }, [reminders, updateCompanyProfile]);

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>Timesheet Reminders</Text>
          <Text style={styles.settingSub}>Weekly reminders to log your hours</Text>
        </View>
        <Switch
          value={reminders}
          onValueChange={setReminders}
          trackColor={{ false: '#E2E8F0', true: '#10375C' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, updatingProfile && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={updatingProfile}
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
    marginBottom: 2,
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
