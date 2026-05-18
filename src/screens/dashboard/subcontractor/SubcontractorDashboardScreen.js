/**
 * SubcontractorDashboardScreen
 *
 * Displays the subcontractor home dashboard with:
 *   • Key stats: Earnings, Upcoming Jobs, Pending Timesheets
 *   • Profile completion progress bar
 *   • "Recommended For You" job cards with Apply Now CTA
 *   • "Recent Jobs" list using the shared JobCard component
 *
 * Data comes from /subcontractor/dashboard via useSubcontractorDashboard.
 * Each section shows EmptyState when the API returns nothing / zeroed values.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import EmptyState from '~components/Common/EmptyState';
import SubBookingCard from '~components/Job/SubBookingCard';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';
import useProfile from '~hooks/useProfile';
import useSubcontractorDashboard from '~hooks/useSubcontractorDashboard';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';
import useSubcontractorBookings from '~hooks/useSubcontractorBookings';

// ─── Data mapping helpers ─────────────────────────────────────────────────────

const fmtChange    = (n) => `${n > 0 ? '+' : ''}${n} vs last month`;
const fmtPct       = (n) => `${n > 0 ? '+' : ''}${n}% vs last month`;
const fmtCurrency  = (n) => `£${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const mapStats = (data) => ({
  earnings:               data?.earnings?.current          ?? data?.totalEarnings  ?? 0,
  earningsChangePct:      data?.earnings?.changePercent    ?? 0,
  pendingTimesheets:      data?.pendingTimesheets?.current ?? data?.pendingTimesheets ?? 0,
  pendingTimesheetsChange:data?.pendingTimesheets?.change  ?? 0,
  upcomingJobOffers:      data?.upcomingJobOffers?.current ?? data?.upcomingJobOffers   ?? 0,
  upcomingJobOffersChange:data?.upcomingJobOffers?.change  ?? 0,
});

const mapProfileCompletion = (data) =>
  data?.profileCompletion ?? data?.profileCompletionPercentage ?? 0;



// ─── Sub-components ───────────────────────────────────────────────────────────

const ProfileCompletion = ({ name, pct, colors }) => (
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
    <View style={styles.recTopRow}>
      <View style={[styles.recAvatar, { backgroundColor: '#EFF6FF' }]}>
        <Wrench size={RFValue(16)} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text style={[styles.recTitle, { color: colors.textPrimary }]}>{job.title}</Text>
        <Text style={[styles.recCompany, { color: colors.textSecondary }]}>{job.company ?? job.companyName}</Text>
      </View>
      <View style={[styles.rateBadge, { backgroundColor: colors.secondary }]}>
        <Text style={styles.rateBadgeText}>{job.badge ?? job.rate ?? job.hourlyRate}</Text>
      </View>
    </View>

    <Text style={[styles.recDesc, { color: colors.textSecondary }]} numberOfLines={4}>
      {job.description}
    </Text>

    <View style={styles.recMetaRow}>
      <View style={styles.metaItem}>
        <CalendarDays size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>Starts {job.startDate ?? job.start}</Text>
      </View>
      <View style={styles.metaItem}>
        <MapPin size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{job.location}</Text>
      </View>
    </View>
    <View style={styles.recMetaRow}>
      <View style={styles.metaItem}>
        <Users size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{job.workers ?? job.workersRequired}</Text>
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
  const { profile } = useProfile();
  const { dashboard, loading, hasData, getDashboard } = useSubcontractorDashboard();
  const { recommendedJobs, getRecommendedJobs } = useSubcontractorJobs();
  const { inProgress, getBookings } = useSubcontractorBookings();

  useEffect(() => {
    getDashboard();
    getRecommendedJobs();
    getBookings();
  }, []);

  const stats      = mapStats(dashboard);
  const profilePct = mapProfileCompletion(dashboard);

  const displayName = profile?.fullName ?? profile?.primaryContactName ?? '—';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title={`Welcome Back, ${displayName}`}
        subtitle="Here is your activity overview..."
      />

      {loading && !hasData && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Stats ── */}
        <View style={styles.statsGrid}>
          <View style={[styles.statsRow, { gap: 12 }]}>
            <StatCard
              label="Total Earnings"
              value={stats.earnings > 0 ? fmtCurrency(stats.earnings) : '£0.00'}
              subLabel={stats.earnings > 0 ? fmtPct(stats.earningsChangePct) : 'No earnings yet'}
              icon={PoundSterling}
              positive={stats.earnings > 0}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Pending Offers"
              value={stats.upcomingJobOffers}
              subLabel={stats.upcomingJobOffers > 0 ? fmtChange(stats.upcomingJobOffersChange) : 'No upcoming offers'}
              icon={CalendarDays}
              positive={stats.upcomingJobOffers > 0}
            />
            <View style={styles.statsGap} />
            <StatCard
              label="Pending Timesheets"
              value={stats.pendingTimesheets}
              subLabel={stats.pendingTimesheets > 0 ? fmtChange(stats.pendingTimesheetsChange) : 'None pending'}
              icon={Clock}
              positive={false}
            />
          </View>
        </View>

        {/* ── Profile completion ── */}
        <ProfileCompletion name={displayName} pct={profilePct} colors={colors} />

        {/* ── Recommended For You ── */}
        <SectionCard
          title="Recommended For You"
          rightAction={
            <TouchableOpacity onPress={() => navigation.navigate?.('JobBoard')}>
              <Text style={[styles.viewAll, { color: colors.secondary }]}>View All Jobs</Text>
            </TouchableOpacity>
          }
          style={styles.sectionMargin}>
          {recommendedJobs.length > 0 ? (
            recommendedJobs.map((job) => (
              <RecommendedJobCard
                key={job.id ?? job._id}
                job={job}
                colors={colors}
                onApply={() => navigation.navigate?.('SubJobDetail', { jobId: job.id ?? job._id })}
              />
            ))
          ) : (
            <EmptyState
              icon={Images.noJobs}
              title="No recommendations yet"
              subtitle="Jobs matched to your skills will appear here"
            />
          )}
        </SectionCard>

        {/* ── Active Bookings ── */}
        <SectionCard
          title="Active Bookings"
          rightAction={
            <TouchableOpacity onPress={() => navigation.navigate?.('SubBookings')}>
              <Text style={[styles.viewAll, { color: colors.secondary }]}>View All</Text>
            </TouchableOpacity>
          }
          style={styles.sectionMargin}>
          {inProgress.length > 0 ? (
            inProgress.map((booking) => (
              <SubBookingCard
                key={booking.id ?? booking._id}
                {...booking}
                onPress={() => navigation.navigate?.('SubBookingDetail', { booking })}
              />
            ))
          ) : (
            <EmptyState
              icon={Images.noJobs}
              title="No active bookings"
              subtitle="Your in-progress bookings will appear here"
            />
          )}
        </SectionCard>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  scroll:        { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  statsGrid:     { gap: 12 },
  statsRow:      { flexDirection: 'row' },
  statsGap:      { width: 12 },
  sectionMargin: { marginTop: 20 },

  // Profile card
  profileCard: {
    borderRadius: 14, padding: RFValue(14), marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  profileRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  profileAvatar:{
    width: RFValue(38), height: RFValue(38), borderRadius: RFValue(19),
    alignItems: 'center', justifyContent: 'center',
  },
  profileName:  { fontSize: RFValue(13), fontFamily: FontFamily.semiBold },
  profileLabel: { fontSize: RFValue(10), fontFamily: FontFamily.regular },
  profilePct:   { fontSize: RFValue(13), fontFamily: FontFamily.bold },
  progressTrack:{ height: RFValue(8), borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },

  // Recommended card
  recCard: {
    borderRadius: 14, padding: RFValue(14), marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  recTopRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  recAvatar:   {
    width: RFValue(36), height: RFValue(36), borderRadius: RFValue(18),
    alignItems: 'center', justifyContent: 'center',
  },
  recTitle:    { fontSize: RFValue(12), fontFamily: FontFamily.bold },
  recCompany:  { fontSize: RFValue(10), fontFamily: FontFamily.regular },
  rateBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  rateBadgeText:{ color: '#fff', fontSize: RFValue(10), fontFamily: FontFamily.semiBold },
  recDesc: {
    fontSize: RFValue(11), fontFamily: FontFamily.regular,
    lineHeight: RFValue(16), marginBottom: 10,
  },
  recMetaRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  metaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1,
    borderWidth: 0.95, borderColor: '#E2E8F0',
    paddingHorizontal: RFValue(5), paddingVertical: RFValue(2), borderRadius: RFValue(5),
  },
  meta: { fontSize: RFValue(10), fontFamily: FontFamily.regular, flex: 1 },
  applyBtn: { marginTop: 12 },

  viewAll: { fontSize: RFValue(11), fontFamily: FontFamily.medium },
});

export default SubcontractorDashboardScreen;
