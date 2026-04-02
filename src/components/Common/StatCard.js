/**
 * StatCard — reusable metric card used in both company and subcontractor dashboards.
 *
 * Props:
 *   label        string — e.g. "Active Jobs"
 *   value        string | number — large displayed number
 *   subLabel     string — secondary description, e.g. "No active jobs yet" or "+3 vs last month"
 *   icon         Lucide icon component
 *   iconColor    string (optional, defaults to theme primary)
 *   positive     boolean (optional) — if true, subLabel shows in green
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const StatCard = ({ label, value, subLabel, icon: IconComp, iconColor, positive }) => {
  const { colors } = useTheme();
  const color = iconColor ?? colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]} >{label}</Text>
        {IconComp && <View style={styles.iconContainer}><IconComp size={RFValue(18)} color={color} strokeWidth={1.8} /></View>}
      </View>
      <Text style={[styles.value, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {subLabel ? (
        <Text
          style={[
            styles.sub,
            {
              color: positive === true
                ? '#22C55E'
                : positive === false
                  ? '#EF4444'
                  : colors.textSecondary,
            },
          ]} numberOfLines={1} adjustsFontSizeToFit>
          {subLabel}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: RFValue(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.medium,
  },
  iconContainer: {
    position: 'absolute',
    right: RFValue(-10),
    top: RFValue(-10),
    backgroundColor: '#F7F9FC',
    padding: RFValue(6),
    borderRadius: RFValue(6),
  },
  value: {
    fontSize: RFValue(18),
    fontFamily: FontFamily.bold,
    marginBottom: 2,
  },
  sub: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
  },
});

export default StatCard;
