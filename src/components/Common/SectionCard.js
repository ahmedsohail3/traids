/**
 * SectionCard — white card with a bold title + optional right label (e.g. "This Week ▾")
 * Used in dashboard for "Active Jobs Trend", "Budget Spent", "Recent Jobs", etc.
 */
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const SectionCard = ({ title, rightLabel, onRightPress, rightAction, children, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {rightAction ?? (rightLabel ? (
          <TouchableOpacity onPress={onRightPress} activeOpacity={0.7} style={styles.rightBtn}>
            <Text style={[styles.rightLabel, { color: colors.primary }]}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null)}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: RFValue(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: RFValue(12),
  },
  title: {
    fontSize: RFValue(14),
    fontFamily: FontFamily.bold,
  },
  rightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: RFValue(5),
    paddingVertical: RFValue(2),
    borderRadius: RFValue(5),
  },
  rightLabel: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
  },
});

export default SectionCard;
