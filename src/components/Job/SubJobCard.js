import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MapPin, Calendar, Users, Briefcase } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { stripHtml } from '~utils';

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const SubJobCard = ({
  companyName,
  companyInitial,
  companyColorIndex = 0,
  location,
  distance,
  rate,
  title,
  description,
  startDate,
  workersRequired,
  trade,
  applicantCount,
  onPress,
  onApply,
}) => {
  const { colors } = useTheme();
  const avatarColor = AVATAR_COLORS[companyColorIndex % AVATAR_COLORS.length];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      {/* Company row */}
      <View style={styles.companyRow}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{companyInitial}</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={[styles.companyName, { color: colors.textPrimary }]} numberOfLines={1}>
            {companyName}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={RFValue(9)} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {location} · {distance}
            </Text>
          </View>
        </View>
        <View style={styles.rateBadge}>
          <Text style={styles.rateText}>{rate}</Text>
        </View>
      </View>

      {/* Title + description */}
      <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
        {description ? stripHtml(description) : ''}
      </Text>

      {/* Tags */}
      <View style={styles.tagsRow}>
        <View style={[styles.tag, { borderColor: colors.border }]}>
          <Calendar size={RFValue(9)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.tagText, { color: colors.textSecondary }]}>{startDate}</Text>
        </View>
        <View style={[styles.tag, { borderColor: colors.border }]}>
          <MapPin size={RFValue(9)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.tagText, { color: colors.textSecondary }]}>{location}</Text>
        </View>
        <View style={[styles.tag, { borderColor: colors.border }]}>
          <Users size={RFValue(9)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.tagText, { color: colors.textSecondary }]}>{workersRequired} Workers</Text>
        </View>
        <View style={[styles.tag, { borderColor: colors.border }]}>
          <Briefcase size={RFValue(9)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.tagText, { color: colors.textSecondary, textTransform: 'capitalize' }]}>{trade}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.applicantText, { color: colors.textSecondary }]}>
          {applicantCount} {applicantCount === 1 ? 'Applicant' : 'Applicants'}
        </Text>
        <TouchableOpacity style={styles.applyBtn} onPress={onApply} activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
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
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: RFValue(34),
    height: RFValue(34),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
  },
  companyInfo: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  rateBadge: {
    backgroundColor: '#F2A154',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  rateText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    marginBottom: 4,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(15),
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  applicantText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  applyBtn: {
    backgroundColor: '#10375C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
  },
});

export default SubJobCard;
