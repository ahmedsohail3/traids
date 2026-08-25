/**
 * DaySeparator — centred date header marking the start of a day's messages.
 * Rendered inline in the message list from the rows `withDaySeparators` injects.
 */
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const DaySeparator = ({ label }) => {
  if (!label) return null;

  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <View style={styles.pill}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  pill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8.5),
    color: '#64748B',
  },
});

export default DaySeparator;
