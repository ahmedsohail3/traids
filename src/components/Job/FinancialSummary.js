import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';
const LIGHT_GREY = '#F7F9FC';
const BORDER = '#E2E8F0';

const FinancialSummary = ({ rate }) => {
  const hourlyNum = parseFloat(rate) || 0;
  const platformFee = (hourlyNum * 0.05).toFixed(2);
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Trade Type</Text>
        <Text style={styles.summaryValue}>£ {hourlyNum.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Platform fee (5%)</Text>
        <Text style={styles.summaryValue}>+£ {platformFee}</Text>
      </View>
      <View style={[styles.summaryRow, styles.summaryTotal]}>
        <Text style={[styles.summaryLabel, { fontFamily: FontFamily.semiBold, color: NAVY }]}>Total Payable</Text>
        <Text style={[styles.summaryValue, { fontFamily: FontFamily.semiBold }]}>
          £ {(hourlyNum + parseFloat(platformFee)).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#F2A154',
    padding: RFValue(14),
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryTotal: {
    padding: 12,
    marginTop: 6,
    marginBottom: 0,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  summaryLabel: { fontFamily: FontFamily.regular, fontSize: RFValue(11), color: '#64748B' },
  summaryValue: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11), color: NAVY },
});

export default FinancialSummary;
