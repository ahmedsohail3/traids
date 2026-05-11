/**
 * SubBookingDetailScreen — Full-screen booking detail for Subcontractor role.
 * Registered outside the tab navigator; no bottom tab bar is shown.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MessageSquare, ClipboardList, MapPin, Star, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const STATUS_STYLE = {
  'In Progress': { bg: '#1E3A8A', text: '#FFFFFF' },
  Pending:       { bg: '#F2A154', text: '#FFFFFF' },
  Completed:     { bg: '#3BB273', text: '#FFFFFF' },
  Offer:         { bg: '#6366F1', text: '#FFFFFF' },
};

const SubBookingDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { booking } = route?.params ?? {};

  const avatarColor = AVATAR_COLORS[(booking?.companyColorIndex ?? 0) % AVATAR_COLORS.length];
  const statusStyle = STATUS_STYLE[booking?.status] ?? STATUS_STYLE.Pending;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="My Bookings" subtitle="Manage your assigned and ongoing jobs." showBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Company verified card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* COMPANY label + VERIFIED badge */}
          <View style={styles.companyLabelRow}>
            <Text style={[styles.companyLabel, { color: colors.textSecondary }]}>COMPANY</Text>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={RFValue(10)} color="#15803D" strokeWidth={2} fill="transparent" />
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          </View>

          {/* Logo + name + subtitle + rating — centered */}
          <View style={styles.companyCenter}>
            <View style={[styles.companyAvatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.companyAvatarText}>
                {booking?.companyInitial ?? 'C'}
              </Text>
            </View>
            <Text style={[styles.companyName, { color: colors.textPrimary }]}>
              {booking?.companyName ?? 'Company Name'}
            </Text>
            <Text style={[styles.companySubtitle, { color: colors.textSecondary }]}>Company</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  size={RFValue(12)}
                  color={n <= 4 ? '#F2A154' : '#E2E8F0'}
                  fill={n <= 4 ? '#F2A154' : 'transparent'}
                  strokeWidth={1.5}
                />
              ))}
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                4.9 (24 reviews)
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <MessageSquare size={RFValue(14)} color={'#FFFFFF'} strokeWidth={2} />
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EFEFEF' }]}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <ClipboardList size={RFValue(14)} color={'#64748B'} strokeWidth={2} />
              <Text style={[styles.actionBtnText, { color: '#64748B' }]}>View Timesheet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job details card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Status badge + rate */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {booking?.status ?? 'In Progress'}
              </Text>
            </View>
            <View style={styles.rateWrap}>
              <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Hourly Rate</Text>
              <Text style={[styles.rateValue, { color: colors.textPrimary }]}>
                {booking?.rate ?? '£40/hr'}
              </Text>
            </View>
          </View>

          {/* Title + meta */}
          <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>
            {booking?.title ?? 'Westside Apartment Complex'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.jobMeta, { color: colors.textSecondary }]}>
              {booking?.trade ?? 'Plumber'}
            </Text>
            <Text style={[styles.metaSep, { color: colors.textSecondary }]}> • </Text>
            <MapPin size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.jobMeta, { color: colors.textSecondary }]} numberOfLines={1}>
              {booking?.location ?? '123 Market St, Downtown'}
            </Text>
          </View>

          {/* Job description */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Job Description</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We are looking for a skilled and reliable plumber to join our team. The ideal candidate
            will be responsible for installing, repairing, and maintaining plumbing systems in
            residential, commercial, and industrial settings.
          </Text>
          <Text style={[styles.subHeading, { color: colors.textPrimary }]}>Key Responsibilities:</Text>
          {[
            'Install and repair pipes, fittings, and fixtures of heating, water, and drainage systems.',
            'Inspect plumbing systems to identify and troubleshoot issues.',
            'Respond to emergency plumbing situations promptly.',
            'Ensure all work complies with local plumbing codes and safety standards.',
            'Maintain accurate records of work performed and materials used.',
          ].map((item, i) => (
            <Text key={i} style={[styles.bulletText, { color: colors.textSecondary }]}>
              {'• '}
              {item}
            </Text>
          ))}
          <Text style={[styles.subHeading, { color: colors.textPrimary }]}>Requirements:</Text>
          {[
            'Proven experience as a plumber.',
            'Good understanding of plumbing systems and tools.',
            'Ability to read technical drawings and blueprints.',
            'Physical stamina and dexterity.',
            'Strong problem-solving skills.',
            'Certification or vocational training in plumbing is preferred.',
          ].map((item, i) => (
            <Text key={i} style={[styles.bulletText, { color: colors.textSecondary }]}>
              {'• '}
              {item}
            </Text>
          ))}
          <Text style={[styles.subHeading, { color: colors.textPrimary }]}>Benefits:</Text>
          {['Competitive salary', 'Health and safety support', 'Opportunities for skill development'].map(
            (item, i) => (
              <Text key={i} style={[styles.bulletText, { color: colors.textSecondary }]}>
                {'• '}
                {item}
              </Text>
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },

  // Company card
  companyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(8),
    color: '#15803D',
    letterSpacing: 0.5,
  },
  companyCenter: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  companyAvatar: {
    width: RFValue(60),
    height: RFValue(60),
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  companyAvatarText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(24),
  },
  companyName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
    textAlign: 'center',
  },
  companySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: RFValue(42),
    borderRadius: 10,
  },
  actionBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
  },

  // Job card
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
  },
  rateWrap: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  rateValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 2,
  },
  jobMeta: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  metaSep: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
    marginBottom: 10,
  },
  subHeading: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    marginBottom: 6,
    marginTop: 4,
  },
  bulletText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
    marginBottom: 3,
  },
});

export default SubBookingDetailScreen;
