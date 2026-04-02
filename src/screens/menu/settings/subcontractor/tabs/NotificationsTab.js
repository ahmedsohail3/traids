import React, { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NotificationsTab = () => {
  const [jobAlerts, setJobAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>Job Alerts</Text>
          <Text style={styles.settingSub}>Get notified when new jobs match your trade</Text>
        </View>
        <Switch 
          value={jobAlerts} 
          onValueChange={setJobAlerts} 
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
          onValueChange={setReminders} 
          trackColor={{ false: '#E2E8F0', true: '#10375C' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Button title="Save Changes" variant="secondary" onPress={() => {}} />
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
  }
});

export default NotificationsTab;
