import React from 'react';
import { View, StyleSheet, } from 'react-native';
import { ScrollView } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import StatCard from '~components/Common/StatCard';
import { PoundSterling, Briefcase, Clock, CheckSquare } from 'lucide-react-native';

import SpendTrendChart from './components/SpendTrendChart';
import CostDistributionChart from './components/CostDistributionChart';
import ProjectCostList from './components/ProjectCostList';
import TopContractorsList from './components/TopContractorsList';

const ReportsScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Reports and Analytics"
        subtitle="Insights into project costs, timelines, and contractor performance."
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Top 2x2 Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <View style={styles.statCell}>
              <StatCard
                label="Total Spend (YTD)"
                value="£142,500"
                subLabel="↘ +12% vs last year"
                icon={PoundSterling}
                iconColor="#10375C"
                positive={false}
              />
            </View>
            <View style={styles.statCell}>
              <StatCard
                label="Active Projects"
                value="8"
                subLabel="↗ +2 vs last month"
                icon={Briefcase}
                iconColor="#10375C"
                positive={true}
              />
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statCell}>
              <StatCard
                label="Avg Contractor Rating"
                value="4.8/5.0"
                subLabel="↗ Top 10% of Industry"
                icon={CheckSquare}
                iconColor="#10375C"
                positive={true}
              />
            </View>
            <View style={styles.statCell}>
              <StatCard
                label="On-Time Completion"
                value="94%"
                subLabel="↘ -2% vs target"
                icon={Clock}
                iconColor="#10375C"
                positive={false}
              />
            </View>
          </View>
        </View>

        <SpendTrendChart />

        <CostDistributionChart />

        <ProjectCostList />

        <TopContractorsList />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
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
