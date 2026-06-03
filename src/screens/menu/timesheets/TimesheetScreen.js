import React, { useEffect, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { FileSearch } from 'lucide-react-native';
import useCompanyJobs from '~hooks/useCompanyJobs';

const ACTIVE_STATUSES = new Set(['in_progress', 'in progress', 'completed']);

const TimesheetScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { jobs, loading, getJobs } = useCompanyJobs();

  useEffect(() => { getJobs(); }, []);

  const timesheetJobs = useMemo(
    () => jobs.filter((j) => ACTIVE_STATUSES.has((j.status ?? '').toLowerCase())),
    [jobs],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      
      <Header
        title="Timesheets"
        subtitle="Review work logs and generate professional projects invoices."
        showBackButton
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {!loading && timesheetJobs.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No active timesheets found.
            </Text>
          </View>
        )}

        {timesheetJobs.map((job, index) => (
          <TouchableOpacity
            key={job._id ?? index}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TimesheetProject', { projectTitle: job.jobTitle, job })}
          >
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <FileSearch size={RFValue(18)} color="#10375C" />
              </View>
              <View style={styles.titleWrap}>
                <Text style={styles.titleText}>{job.jobTitle ?? '—'}</Text>
                <Text style={styles.jobText}>Job #{index + 1}</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.metricBlockBox}>
                <Text style={styles.metricLabel}>Workers</Text>
                <Text style={styles.metricValue}>
                  {Array.isArray(job.assignedTo) ? job.assignedTo.length : 0}
                </Text>
              </View>
              <View style={styles.metricBlockBox}>
                <Text style={styles.metricLabel}>Hourly Rate</Text>
                <Text style={styles.metricValue}>
                  {job.hourlyRate != null ? `£${job.hourlyRate}/hr` : '—'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 120,
    gap: 12,
  },
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontFamily: FontFamily.regular, fontSize: RFValue(12) },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  titleText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11.5),
    marginBottom: 2,
  },
  jobText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9.5),
    color: '#64748B',
  },
  cardBottom: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBlockBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11.5),
    color: '#64748B',
  },
});

export default TimesheetScreen;
