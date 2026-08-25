/**
 * SubcontractorDashboardScreen
 *
 * Data comes from /subcontractor/dashboard via useSubcontractorDashboard.
 * Each section shows EmptyState when the API returns nothing / zeroed values.
 */
import { useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  PoundSterling,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Wrench,
  ChevronRight,
} from 'lucide-react-native';

import Header from '~components/Header';
import { ScrollView, Text, Button, Avatar } from '~components/Common';
import StatCard from '~components/Common/StatCard';
import EmptyState from '~components/Common/EmptyState';
import SubBookingCard from '~components/Job/SubBookingCard';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';
import useProfile from '~hooks/useProfile';
import useSubcontractorDashboard from '~hooks/useSubcontractorDashboard';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';
import useSubcontractorBookings from '~hooks/useSubcontractorBookings';
import { stripHtml } from '~utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NAVY   = '#10375C';
const ORANGE = '#F2A154';

const fmtCurrency = (n) =>
  `£${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// API shape: { totalEarnings, pendingOffers, pendingTimesheets, profileCompletion }
const mapStats = (data) => ({
  earnings:          data?.totalEarnings    ?? 0,
  pendingTimesheets: data?.pendingTimesheets ?? 0,
  pendingOffers:     data?.pendingOffers     ?? 0,
});

const mapProfileCompletion = (data) => data?.profileCompletion ?? 0;

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProfileCard = ({ profile, pct, colors, onPress }) => {
  const name    = profile?.fullName ?? profile?.primaryContactName ?? '—';
  const trade   = profile?.trade ?? profile?.primaryTrade ?? 'Subcontractor';

  return (
    <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
      {/* Top row: avatar | name + role | chevron */}
      <View style={styles.profileTopRow}>
        <Avatar uri={profile?.profileImage} size={RFValue(42)} />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>{name}</Text>
          <Text style={[styles.profileTrade, { color: colors.textSecondary }]}>{trade}</Text>
        </View>
        <TouchableOpacity onPress={onPress} hitSlop={8} activeOpacity={0.7}>
          <ChevronRight size={RFValue(16)} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Progress row */}
      <View style={styles.profileProgressRow}>
        <Text style={[styles.profileProgressLabel, { color: colors.textSecondary }]}>
          Profile Completion
        </Text>
        <Text style={[styles.profilePct, { color: ORANGE }]}>{pct}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.border ?? '#E5E7EB' }]}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
};

const SectionHeader = ({ title, actionLabel, onAction, colors }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
      <Text style={[styles.viewAll, { color: ORANGE }]}>{actionLabel}</Text>
    </TouchableOpacity>
  </View>
);

const RecommendedJobCard = ({ job, colors, onApply }) => (
  <View style={[styles.recCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.recTopRow}>
      <View style={[styles.recAvatar, { backgroundColor: '#EFF6FF' }]}>
        <Wrench size={RFValue(15)} color={NAVY} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text style={[styles.recTitle, { color: colors.textPrimary }]}>{job.jobTitle}</Text>
        <Text style={[styles.recCompany, { color: colors.textSecondary }]}>
          {job.company?.companyName ?? '—'}
        </Text>
      </View>
      <View style={styles.rateBadge}>
        <Text style={styles.rateBadgeText}>£{job.hourlyRate}/hr</Text>
      </View>
    </View>

    <Text style={[styles.recDesc, { color: colors.textSecondary }]} numberOfLines={4}>
      {stripHtml(job.description)}
    </Text>

    <View style={styles.recMetaRow}>
      <View style={[styles.metaItem, { borderColor: colors.border }]}>
        <CalendarDays size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          Starts {fmtDate(job.timelineStartDate)}
        </Text>
      </View>
      <View style={[styles.metaItem, { borderColor: colors.border }]}>
        <MapPin size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {job.siteAddress}
        </Text>
      </View>
    </View>
    <View style={styles.recMetaRow}>
      <View style={[styles.metaItem, { borderColor: colors.border }]}>
        <Users size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {job.workersRequired} worker{job.workersRequired !== 1 ? 's' : ''} Required
        </Text>
      </View>
      <View style={[styles.metaItem, { borderColor: colors.border }]}>
        <Wrench size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {job.trade ? job.trade.charAt(0).toUpperCase() + job.trade.slice(1) : '—'}
        </Text>
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
  const { offers, getBookings } = useSubcontractorBookings();

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
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Stats — full-width stacked ── */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Earnings"
            value={stats.earnings > 0 ? fmtCurrency(stats.earnings) : '£0.00'}
            subLabel={stats.earnings > 0 ? '↑ +3 vs last month' : 'No earnings yet'}
            icon={PoundSterling}
            positive={stats.earnings > 0}
          />
          <StatCard
            label="Pending Offers"
            value={stats.pendingOffers}
            subLabel={stats.pendingOffers > 0 ? `↑ +${stats.pendingOffers} vs last month` : 'No pending offers'}
            icon={CalendarDays}
            positive={stats.pendingOffers > 0}
          />
          <StatCard
            label="Pending Timesheets"
            value={stats.pendingTimesheets < 10 ? String(stats.pendingTimesheets).padStart(2, '0') : stats.pendingTimesheets}
            subLabel={stats.pendingTimesheets > 0 ? `↑ +${stats.pendingTimesheets} vs last month` : 'None pending'}
            icon={Clock}
            positive={false}
          />
        </View>

        {/* ── Profile completion ── */}
        <ProfileCard
          profile={profile}
          pct={profilePct}
          colors={colors}
          onPress={() => navigation.navigate('SubTabs', { screen: 'More', params: { screen: 'Settings' } })}
        />

        {/* ── Recommended For You ── */}
        <SectionHeader
          title="Recommended For You"
          actionLabel="View All Jobs"
          onAction={() => navigation.navigate?.('JobBoard')}
          colors={colors}
        />
        {recommendedJobs.length > 0 ? (
          recommendedJobs.map((job) => (
            <RecommendedJobCard
              key={job._id ?? job.id}
              job={job}
              colors={colors}
              onApply={() => navigation.navigate?.('SubJobDetail', { jobId: job._id ?? job.id })}
            />
          ))
        ) : (
          <View style={[styles.emptyWrap, { backgroundColor: colors.surface }]}>
            <EmptyState
              icon={Images.noJobs}
              title="No recommendations yet"
              subtitle="Jobs matched to your skills will appear here"
            />
          </View>
        )}

        {/* ── Recent Jobs ── */}
        <SectionHeader
          title="Recent Jobs"
          actionLabel="View All Jobs"
          onAction={() => navigation.getParent()?.navigate('Bookings')}
          colors={colors}
        />
        {offers.length > 0 ? (
          offers.map((offer, idx) => (
            <SubBookingCard
              key={offer._id}
              companyName={offer.company?.companyName ?? '—'}
              companyInitial={(offer.company?.companyName ?? '?')[0].toUpperCase()}
              companyColorIndex={idx % 5}
              title={offer.job?.jobTitle ?? '—'}
              status="Pending"
              description={stripHtml(offer.job?.description)}
              location={offer.job?.siteAddress ?? '—'}
              trade={offer.job?.trade ?? '—'}
              onPress={() => navigation.navigate?.('SubBookingDetail', { booking: offer })}
            />
          ))
        ) : (
          <View style={[styles.emptyWrap, { backgroundColor: colors.surface }]}>
            <EmptyState
              icon={Images.noJobs}
              title="No recent jobs yet"
              subtitle="Job offers sent to you will appear here"
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, gap: 16 },

  // Stats — stacked full-width
  statsGrid: { gap: 12 },

  // Profile card
  profileCard: {
    borderRadius: 14,
    padding: RFValue(14),
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  profileInfo:  { flex: 1 },
  profileName:  { fontFamily: FontFamily.semiBold, fontSize: RFValue(13), marginBottom: 2 },
  profileTrade: { fontFamily: FontFamily.regular, fontSize: RFValue(10), textTransform: 'capitalize' },
  profileProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileProgressLabel: { fontFamily: FontFamily.regular, fontSize: RFValue(10) },
  profilePct:           { fontFamily: FontFamily.bold, fontSize: RFValue(11) },
  progressTrack: { height: RFValue(7), borderRadius: 6, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 6, backgroundColor: ORANGE },

  // Section header row
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(14) },
  viewAll:      { fontFamily: FontFamily.medium, fontSize: RFValue(11) },

  // Recommended job card
  recCard: {
    borderRadius: 14,
    padding: RFValue(14),
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  recTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  recAvatar: {
    width: RFValue(34),
    height: RFValue(34),
    borderRadius: RFValue(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle:     { fontSize: RFValue(12), fontFamily: FontFamily.bold, marginBottom: 2 },
  recCompany:   { fontSize: RFValue(10), fontFamily: FontFamily.regular },
  rateBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: ORANGE },
  rateBadgeText:{ color: '#fff', fontSize: RFValue(10), fontFamily: FontFamily.semiBold },
  recDesc: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    lineHeight: RFValue(16),
    marginBottom: 10,
  },
  recMetaRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    borderWidth: 0.8,
    paddingHorizontal: RFValue(6),
    paddingVertical: RFValue(3),
    borderRadius: RFValue(5),
  },
  meta: { fontSize: RFValue(9.5), fontFamily: FontFamily.regular, flex: 1 },
  applyBtn: { marginTop: 4 },

  // Empty state wrapper
  emptyWrap: {
    borderRadius: 14,
    paddingVertical: 8,
  },
});

export default SubcontractorDashboardScreen;
