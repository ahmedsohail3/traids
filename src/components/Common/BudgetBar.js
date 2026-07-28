/**
 * BudgetBar — horizontal budget category bar (Materials, Labor, Permits, Other).
 * Props: label, value (0-100), color
 */
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const BudgetBar = ({ label, value = 0, color = '#10375C' }) => {
  const { colors } = useTheme();
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: colors.border ?? '#E5E7EB' }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: RFValue(10),
  },
  label: {
    width: RFValue(52),
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    textAlign: 'right',
  },
  track: {
    flex: 1,
    height: RFValue(12),
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default BudgetBar;
