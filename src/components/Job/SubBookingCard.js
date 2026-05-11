/**
 * SubBookingCard — booking row card for In Progress, Pending, and Completed tabs.
 *
 * Props:
 *   companyName        string
 *   companyInitial     string
 *   companyColorIndex  number
 *   title              string
 *   status             'In Progress' | 'Pending' | 'Completed'
 *   description        string
 *   location           string
 *   trade              string
 *   onPress            function
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MapPin, Briefcase } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const STATUS_STYLE = {
  'In Progress': { bg: '#1E3A8A', text: '#FFFFFF' },
  Pending:       { bg: '#F2A154', text: '#FFFFFF' },
  Completed:     { bg: '#3BB273', text: '#FFFFFF' },
};

const SubBookingCard = ({
  companyName,
  companyInitial,
  companyColorIndex = 0,
  title,
  status = 'Pending',
  description,
  location,
  trade,
  onPress,
}) => {
  const { colors } = useTheme();
  const avatarColor = AVATAR_COLORS[companyColorIndex % AVATAR_COLORS.length];
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* Top row: avatar + company + status badge */}
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{companyInitial}</Text>
        </View>
        <Text style={[styles.companyName, { color: colors.textPrimary }]} numberOfLines={1}>
          {companyName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
        </View>
      </View>

      {/* Job title */}
      <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>{title}</Text>

      {/* Description */}
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={4}>
        {description}
      </Text>

      {/* Meta: location + trade */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Briefcase size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{trade}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: RFValue(14),
    marginBottom: RFValue(12),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  avatar: {
    width: RFValue(30),
    height: RFValue(30),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
  },
  companyName: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    marginBottom: 6,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(15),
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
});

export default SubBookingCard;
