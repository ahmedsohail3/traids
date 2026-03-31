/**
 * CompanyDashboardScreen
 *
 * Displays two states:
 *   • Empty  — 00 stats, no-activity placeholders (no chart, no jobs)
 *   • Filled — real metrics, trend chart, budget bars, recent jobs list
 *
 * The `hasData` boolean is derived from the redux store. It switches automatically;
 * no extra prop is needed.
 */
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  Briefcase,
  Users,
  ClipboardCheck,
  PoundSterling,
  BarChart3,
  BanknoteIcon,
} from 'lucide-react-native';

import Header from '~components/Header';
import {
  ScrollView,
  Text,
} from '~components/Common';
import StatCard from '~components/Common/StatCard';
import SectionCard from '~components/Common/SectionCard';
import EmptyState from '~components/Common/EmptyState';
import TrendChart from '~components/Common/TrendChart';
import BudgetBar from '~components/Common/BudgetBar';
import JobCard from '~components/Common/JobCard';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';

// ─── Mock data (replace with Redux selectors) ─────────────────────────────────
const EMPTY_STATS = {
  activeJobs: 0,
  subsBooked: 0,
  pendingApprovals: 0,
  monthlySpend: 0,
};

const FILLED_STATS = {
  activeJobs: 14,
  subsBooked: 38,
  pendingApprovals: 5,
  monthlySpend: 42500,
};

const TREND_DATA   = [2, 5, 4, 8, 6, 9, 7];
const TREND_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BUDGET_ITEMS = [
  { label: 'Materials', value: 90, color: '#10375C' },
  { label: 'Labor',     value: 65, color: '#F2A154' },
  { label: 'Permits',   value: 30, color: '#94A3B8' },
  { label: 'Other',     value: 20, color: '#CBD5E1' },
];

const RECENT_JOBS = [
  { jobId: 'Job #1', title: 'Downtown Office Renovation', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'Pending' },
  { jobId: 'Job #1', title: 'Plumber Required for Small Task', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'Active' },
  { jobId: 'Job #1', title: 'Electrician Required', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'Accepted' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
const CompanyDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();

  // TODO: replace with real selector: const hasData = useSelector(s => s.jobs.hasData);
  const [hasData, setHasData] = useState(false); // Toggle for dev preview

  const stats = hasData ? FILLED_STATS : EMPTY_STATS;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Dashboard"
        subtitle="Welcome back, here's what's happening today."
        showPostButton
        onPostPress={() => navigation.navigate?.('PostJob')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Stats grid ── */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Active Jobs"
              value={stats.activeJobs}
              subLabel={hasData ? '+3 vs last month' : 'No active jobs yet'}
              icon={Briefcase}
              positive={hasData}
            />
            <View style={styles.statsGap} />
            <StatCard
              label="Subs Booked"
              value={stats.subsBooked}
              subLabel={hasData ? '+12% vs last month' : 'No subs booked'}
              icon={Users}
              positive={hasData}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Pending Approvals"
              value={stats.pendingApprovals}
              subLabel={hasData ? '+2 vs last month' : 'Nothing pending'}
              icon={ClipboardCheck}
              positive={hasData}
            />
            <View style={styles.statsGap} />
            <StatCard
              label="Monthly Spend"
              value={hasData ? `£${stats.monthlySpend.toLocaleString()}` : stats.monthlySpend}
              subLabel={hasData ? '+8.5% vs last month' : 'No spending recorded'}
              icon={PoundSterling}
              positive={hasData}
            />
          </View>
        </View>

        {/* ── Active Jobs Trend ── */}
        <SectionCard
          title="Active Jobs Trend"
          rightLabel="This Week ▾"
          style={styles.sectionMargin}>
          {hasData ? (
            <TrendChart data={TREND_DATA} labels={TREND_LABELS} color="#10375C" />
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
          {hasData ? (
            BUDGET_ITEMS.map(b => (
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

        {/* ── Recent Jobs (only when data exists) ── */}
        {hasData && (
          <View style={styles.sectionMargin}>
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>Recent Jobs</Text>
              <TouchableOpacity onPress={() => navigation.navigate?.('AllJobs')}>
                <Text style={[styles.viewAll, { color: colors.secondary }]}>View All Jobs</Text>
              </TouchableOpacity>
            </View>
            {RECENT_JOBS.map((job, i) => (
              <JobCard
                key={i}
                {...job}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </View>
        )}

        {/* Dev toggle — remove in production */}
        <TouchableOpacity
          onPress={() => setHasData(p => !p)}
          style={[styles.devToggle, { backgroundColor: colors.primary }]}>
          <Text style={styles.devToggleText}>
            {hasData ? 'Switch to Empty State' : 'Switch to Data State'}
          </Text>
        </TouchableOpacity>
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
  sectionMargin: { marginTop: 16 },
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
  // Dev only
  devToggle: {
    marginTop: 24,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  devToggleText: {
    color: '#fff',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },
});

export default CompanyDashboardScreen;
