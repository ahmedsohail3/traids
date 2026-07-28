/**
 * CompanyDashboardScreen
 *
 * Displays two states per section:
 *   • Empty  — EmptyState placeholder when value is 0 / null / missing
 *   • Filled — real data from /company/dashboard
 *
 * Stat cards always render; chart / budget / jobs sections gate on real values.
 */
import { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Briefcase, Users, ClipboardCheck, PoundSterling } from 'lucide-react-native';

import Header from '~components/Header';
import { ScrollView, Text } from '~components/Common';
import StatCard from '~components/Common/StatCard';
import SectionCard from '~components/Common/SectionCard';
import EmptyState from '~components/Common/EmptyState';
import TrendChart from '~components/Common/TrendChart';
import BudgetBar from '~components/Common/BudgetBar';
import JobCard from '~components/Common/JobCard';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';
import useDashboard from '~hooks/useDashboard';
import useCompanyJobs from '~hooks/useCompanyJobs';

// ─── Data mapping ─────────────────────────────────────────────────────────────

const mapStats = (data) => ({
  activeJobs:             data?.activeJobs?.current          ?? 0,
  activeJobsChange:       data?.activeJobs?.change           ?? 0,
  subsBooked:             data?.subsBooked?.current          ?? 0,
  subsBookedChange:       data?.subsBooked?.change           ?? 0,
  pendingApprovals:       data?.pendingApprovals?.current    ?? 0,
  pendingApprovalsChange: data?.pendingApprovals?.change     ?? 0,
  monthlySpend:           data?.monthlySpend?.current        ?? 0,
  monthlySpendPrev:       data?.monthlySpend?.previousMonth  ?? 0,
  monthlySpendChangePct:  data?.monthlySpend?.changePercent  ?? 0,
});

const mapTrend = (data) => {
  const items = data?.activeJobsTrend ?? [];
  return {
    values:  items.map((i) => i.count),
    labels:  items.map((i) => i.day),
    hasData: items.length > 0,
  };
};

const mapBudget = (data) => {
  const b     = data?.budgetSpent;
  const total = b?.total ?? 0;
  const labor = b?.labor ?? 0;
  if (total <= 0) return { bars: [], hasData: false };
  const other = Math.max(0, total - labor);
  const pct   = (n) => Math.round((n / total) * 100);
  return {
    hasData: true,
    bars: [
      { label: 'Labour', value: pct(labor), color: '#F2A154' },
      { label: 'Other',  value: pct(other), color: '#94A3B8' },
    ],
  };
};

const STATUS_MAP = {
  in_progress: 'In Progress',
  'in progress': 'In Progress',
  pending:     'Pending',
  completed:   'Completed',
  accepted:    'Accepted',
  active:      'Active',
};

const mapJobToCard = (job, index) => ({
  jobId:     `Job #${index + 1}`,
  title:     job.jobTitle    ?? '—',
  trade:     job.trade       ?? '—',
  location:  job.siteAddress ?? '—',
  assignee:  Array.isArray(job.assignedTo) && job.assignedTo.length > 0
               ? `${job.assignedTo.length} Worker${job.assignedTo.length > 1 ? 's' : ''}`
               : 'Unassigned',
  startDate: job.timelineStartDate
               ? new Date(job.timelineStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
               : '—',
  status:    STATUS_MAP[(job.status ?? '').toLowerCase()] ?? 'Pending',
  _id:       job._id,
  _raw:      job,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtChange = (n) =>
  n === 0 ? 'Same as last month' : `${n > 0 ? '+' : ''}${n} vs last month`;

const fmtPct = (n) =>
  n === 0 ? 'Same as last month' : `${n > 0 ? '+' : ''}${n}% vs last month`;

// ─── Screen ───────────────────────────────────────────────────────────────────
const CompanyDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { dashboard, loading, hasData, getDashboard } = useDashboard();
  const { jobs, getJobs } = useCompanyJobs();

  useEffect(() => { getDashboard(); getJobs(); }, []);

  const stats      = mapStats(dashboard);
  const trend      = mapTrend(dashboard);
  const budget     = mapBudget(dashboard);
  const recentJobs = (() => {
    const active    = jobs.filter((j) => (j.status ?? '').toLowerCase() !== 'completed');
    const completed = jobs.filter((j) => (j.status ?? '').toLowerCase() === 'completed');
    const priority  = [...active, ...completed].slice(0, 3);
    return priority.map(mapJobToCard);
  })();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Dashboard"
        subtitle="Welcome back, here's what's happening today."
        showPostButton
        onPostPress={() => navigation.navigate?.('PostJob')}
      />

      {loading && !hasData && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Stats grid — always visible ── */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Active Jobs"
              value={stats.activeJobs}
              subLabel={stats.activeJobs > 0 ? fmtChange(stats.activeJobsChange) : 'No active jobs yet'}
              icon={Briefcase}
              positive={stats.activeJobs > 0}
            />
            <View style={styles.statsGap} />
            <StatCard
              label="Subs Booked"
              value={stats.subsBooked}
              subLabel={stats.subsBooked > 0 ? fmtChange(stats.subsBookedChange) : 'No subs booked'}
              icon={Users}
              positive={stats.subsBooked > 0}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Pending Approvals"
              value={stats.pendingApprovals}
              subLabel={stats.pendingApprovals > 0 ? fmtChange(stats.pendingApprovalsChange) : 'Nothing pending'}
              icon={ClipboardCheck}
              positive={stats.pendingApprovals > 0}
            />
            <View style={styles.statsGap} />
            <StatCard
              label="Monthly Spend"
              value={stats.monthlySpend > 0 ? `£${stats.monthlySpend.toLocaleString()}` : `£0`}
              subLabel={
                stats.monthlySpend > 0 || stats.monthlySpendPrev > 0
                  ? fmtPct(stats.monthlySpendChangePct)
                  : 'No spending recorded'
              }
              icon={PoundSterling}
              positive={stats.monthlySpend > 0}
            />
          </View>
        </View>

        {/* ── Active Jobs Trend ── */}
        <SectionCard title="Active Jobs Trend" rightLabel="This Week ▾" style={styles.sectionMargin}>
          {trend.hasData ? (
            <TrendChart data={trend.values} labels={trend.labels} color="#10375C" />
          ) : (
            <EmptyState
              icon={Images.noJobs}
              title="No job activity yet"
              subtitle="Your weekly trend will appear here once jobs are created"
            />
          )}
        </SectionCard>

        {/* ── Budget Spent ── */}
        <SectionCard title="Budget Spent" style={styles.sectionMargin}>
          {budget.hasData ? (
            budget.bars.map((b) => (
              <BudgetBar key={b.label} label={b.label} value={b.value} color={b.color} />
            ))
          ) : (
            <EmptyState
              icon={Images.noBudget}
              title="No budget data available"
              subtitle="Spending insights will show once jobs are active"
            />
          )}
        </SectionCard>

        {/* ── Recent Jobs ── */}
        {recentJobs.length > 0 && (
          <View style={styles.sectionMargin}>
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>Recent Jobs</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Jobs')}>
                <Text style={[styles.viewAll, { color: colors.secondary }]}>View All Jobs</Text>
              </TouchableOpacity>
            </View>
            {recentJobs.map((job, i) => (
              <JobCard
                key={job._id ?? i}
                {...job}
                onPress={() => navigation.navigate('CompanyJobDetail', { job: job._raw })}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </View>
        )}

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
  scroll:       { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  statsGrid:    { gap: 12 },
  statsRow:     { flexDirection: 'row' },
  statsGap:     { width: 12 },
  sectionMargin:{ marginTop: 16 },
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  recentTitle:  { fontSize: RFValue(13), fontFamily: FontFamily.bold },
  viewAll:      { fontSize: RFValue(11), fontFamily: FontFamily.medium },
});

export default CompanyDashboardScreen;
