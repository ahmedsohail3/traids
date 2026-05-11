/**
 * SubJobBoardScreen — Job Board for the Subcontractor role.
 * Displays a searchable, filterable list of available jobs.
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import SubJobCard from '~components/Job/SubJobCard';
import SubJobFilterModal from '~components/Job/SubJobFilterModal';

const MOCK_JOBS = [
  {
    id: '1',
    companyName: 'Voltpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    location: '81 Guild Street, London, UK',
    distance: 'Downtown (2.5 mi away)',
    rate: '£20/hour',
    title: 'Senior Electrician',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to detail, and the ability to deliver high-quality work within deadlines.',
    startDate: 'Starts Now 1',
    workersRequired: 2,
    trade: 'Electrician',
    applicantCount: 11,
  },
  {
    id: '2',
    companyName: 'Acme Construction',
    companyInitial: 'A',
    companyColorIndex: 1,
    location: '81 Guild Street, London, UK',
    distance: 'Downtown (3.1 mi away)',
    rate: '£30/hour',
    title: 'Senior Constructor',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to detail, and the ability to deliver high-quality work.',
    startDate: 'Starts Nov 1',
    workersRequired: 3,
    trade: 'Electrician',
    applicantCount: 11,
  },
  {
    id: '3',
    companyName: 'ElectroHub',
    companyInitial: 'E',
    companyColorIndex: 2,
    location: '81 Guild Street, London, UK',
    distance: 'Downtown (1.8 mi away)',
    rate: '£25/hour',
    title: 'Senior Constructor',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to detail, and the ability to deliver high-quality work.',
    startDate: 'Starts Nov 1',
    workersRequired: 3,
    trade: 'Electrician',
    applicantCount: 11,
  },
  {
    id: '4',
    companyName: 'Worldpark Ltd',
    companyInitial: 'W',
    companyColorIndex: 3,
    location: '81 Guild Street, London, UK',
    distance: 'Downtown (3.5 mi away)',
    rate: '£20/hour',
    title: 'Senior Electrician',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to detail, and the ability to deliver high-quality work within deadlines.',
    startDate: 'Starts Nov 1',
    workersRequired: 2,
    trade: 'Electrician',
    applicantCount: 11,
  },
];

const SubJobBoardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  const filteredJobs = useMemo(() => {
    let jobs = MOCK_JOBS;

    if (search.trim()) {
      jobs = jobs.filter(
        j =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.companyName.toLowerCase().includes(search.toLowerCase()) ||
          j.trade.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (activeFilters?.trades?.length) {
      jobs = jobs.filter(j => activeFilters.trades.includes(j.trade));
    }

    return jobs;
  }, [search, activeFilters]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Job Board"
        subtitle="Browse verified jobs and apply instantly."
      />

      {/* Search bar */}
      <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.searchBox, { borderColor: '#E4E4E4' }]}>
          <Search size={RFValue(13)} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search jobs & keywords..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={[styles.filterBtn, activeFilters ? styles.filterBtnActive : {}]}
            onPress={() => setFilterVisible(true)}
            activeOpacity={0.8}
          >
            <SlidersHorizontal
              size={RFValue(13)}
              color={activeFilters ? '#FFFFFF' : '#64748B'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recommended Jobs header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recommended Jobs</Text>
        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort By: </Text>
          <Text style={[styles.sortValue, { color: colors.textPrimary }]}>%</Text>
        </View>
      </View>

      {/* Jobs list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <SubJobCard
              key={job.id}
              {...job}
              onPress={() => navigation.navigate('SubJobDetail', { job })}
              onApply={() => navigation.navigate('SubJobDetail', { job, openApply: true })}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No jobs match your search.
            </Text>
          </View>
        )}

        <View style={styles.paginationRow}>
          <Text style={[styles.paginationText, { color: colors.textSecondary }]}>
            Showing 1–{filteredJobs.length} of {MOCK_JOBS.length}
          </Text>
          <View style={styles.pageButtons}>
            <TouchableOpacity style={[styles.pageBtn, { borderColor: '#E2E8F0' }]}>
              <Text style={[styles.pageText, { color: colors.textPrimary }]}>«</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, styles.pageBtnActive]}>
              <Text style={[styles.pageText, { color: '#FFFFFF' }]}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, { borderColor: '#E2E8F0' }]}>
              <Text style={[styles.pageText, { color: colors.textPrimary }]}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pageBtn, { borderColor: '#E2E8F0' }]}>
              <Text style={[styles.pageText, { color: colors.textPrimary }]}>»</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <SubJobFilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={filters => setActiveFilters(filters)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    padding: 0,
  },
  filterBtn: {
    width: RFValue(28),
    height: RFValue(28),
    borderRadius: RFValue(7),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  filterBtnActive: {
    backgroundColor: '#10375C',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  sortValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(12),
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paginationText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
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
  },
  pageBtnActive: {
    backgroundColor: '#10375C',
    borderColor: '#10375C',
  },
  pageText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
  },
});

export default SubJobBoardScreen;
