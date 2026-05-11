/**
 * CompanyJobsScreen — "My Jobs" screen for Company role.
 * Shows scrollable FilterTabs (All, In Progress, Accepted, Pending, Completed)
 * and a list of jobs using JobCard.
 */
import React, { useState } from 'react';
import { View, StyleSheet, TextInput,  TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Search } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import JobCard from '~components/Common/JobCard';
import FilterTabs from '~components/Common/FilterTabs';

const FILTER_TABS = [
  { key: 'All', label: 'All', count: 10 },
  { key: 'In progress', label: 'In Progress', count: 3 },
  { key: 'Accepted', label: 'Accepted', count: 1 },
  { key: 'Pending', label: 'Pending', count: 4 },
  { key: 'Completed', label: 'Completed', count: 2 },
];

const MOCK_JOBS = [
  { jobId: 'Job #1', title: 'Downtown Office Renovation', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'Pending' },
  { jobId: 'Job #1', title: 'Plumber Required for Small Task', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'In progress' },
  { jobId: 'Job #1', title: 'Electrician Small Job', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'In progress' },
  { jobId: 'Job #1', title: 'Electrician Required', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'Accepted' },
  { jobId: 'Job #1', title: 'Carpenter at city Gazebo', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'Completed' },
  { jobId: 'Job #1', title: 'Home Renovation', trade: 'Electrician', location: '123 Market St, Downt...', assignee: 'Unassigned', startDate: 'Starts Nov 1', status: 'Pending' },
];

const CompanyJobsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesTab = activeTab === 'All' || job.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="My Jobs"
        subtitle="Manage your active listings and ongoing projects."
      />

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
        <FilterTabs
          tabs={FILTER_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Jobs List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filteredJobs.map((job, index) => (
            <JobCard
              key={index}
              {...job}
              onPress={() => navigation.navigate('CompanyJobDetail', { job, status: job.status })}
              onEdit={() => {}}
              onDelete={() => {}}
              onShare={() => {}}
              onStart={job.status !== 'Completed' ? () => {} : undefined} // Mock logic for 'Starts Project' vs 'Starts Nov 1'
            />
          ))}

          <View style={styles.paginationRow}>
            <Text style={styles.paginationText}>Showing 1-6 of 32</Text>
            <View style={styles.pageButtons}>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>«</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pageBtn, styles.pageBtnActive]}><Text style={[styles.pageText, {color: '#FFFFFF'}]}>1</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>2</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>3</Text></TouchableOpacity>
              <Text style={styles.pageTextMuted}>...</Text>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>10</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>»</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1,  },
  container: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9'
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  paginationText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  pageButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageBtnActive: {
    backgroundColor: '#10375C',
    borderColor: '#10375C',
  },
  pageText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#10375C',
  },
  pageTextMuted: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#94A3B8',
    marginHorizontal: 2,
  }
});

export default CompanyJobsScreen;
