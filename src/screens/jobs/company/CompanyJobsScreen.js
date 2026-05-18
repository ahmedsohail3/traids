import React, { useState, useEffect, useMemo } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Search } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import JobCard from '~components/Common/JobCard';
import FilterTabs from '~components/Common/FilterTabs';
import useCompanyJobs from '~hooks/useCompanyJobs';

// ── Data mapper ───────────────────────────────────────────────────────────────

const STATUS_MAP = {
  pending:       'Pending',
  active:        'Active',
  accepted:      'Accepted',
  'in progress': 'In progress',
  in_progress:   'In progress',
  inprogress:    'In progress',
  completed:     'Completed',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return `Starts ${new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
};

const mapJob = (raw, index) => ({
  _id:       raw._id,
  jobId:     `Job #${index + 1}`,
  title:     raw.jobTitle    ?? '—',
  trade:     raw.trade       ?? '—',
  location:  raw.siteAddress ?? '—',
  assignee:  raw.assignedTo?.length > 0 ? (raw.assignedTo[0]?.fullName ?? 'Assigned') : 'Unassigned',
  startDate: formatDate(raw.timelineStartDate),
  status:    STATUS_MAP[raw.status?.toLowerCase()] ?? 'Pending',
  typeOfJob: raw.typeOfJob,
});

// ── Screen ────────────────────────────────────────────────────────────────────

const CompanyJobsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { jobs, loading, getJobs } = useCompanyJobs();

  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => { getJobs(); }, []);

  const mapped = useMemo(() => jobs.map(mapJob), [jobs]);

  const filterTabs = useMemo(() => {
    const counts = mapped.reduce((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    }, {});
    return [
      { key: 'All',         label: 'All',         count: mapped.length },
      { key: 'In progress', label: 'In Progress',  count: counts['In progress'] ?? 0 },
      { key: 'Accepted',    label: 'Accepted',     count: counts.Accepted   ?? 0 },
      { key: 'Pending',     label: 'Pending',      count: counts.Pending    ?? 0 },
      { key: 'Completed',   label: 'Completed',    count: counts.Completed  ?? 0 },
    ];
  }, [mapped]);

  const filtered = useMemo(() => mapped.filter((job) => {
    const matchesTab    = activeTab === 'All' || job.status === activeTab;
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }), [mapped, activeTab, search]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="My Jobs" subtitle="Manage your active listings and ongoing projects." />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Search size={RFValue(13)} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <FilterTabs tabs={filterTabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Jobs List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filtered.length === 0 && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No jobs found.</Text>
            </View>
          ) : (
            filtered.map((job, index) => (
              <JobCard
                key={job._id ?? index}
                {...job}
                onPress={() => navigation.navigate('CompanyJobDetail', { job, status: job.status })}
                onEdit={() => {}}
                onDelete={() => {}}
                onShare={() => {}}
                onStart={job.status !== 'Completed' ? () => {} : undefined}
                status={job.status}
              />
            ))
          )}

          <View style={styles.paginationRow}>
            <Text style={styles.paginationText}>Showing 1–{filtered.length} of {mapped.length}</Text>
            <View style={styles.pageButtons}>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>«</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pageBtn, styles.pageBtnActive]}><Text style={[styles.pageText, { color: '#FFFFFF' }]}>1</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>»</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:      { flex: 1 },
  container: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    padding: 0,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  emptyWrap:   { alignItems: 'center', paddingTop: 40 },
  emptyText:   { fontFamily: FontFamily.regular, fontSize: RFValue(12) },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paginationText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#64748B' },
  pageButtons:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pageBtn: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  pageBtnActive: { backgroundColor: '#10375C', borderColor: '#10375C' },
  pageText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#10375C' },
});

export default CompanyJobsScreen;
