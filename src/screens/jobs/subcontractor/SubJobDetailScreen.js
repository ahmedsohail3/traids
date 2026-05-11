/**
 * SubJobDetailScreen — Full-screen job detail for Subcontractor role.
 * Registered outside the tab navigator so no bottom tab bar is shown.
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  MapPin,
  Clock,
  Calendar,
  Briefcase,
  FileText,
  Building2,
  Star,
} from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import ApplyJobModal from '~components/Job/ApplyJobModal';

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const OverviewItem = ({ icon: Icon, label, value, colors }) => (
  <View style={[styles.overviewItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.overviewIcon}>
      <Icon size={RFValue(14)} color="#10375C" strokeWidth={2} />
    </View>
    <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.overviewValue, { color: colors.textPrimary }]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const SubJobDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { job, openApply } = route?.params ?? {};
  const [applyVisible, setApplyVisible] = useState(false);

  // Support deep-linking directly to apply modal from job card "Apply Now"
  useEffect(() => {
    if (openApply) setApplyVisible(true);
  }, [openApply]);

  const avatarColor = AVATAR_COLORS[(job?.companyColorIndex ?? 0) % AVATAR_COLORS.length];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Job Board"
        subtitle="Browse verified jobs and apply instantly."
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Company + Apply Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.companyRow}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{job?.companyInitial ?? 'C'}</Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.textPrimary }]}>
                {job?.companyName ?? 'Company Name'}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={RFValue(9)} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                  {job?.location ?? '—'} · {job?.distance ?? ''}
                </Text>
              </View>
            </View>
            <View style={styles.rateBadge}>
              <Text style={styles.rateText}>{job?.rate ?? '—'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setApplyVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>

        {/* Job Description */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Job Description</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We are looking for a skilled and reliable Electrician to handle electrical installations,
            repairs, and maintenance work for our ongoing project. The ideal candidate should have
            strong technical knowledge, attention to detail, and the ability to deliver high-quality
            work within deadlines.
          </Text>
          <Text style={[styles.subHeading, { color: colors.textPrimary }]}>Responsibilities</Text>
          {[
            'Install, repair, and maintain electrical systems, wiring, and fixtures.',
            'Read and interpret technical diagrams, blueprints, and circuit layouts.',
            'Troubleshoot electrical issues and provide effective solutions.',
            'Ensure all electrical tasks meet safety standards and project requirements.',
            'Collaborate with project managers and other subcontractors on site.',
            'Test electrical components to ensure proper functioning.',
          ].map((item, i) => (
            <Text key={i} style={[styles.bulletText, { color: colors.textSecondary }]}>
              {'• '}
              {item}
            </Text>
          ))}
          <Text style={[styles.subHeading, { color: colors.textPrimary }]}>Requirements</Text>
          {[
            'Proven experience as a professional electrician.',
            'Valid electrician license or certification (where applicable).',
            'Strong understanding of electrical codes and safety regulations.',
            'Ability to work independently and manage time effectively.',
            'Good communication and teamwork skills.',
            'Must have own tools and transportation (preferred).',
          ].map((item, i) => (
            <Text key={i} style={[styles.bulletText, { color: colors.textSecondary }]}>
              {'• '}
              {item}
            </Text>
          ))}
        </View>

        {/* Site Maps & Documents */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Site maps &amp; Documents
          </Text>
          <TouchableOpacity
            style={[styles.docRow, { borderColor: colors.border }]}
            activeOpacity={0.75}
          >
            <FileText size={RFValue(14)} color="#10375C" strokeWidth={2} />
            <Text style={[styles.docText, { color: '#10375C' }]}>
              {job?.companyName?.toLowerCase().replace(/\s/g, '') ?? 'sitemap'}.pdf
            </Text>
          </TouchableOpacity>
        </View>

        {/* Job Overview */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Job Overview</Text>
          <View style={styles.overviewGrid}>
            <OverviewItem icon={Briefcase} label="Role" value={job?.trade ?? 'Electrician'} colors={colors} />
            <OverviewItem icon={Clock} label="Duration" value="4 Weeks" colors={colors} />
            <OverviewItem icon={Calendar} label="Start Date" value="Oct 30, 2024" colors={colors} />
            <OverviewItem
              icon={MapPin}
              label="Location"
              value={job?.location ?? '81 Guild Street, London, UK'}
              colors={colors}
            />
          </View>
        </View>

        {/* About the Company */}
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Building2 size={RFValue(14)} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.aboutTitle}>About the Company</Text>
          </View>
          <Text style={styles.aboutText}>
            {job?.companyName ?? 'Site Structure'} is a verified contractor on SubConnect with a
            4.6/5 rating from 24 reviews. They specialise in commercial and residential electrical
            projects across London and the South East.
          </Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <Star
                key={n}
                size={RFValue(12)}
                color={n <= 4 ? '#F2A154' : 'rgba(255,255,255,0.3)'}
                fill={n <= 4 ? '#F2A154' : 'transparent'}
                strokeWidth={1.5}
              />
            ))}
            <Text style={styles.ratingText}>4.6 · 24 reviews</Text>
          </View>
        </View>
      </ScrollView>

      <ApplyJobModal
        visible={applyVisible}
        onClose={() => setApplyVisible(false)}
        jobTitle={job?.title}
        onSeeMyJobs={() => navigation.navigate('SubTabs', { screen: 'JobBoard' })}
      />
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

  // Company row inside card
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
  },
  companyInfo: { flex: 1, gap: 3 },
  companyName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
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
  applyBtn: {
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
  },

  // Description
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    marginBottom: 10,
  },
  bodyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
    marginBottom: 12,
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

  // Documents
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  docText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    textDecorationLine: 'underline',
  },

  // Overview grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  overviewItem: {
    width: '47%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  overviewIcon: {
    marginBottom: 2,
  },
  overviewLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  overviewValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },

  // About the Company
  aboutCard: {
    backgroundColor: '#10375C',
    borderRadius: 16,
    padding: 16,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  aboutTitle: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },
  aboutText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    marginLeft: 4,
  },
});

export default SubJobDetailScreen;
