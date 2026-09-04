/**
 * ProfileStatRow — bordered "label … value" row from the profile card
 * (Job Success, Hourly Rate).
 *
 * Props:
 *   label  string
 *   value  string
 */
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const ProfileStatRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: RFValue(12),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(12),
    color: '#2E2E2E',
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
});

export default ProfileStatRow;
