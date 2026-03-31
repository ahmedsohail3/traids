/**
 * SubcontractorDashboardScreen
 *
 * Displays the subcontractor home dashboard with:
 *   • Key stats: Subs Booked (earnings), Upcoming Jobs, Pending Timesheets
 *   • Profile completion progress bar
 *   • "Recommended For You" job cards with Apply Now CTA
 *   • "Recent Jobs" list using the shared JobCard component
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  PoundSterling,
  CalendarDays,
  Clock,
  User,
  MapPin,
  Users,
  Wrench,
} from 'lucide-react-native';

import Header from '~components/Header';
import { ScrollView, Text, Button } from '~components/Common';
import StatCard from '~components/Common/StatCard';
import SectionCard from '~components/Common/SectionCard';
import JobCard from '~components/Common/JobCard';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

// ─── Mock data ────────────────────────────────────────────────────────────────
const RECOMMENDED_JOBS = [
  {
    id: '1',
    company: 'Voltprim Ltd',
    title: 'Senior Electrician',
    badge: '£21/hour',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to detail, and the ability to deliver high-quality work.',
    startDate: 'Nov 1',
    location: '8 Guild Street, London, UK',
    workers: '2 workers Required',
    trade: 'Electrician',
  },
  {
    id: '2',
    company: 'Voltprim Ltd',
    title: 'Senior Electrician',
    badge: '£21/hour',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project.',
    startDate: 'Nov 1',
    location: '8 Guild Street, London, UK',
    workers: '2 workers Required',
    trade: 'Electrician',
  },
  {
    id: '3',
    company: 'Voltprim Ltd',
    title: 'Senior Electrician',
    badge: '£21/hour',
    description:
      'We are looking for a skilled and reliable Electrician...',
    startDate: 'Nov 1',
    location: '8 Guild Street, London, UK',
    workers: '2 workers Required',
    trade: 'Electrician',
  },
];

const RECENT_JOBS = [
  { jobId: 'Roofing', title: 'Plumber Required for Small Task', trade: 'Electrician', location: '21 Guild Street, London, UK', assignee: '1 workers Required', startDate: 'Electrician', status: 'In Progress' },
  { jobId: 'Roofing', title: 'Plumber Required for Small Task', trade: 'Electrician', location: '21 Guild Street, London, UK', assignee: '1 workers Required', startDate: 'Electrician', status: 'In Progress' },
  { jobId: 'Roofing', title: 'Plumber Required for Small Task', trade: 'Electrician', location: '21 Guild Street, London, UK', assignee: '1 workers Required', startDate: 'Electrician', status: 'In Progress' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProfileCompletion = ({ name, pct = 70, colors }) => (
  <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
    <View style={styles.profileRow}>
      <View style={[styles.profileAvatar, { backgroundColor: '#DCFCE7' }]}>
        <User size={RFValue(20)} color="#15803D" strokeWidth={2} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.profileName, { color: colors.textPrimary }]}>{name}</Text>
        <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Profile Completion</Text>
      </View>
      <Text style={[styles.profilePct, { color: colors.primary }]}>{pct}%</Text>
    </View>
    <View style={[styles.progressTrack, { backgroundColor: colors.border ?? '#E5E7EB' }]}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.secondary ?? '#F97316' }]} />
    </View>
  </View>
);

const RecommendedJobCard = ({ job, colors, onApply }) => (
  <View style={[styles.recCard, { backgroundColor: colors.surface }]}>
    {/* Header row */}
    <View style={styles.recTopRow}>
      <View style={[styles.recAvatar, { backgroundColor: '#EFF6FF' }]}>
        <Wrench size={RFValue(16)} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text style={[styles.recTitle, { color: colors.textPrimary }]}>{job.title}</Text>
        <Text style={[styles.recCompany, { color: colors.textSecondary }]}>{job.company}</Text>
      </View>
      <View style={[styles.rateBadge, { backgroundColor: colors.secondary }]}>
        <Text style={styles.rateBadgeText}>{job.badge}</Text>
      </View>
    </View>

    <Text style={[styles.recDesc, { color: colors.textSecondary }]} numberOfLines={4}>
      {job.description}
    </Text>

    {/* Meta */}
    <View style={styles.recMetaRow}>
      <View style={styles.metaItem}>
        <CalendarDays size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>Starts {job.startDate}</Text>
      </View>
      <View style={styles.metaItem} >
        <MapPin size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{job.location}</Text>
      </View>
    </View>
    <View style={styles.recMetaRow}>
      <View style={styles.metaItem}>
        <Users size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{job.workers}</Text>
      </View>
      <View style={styles.metaItem}>
        <Wrench size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{job.trade}</Text>
      </View>
    </View>

    <Button title="Apply Now" onPress={onApply} style={styles.applyBtn} />
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const SubcontractorDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Welcome Back, Micahel"
        subtitle="here is your activity overview..."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Stats ── */}
        <View style={styles.statsGrid}>
          <View style={[styles.statsRow, { gap: 12 }]}>
            <StatCard
              label="Subs Booked"
              value="£840.00"
              subLabel="+4.5% vs last month"
              icon={PoundSterling}
              positive
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Upcoming Jobs"
              value={10}
              subLabel="+2 vs last month"
              icon={CalendarDays}
              positive
            />
            <View style={styles.statsGap} />
            <StatCard
              label="Pending Timesheets"
              value={3}
              subLabel="+9 vs last month"
              icon={Clock}
              positive={false}
            />
          </View>
        </View>

        {/* ── Profile completion ── */}
        <ProfileCompletion
          name="Michael Chen"
          pct={70}
          colors={colors}
        />

        {/* ── Recommended For You ── */}
        <View style={styles.sectionMargin}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>Recommended For You</Text>
            <TouchableOpacity onPress={() => navigation.navigate?.('JobBoard')}>
              <Text style={[styles.viewAll, { color: colors.secondary }]}>View All Jobs</Text>
            </TouchableOpacity>
          </View>
          {RECOMMENDED_JOBS.map(job => (
            <RecommendedJobCard
              key={job.id}
              job={job}
              colors={colors}
              onApply={() => navigation.navigate?.('JobDetail', { jobId: job.id })}
            />
          ))}
        </View>

        {/* ── Recent Jobs ── */}
        <View style={styles.sectionMargin}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>Recent Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate?.('AllJobs')}>
              <Text style={[styles.viewAll, { color: colors.secondary }]}>View All Jobs</Text>
            </TouchableOpacity>
          </View>
          {RECENT_JOBS.map((job, i) => (
            <JobCard key={i} {...job} onEdit={() => {}} onDelete={() => {}} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  statsGrid: { gap: 12 },
  statsRow: { flexDirection: 'row' },
  statsGap: { width: 12 },
  sectionMargin: { marginTop: 20 },

  // Profile card
  profileCard: {
    borderRadius: 14,
    padding: RFValue(14),
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatar: {
    width: RFValue(38),
    height: RFValue(38),
    borderRadius: RFValue(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.semiBold,
  },
  profileLabel: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
  },
  profilePct: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.bold,
  },
  progressTrack: {
    height: RFValue(8),
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },

  // Recommended card
  recCard: {
    borderRadius: 14,
    padding: RFValue(14),
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recAvatar: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: RFValue(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.bold,
  },
  recCompany: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
  },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rateBadgeText: {
    color: '#fff',
    fontSize: RFValue(10),
    fontFamily: FontFamily.semiBold,
  },
  recDesc: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    lineHeight: RFValue(16),
    marginBottom: 10,
  },
  recMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    borderWidth: 0.95,
    borderColor: '#E2E8F0',
    paddingHorizontal: RFValue(5),
    paddingVertical: RFValue(2),
    borderRadius: RFValue(5),
  },
  meta: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    flex: 1,
  },
  applyBtn: {
    marginTop: 12,
  },

  // Section headers
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.bold,
  },
  viewAll: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.medium,
  },
});

export default SubcontractorDashboardScreen;
