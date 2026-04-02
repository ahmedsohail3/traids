import React, { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const AvailabilityTab = () => {
  const [available, setAvailable] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>Available</Text>
          <Text style={styles.settingSub}>Toggle for that you are available</Text>
        </View>
        <Switch 
          value={available} 
          onValueChange={setAvailable} 
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

export default AvailabilityTab;
