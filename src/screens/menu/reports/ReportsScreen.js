import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ScrollView } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import StatCard from '~components/Common/StatCard';
import { PoundSterling, Briefcase, Clock, CheckSquare } from 'lucide-react-native';
import useCompanyReports from '~hooks/useCompanyReports';

import SpendTrendChart from './components/SpendTrendChart';
import CostDistributionChart from './components/CostDistributionChart';
import ProjectCostList from './components/ProjectCostList';
import TopContractorsList from './components/TopContractorsList';

const ReportsScreen = () => {
  const { colors } = useTheme();
  const { reports, loading, getReports } = useCompanyReports();

  useEffect(() => { getReports(); }, []);

  const s = reports?.stats;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Reports and Analytics"
        subtitle="Insights into project costs, timelines, and contractor performance."
        showBackButton
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Top 2x2 Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <View style={styles.statCell}>
              <StatCard
                label="Total Spend (YTD)"
                value={s?.totalSpend ?? '—'}
                subLabel={s?.totalSpendSub || null}
                icon={PoundSterling}
                iconColor="#10375C"
                positive={s?.totalSpendPositive ?? false}
              />
            </View>
            <View style={styles.statCell}>
              <StatCard
                label="Active Projects"
                value={s?.activeProjects != null ? String(s.activeProjects) : '—'}
                subLabel={s?.activeProjectsSub || null}
                icon={Briefcase}
                iconColor="#10375C"
                positive={s?.activeProjectsPositive ?? true}
              />
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statCell}>
              <StatCard
                label="Avg Contractor Rating"
                value={s?.avgRating ?? '—'}
                icon={CheckSquare}
                iconColor="#10375C"
                positive={true}
              />
            </View>
            <View style={styles.statCell}>
              <StatCard
                label="On-Time Completion"
                value={s?.onTimeCompletion ?? '—'}
                subLabel={s?.onTimeSub || null}
                icon={Clock}
                iconColor="#10375C"
                positive={s?.onTimePositive ?? false}
              />
            </View>
          </View>
        </View>

        <SpendTrendChart data={reports?.spendTrend} />

        <CostDistributionChart data={reports?.costDistribution} />

        <ProjectCostList data={reports?.projectCosts} />

        <TopContractorsList data={reports?.topContractors} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120, // space for tab bar
  },
  statsGrid: {
    marginBottom: 20,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCell: {
    flex: 1,
  },
});

export default ReportsScreen;
