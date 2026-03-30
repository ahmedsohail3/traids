import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CheckCircle } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

const BADGE_COLORS = {
  done:     { bg: '#DCFCE7', text: '#15803D' },
  required: { bg: '#FEE2E2', text: '#DC2626' },
  pending:  { bg: '#FEF3C7', text: '#B45309' },
};

/**
 * StatusListItem — row with a label, sub-label, and a status badge.
 *
 * Props:
 *   title    – primary label
 *   subtitle – secondary description
 *   status   – 'done' | 'required' | 'pending'
 */
const StatusListItem = ({ title, subtitle, status = 'done' }) => {
  const { colors } = useTheme();
  const badge = BADGE_COLORS[status] || BADGE_COLORS.done;
  const isDone = status === 'done';

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: isDone ? '#DCFCE7' : '#F3F4F6' }]}>
        <CheckCircle
          size={RFValue(16)}
          color={isDone ? '#15803D' : colors.textMuted}
          strokeWidth={2}
        />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.badgeText, { color: badge.text }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  iconWrap: {
    width: RFValue(32),
    height: RFValue(32),
    borderRadius: RFValue(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    lineHeight: RFValue(14),
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.semiBold,
  },
});

export default StatusListItem;
