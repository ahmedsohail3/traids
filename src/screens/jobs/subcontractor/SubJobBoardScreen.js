import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Briefcase, DollarSign, MapPin, Calendar, ArrowDownUp } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Text, TextInput, Checkbox, PriceSlider } from '~components/Common';
import Header from '~components/Header';
import SubJobCard from '~components/Job/SubJobCard';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';

// ── Constants ─────────────────────────────────────────────────────────────────

const TRADES = [
  { id: 1, name: 'Electrician',  key: 'electrician' },
  { id: 2, name: 'Plumber',      key: 'plumber' },
  { id: 3, name: 'Carpenter',    key: 'carpenter' },
  { id: 4, name: 'Masonry',      key: 'masonry' },
];

// ── Data mapper ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const mapJob = (raw, index) => ({
  id:               raw._id     ?? raw.id ?? String(index),
  companyName:      raw.companyName  ?? raw.company?.name ?? '—',
  companyInitial:   (raw.companyName ?? raw.company?.name ?? '?').charAt(0).toUpperCase(),
  companyColorIndex: index % AVATAR_COLORS.length,
  location:         raw.location     ?? raw.address    ?? '—',
  distance:         raw.distance     ?? '',
  rate:             raw.hourlyRate   != null ? `£${raw.hourlyRate}/hr` : (raw.rate ?? '—'),
  title:            raw.title        ?? raw.jobTitle   ?? '—',
  description:      raw.description  ?? raw.details    ?? '',
  startDate:        raw.startDate    ?? raw.start       ?? '—',
  workersRequired:  raw.workersRequired ?? raw.workers  ?? 1,
  trade:            raw.trade        ?? raw.primaryTrade ?? '—',
  applicantCount:   raw.applicantCount ?? raw.applicants ?? 0,
});

// ── Screen ────────────────────────────────────────────────────────────────────

const SubJobBoardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    availableJobs,
    availableLoading: loading,
    availablePage:       page,
    availableTotalPages: totalPages,
    availableTotalCount: totalCount,
    getAvailableJobs,
  } = useSubcontractorJobs();

  const [selectedTrades, setSelectedTrades] = useState([]);
  const [maxRate,         setMaxRate]        = useState(100);
  const [locationInput,  setLocationInput]   = useState('');
  const [startDate,      setStartDate]       = useState('');
  const [currentPage,    setCurrentPage]     = useState(1);

  const locationTimer = useRef(null);

  // ── Fetch helper ─────────────────────────────────────────────────────────────

  const fetchJobs = useCallback((pg = 1) => {
    getAvailableJobs({
      page:       pg,
      trade:      selectedTrades.map((t) => t.key).join(',') || undefined,
      maxHourlyRate: maxRate,
      location:   locationInput || undefined,
      startDate:  startDate     || undefined,
    });
  }, [selectedTrades, maxRate, locationInput, startDate, getAvailableJobs]);

  // Re-fetch whenever filters change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    fetchJobs(1);
  }, [selectedTrades, maxRate, startDate]);

  // Location uses a 2-second debounce to avoid hammering the API on each keystroke
  const handleLocationChange = (text) => {
    setLocationInput(text);
    if (locationTimer.current) clearTimeout(locationTimer.current);
    locationTimer.current = setTimeout(() => {
      setCurrentPage(1);
      getAvailableJobs({
        page: 1,
        trade: selectedTrades.map((t) => t.key).join(',') || undefined,
        maxHourlyRate: maxRate,
        location: text || undefined,
        startDate: startDate || undefined,
      });
    }, 2000);
  };

  const toggleTrade = (trade) => {
    setSelectedTrades((prev) =>
      prev.some((t) => t.id === trade.id)
        ? prev.filter((t) => t.id !== trade.id)
        : [...prev, trade],
    );
  };

  const goToPage = (pg) => {
    if (pg < 1 || pg > totalPages) return;
    setCurrentPage(pg);
    fetchJobs(pg);
  };

  // ── Derived data ──────────────────────────────────────────────────────────────

  const jobs = (availableJobs ?? []).map(mapJob);

  // ── List header (inline filters) ─────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.filterSection, styles.titleRow]}>
        <Text style={styles.sectionHeading}>Available Jobs</Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
          <Text style={styles.sortText}>Sort By:</Text>
          <View style={styles.arrowContainer}>
            <ArrowDownUp size={RFValue(11)} color="#94A3B8" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Trade Type */}
      <View style={styles.filterSection}>
        <View style={styles.filterTitleRow}>
          <Briefcase size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Trade Type</Text>
        </View>
        {TRADES.map((trade) => (
          <Checkbox
            key={trade.id}
            label={trade.name}
            checked={selectedTrades.some((t) => t.id === trade.id)}
            onPress={() => toggleTrade(trade)}
            style={styles.tradeCheckbox}
          />
        ))}
      </View>

      {/* Max Hourly Rate + Location */}
      <View style={styles.filterSection}>
        <PriceSlider
          icon={DollarSign}
          title="Max Hourly Rate"
          min={10}
          max={100}
          step={10}
          value={maxRate}
          onChange={setMaxRate}
          prefix="£"
          minLabel="£10"
          maxLabel="£100+"
        />
        <View style={styles.divider} />
        <View style={styles.filterTitleRow}>
          <MapPin size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Location</Text>
        </View>
        <TextInput
          value={locationInput}
          onChangeText={handleLocationChange}
          placeholder="Enter location"
          forceLight
          containerStyle={styles.inputContainer}
        />
      </View>

      {/* Start Date */}
      <View style={styles.filterSection}>
        <View style={styles.filterTitleRow}>
          <Calendar size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Start Date</Text>
        </View>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder="e.g. 2025-06-01"
          forceLight
          containerStyle={styles.inputContainer}
        />
      </View>
    </View>
  );

  // ── Pagination footer ─────────────────────────────────────────────────────────

  const renderFooter = () => {
    const pageCount = totalPages > 0 ? totalPages : 1;
    const shown     = jobs.length;
    const from      = shown === 0 ? 0 : (currentPage - 1) * shown + 1;
    const to        = (currentPage - 1) * shown + shown;

    const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1,
    );

    return (
      <View style={styles.paginationRow}>
        <Text style={styles.paginationText}>
          {totalCount > 0 ? `Showing ${from}–${to} of ${totalCount}` : 'No results'}
        </Text>
        <View style={styles.pageButtons}>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Text style={styles.pageText}>«</Text>
          </TouchableOpacity>

          {pages.map((p, i) => (
            <TouchableOpacity
              key={`${p}-${i}`}
              style={[styles.pageBtn, p === currentPage && styles.pageBtnActive]}
              onPress={() => goToPage(p)}
            >
              <Text style={[styles.pageText, p === currentPage && { color: '#FFFFFF' }]}>{p}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.pageBtn, currentPage === pageCount && styles.pageBtnDisabled]}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            <Text style={styles.pageText}>»</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Job Board" subtitle="Browse verified jobs and apply instantly." />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <SubJobCard
            {...item}
            onPress={() => navigation.navigate('SubJobDetail', { job: item })}
            onApply={() => navigation.navigate('SubJobDetail', { job: item, openApply: true })}
          />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No jobs match your filters.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 130,
  },
  headerContainer: { marginBottom: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10),
    color: '#10375C',
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { fontFamily: FontFamily.medium, fontSize: RFValue(9), color: '#94A3B8' },
  arrowContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 4,
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  filterTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  filterTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#10375C' },
  tradeCheckbox: { marginBottom: 10 },
  divider: { width: '100%', height: 1.5, backgroundColor: '#F1F5F9', marginTop: 25, marginBottom: 15 },
  inputContainer: { marginBottom: 0 },
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontFamily: FontFamily.regular, fontSize: RFValue(12) },
  paginationRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  paginationText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#64748B' },
  pageButtons: { flexDirection: 'row', gap: 4 },
  pageBtn: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  pageBtnActive:   { backgroundColor: '#10375C', borderColor: '#10375C' },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#10375C' },
});

export default SubJobBoardScreen;
