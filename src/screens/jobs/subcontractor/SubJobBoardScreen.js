import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase, DollarSign, MapPin, Calendar } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Text, TextInput, Checkbox, PriceSlider, SortBy, applySort } from '~components/Common';
import Header from '~components/Header';
import SubJobCard from '~components/Job/SubJobCard';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';
import useKeyboardInset from '~hooks/useKeyboardInset';

// Breathing room kept between a focused field and the top of the keyboard.
const FIELD_GAP = 48;

// Clears the floating tab bar; the keyboard inset is added on top when open.
const LIST_BOTTOM_PADDING = 130;

// ── Platform-specific date picker ─────────────────────────────────────────────
let DatePicker;
let DateTimePicker;
if (Platform.OS === 'android') {
  DatePicker = require('react-native-date-picker').default;
} else {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const DateModal = ({ visible, title, value, onConfirm, onClose }) => {
  const dateObj = value ? new Date(value) : new Date();
  const [tempDate, setTempDate] = useState(dateObj);

  const wasVisible = useRef(false);
  if (visible && !wasVisible.current) {
    wasVisible.current = true;
    const next = value ? new Date(value) : new Date();
    if (next.getTime() !== tempDate.getTime()) setTempDate(next);
  }
  if (!visible) wasVisible.current = false;

  const handleConfirm = useCallback((date) => {
    onConfirm(dayjs(date).format('YYYY-MM-DD'));
    onClose();
  }, [onConfirm, onClose]);

  if (Platform.OS === 'android') {
    return (
      <DatePicker
        modal
        open={visible}
        date={tempDate}
        mode="date"
        title={title}
        onConfirm={(date) => handleConfirm(date)}
        onCancel={onClose}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.dateModal}>
          <Text style={styles.dateModalTitle}>{title}</Text>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={(_, date) => { if (date) setTempDate(date); }}
            style={styles.iosDatePicker}
            // This sheet is always white, so keep the spinner light too —
            // otherwise iOS restyles its band and dividers for dark mode.
            themeVariant="light"
            textColor="#10375C"
          />
          <View style={styles.dateModalActions}>
            <TouchableOpacity style={styles.dateModalCancel} onPress={onClose}>
              <Text style={styles.dateModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateModalConfirm}
              onPress={() => handleConfirm(tempDate)}>
              <Text style={styles.dateModalConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Constants ─────────────────────────────────────────────────────────────────

const TRADES = [
  { id: 1, name: 'Electrician',  key: 'electrician' },
  { id: 2, name: 'Plumber',      key: 'plumber' },
  { id: 3, name: 'Carpenter',    key: 'carpenter' },
  { id: 4, name: 'Masonry',      key: 'masonry' },
];

// Sorting is applied locally to the jobs already in state — nothing is sent to the API.
const SORT_OPTIONS = [
  { label: 'Newest first',        short: 'Newest',     value: 'newest',    field: 'createdAt',         order: 'desc', type: 'date' },
  { label: 'Highest hourly rate', short: 'Rate: high', value: 'rate-desc', field: 'hourlyRate',        order: 'desc', type: 'number' },
  { label: 'Lowest hourly rate',  short: 'Rate: low',  value: 'rate-asc',  field: 'hourlyRate',        order: 'asc',  type: 'number' },
  { label: 'Starting soonest',    short: 'Soonest',    value: 'start-asc', field: 'timelineStartDate', order: 'asc',  type: 'date' },
];

// ── Data mapper ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// A job is only displayed when it actually has a title.
const hasTitle = (job) => {
  const title = job?.jobTitle ?? job?.title;
  return typeof title === 'string' && title.trim().length > 0;
};

const mapJob = (raw, index) => {
  const company = typeof raw.company === 'object' ? (raw.company ?? {}) : {};
  const name    = company.companyName ?? raw.companyName ?? '—';
  return {
    id:                raw._id ?? raw.id ?? String(index),
    companyName:       name,
    companyInitial:    name.charAt(0).toUpperCase(),
    companyColorIndex: index % AVATAR_COLORS.length,
    avatarUri:         company.profileImage ?? null,
    location:          raw.siteAddress   ?? raw.location  ?? '—',
    distance:          raw.distance      ?? '',
    rate:              raw.hourlyRate    != null ? `£${raw.hourlyRate}/hr` : (raw.rate ?? '—'),
    title:             raw.jobTitle      ?? raw.title,
    description:       raw.description   ?? '',
    startDate:         formatDate(raw.timelineStartDate ?? raw.startDate),
    workersRequired:   raw.workersRequired ?? 1,
    trade:             raw.trade          ?? '—',
    applicantCount:    raw?.assignedTo?.length ?? 0,
    typeOfJob:         raw.typeOfJob      ?? '',
    status:            raw.status         ?? 'pending',
    _raw:              raw,
  };
};

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

  const [selectedTrades,     setSelectedTrades]     = useState([]);
  const [maxRate,            setMaxRate]            = useState(500);
  const [locationInput,      setLocationInput]      = useState('');
  const [startDate,          setStartDate]          = useState('');
  const [datePickerVisible,  setDatePickerVisible]  = useState(false);
  const [currentPage,        setCurrentPage]        = useState(1);
  const [sort,               setSort]               = useState(SORT_OPTIONS[0]);

  const locationTimer = useRef(null);

  // ── Keyboard avoidance ─────────────────────────────────────────────────────
  // The location field lives inside the FlatList header, so focusing it near the
  // bottom of the screen would otherwise put it under the keyboard.
  const insets = useSafeAreaInsets();
  const { keyboardInset, keyboardVisible, onLayout: onViewportLayout } =
    useKeyboardInset(insets.bottom);

  const listRef = useRef(null);
  // Root view — its bottom edge is the list's bottom edge, so it is the viewport.
  const viewportRef = useRef(null);
  const scrollYRef = useRef(0);
  const focusedRef = useRef(null);
  const insetRef = useRef(0);
  // Offset of the FlatList inside the root view — i.e. the height of Header.
  const listTopRef = useRef(0);

  // Wraps the whole bordered field. Measuring the inner TextInput instead reads
  // ~18px short: it is flex:1 with no vertical padding, centred in a 56px box.
  const locationFieldRef = useRef(null);
  // The whole filter block, measured so sorting can scroll exactly past it.
  const headerRef = useRef(null);

  useEffect(() => {
    insetRef.current = keyboardInset;
  }, [keyboardInset]);

  const handleScroll = useCallback(({ nativeEvent }) => {
    scrollYRef.current = nativeEvent.contentOffset.y;
  }, []);

  const handleListLayout = useCallback(({ nativeEvent }) => {
    listTopRef.current = nativeEvent.layout.y;
  }, []);

  /**
   * Scrolls just enough to bring `node` fully into the space left above the
   * keyboard, then back down if it ended up above the visible area.
   */
  const revealNode = useCallback((node) => {
    const viewport = viewportRef.current;
    if (!node?.measureInWindow || !viewport || !listRef.current) return;

    viewport.measureInWindow((_vx, viewportY, _vw, viewportH) => {
      node.measureInWindow((_x, y, _w, h) => {
        if (h === 0) return; // not laid out yet

        const visibleBottom = viewportY + viewportH - insetRef.current;
        const overlap = y + h + FIELD_GAP - visibleBottom;
        if (overlap > 1) {
          listRef.current?.scrollToOffset({
            offset: scrollYRef.current + overlap,
            animated: true,
          });
          return;
        }

        const visibleTop = viewportY + listTopRef.current;
        const above = visibleTop + FIELD_GAP - y;
        if (above > 1) {
          listRef.current?.scrollToOffset({
            offset: Math.max(0, scrollYRef.current - above),
            animated: true,
          });
        }
      });
    });
  }, []);

  /**
   * Scrolls so the results start at the top of the list viewport. Measured
   * rather than left to scrollToIndex, which needs row layout metrics that
   * aren't dependable underneath a header this tall.
   */
  const scrollToResults = useCallback(() => {
    const viewport = viewportRef.current;
    const header = headerRef.current;
    if (!header?.measureInWindow || !viewport || !listRef.current) return;

    viewport.measureInWindow((_vx, viewportY) => {
      header.measureInWindow((_x, y, _w, h) => {
        if (h === 0) return; // not laid out yet

        // How far the header's bottom sits below the top of the list.
        const delta = y + h - (viewportY + listTopRef.current);
        if (delta <= 1) return; // already scrolled past the filters

        listRef.current?.scrollToOffset({
          offset: scrollYRef.current + delta,
          animated: true,
        });
      });
    });
  }, []);

  const handleFocus = useCallback((node) => {
    focusedRef.current = node;
    revealNode(node);
  }, [revealNode]);

  const handleBlur = useCallback((node) => {
    if (focusedRef.current === node) focusedRef.current = null;
  }, []);

  // Re-reveal once the keyboard has actually opened, and again whenever its
  // height changes.
  useEffect(() => {
    if (!keyboardVisible) return;
    const frame = requestAnimationFrame(() => revealNode(focusedRef.current));
    return () => cancelAnimationFrame(frame);
  }, [keyboardVisible, keyboardInset, revealNode]);

  // ── Fetch helper ─────────────────────────────────────────────────────────────

  const fetchJobs = useCallback((pg = 1) => {
    getAvailableJobs({
      page:          pg,
      trade:         selectedTrades,
      maxHourlyRate: maxRate,
      location:      locationInput || undefined,
      startDate:     startDate     || undefined,
    });
  }, [selectedTrades, maxRate, locationInput, startDate, getAvailableJobs]);

  // Re-fetch whenever filters change (reset to page 1). Sorting is local only,
  // so changing it never hits the API.
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
        page:          1,
        trade:         selectedTrades,
        maxHourlyRate: maxRate,
        location:      text || undefined,
        startDate:     startDate || undefined,
      });
    }, 2000);
  };

  // Trade filter is multi-select — each tick adds another `trade` query param
  const toggleTrade = (trade) => {
    setSelectedTrades((prev) => (
      prev.includes(trade.key)
        ? prev.filter((key) => key !== trade.key)
        : [...prev, trade.key]
    ));
  };

  const goToPage = (pg) => {
    if (pg < 1 || pg > totalPages) return;
    setCurrentPage(pg);
    fetchJobs(pg);
  };

  // ── Derived data ──────────────────────────────────────────────────────────────

  // Sorted client-side, so it reorders the jobs on the current page only
  const jobs = applySort((availableJobs ?? []).filter(hasTitle), sort).map(mapJob);

  // Sorting reorders the list underneath the filters, which are tall enough to
  // hide the result of the sort entirely. Drop the user at the first entry so
  // the new order is actually visible.
  const handleSortChange = (option) => {
    setSort(option);
    if (!jobs.length) return;
    // One frame is enough for the reordered list to commit; the header's height
    // doesn't change with sort order, so the measurement is stable either way.
    requestAnimationFrame(scrollToResults);
  };

  // ── List header (inline filters) ─────────────────────────────────────────────

  const renderHeader = () => (
    <View ref={headerRef} collapsable={false} style={styles.headerContainer}>
      <View style={[styles.filterSection, styles.titleRow]}>
        <Text style={styles.sectionHeading}>Available Jobs</Text>
        <SortBy
          options={SORT_OPTIONS}
          value={sort?.value}
          onChange={handleSortChange}
          title="Sort jobs by"
        />
      </View>

      {/* Trade Type */}
      <View style={styles.filterSection}>
        <View style={styles.filterTitleRow}>
          <Briefcase size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Trade Type</Text>
          {selectedTrades.length > 0 && (
            <TouchableOpacity onPress={() => setSelectedTrades([])} hitSlop={8}>
              <Text style={styles.clearTrades}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {TRADES.map((trade) => (
          <Checkbox
            key={trade.id}
            label={trade.name}
            checked={selectedTrades.includes(trade.key)}
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
          min={100}
          max={1000}
          step={10}
          value={maxRate}
          onChange={setMaxRate}
          prefix="£"
          minLabel="£100"
          maxLabel="£1000+"
        />
        <View style={styles.divider} />
        <View style={styles.filterTitleRow}>
          <MapPin size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Location</Text>
        </View>
        <View ref={locationFieldRef} collapsable={false}>
          <TextInput
            value={locationInput}
            onChangeText={handleLocationChange}
            onFocus={() => handleFocus(locationFieldRef.current)}
            onBlur={() => handleBlur(locationFieldRef.current)}
            placeholder="Enter location"
            forceLight
            containerStyle={styles.inputContainer}
          />
        </View>
      </View>

      {/* Start Date */}
      <View style={styles.filterSection}>
        <View style={styles.filterTitleRow}>
          <Calendar size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Start Date</Text>
        </View>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setDatePickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dateInputText, !startDate && styles.dateInputPlaceholder]}>
            {startDate ? dayjs(startDate).format('D MMM YYYY') : 'Select start date'}
          </Text>
          {startDate ? (
            <TouchableOpacity
              onPress={() => setStartDate('')}
              hitSlop={8}
            >
              <Text style={styles.dateClear}>✕</Text>
            </TouchableOpacity>
          ) : (
            <Calendar size={RFValue(13)} color="#94A3B8" />
          )}
        </TouchableOpacity>
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
    <View
      ref={viewportRef}
      onLayout={onViewportLayout}
      style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Job Board" subtitle="Browse verified jobs and apply instantly." />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <FlatList
        ref={listRef}
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          // Room to scroll a bottom-most field clear of the keyboard.
          { paddingBottom: LIST_BOTTOM_PADDING + keyboardInset },
        ]}
        showsVerticalScrollIndicator={false}
        onLayout={handleListLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // Without this the first tap on the sort chip is swallowed just to
        // dismiss the keyboard while the location field is focused.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        // Passed as elements, not functions: a new function identity each render
        // makes VirtualizedList remount the header, which drops the refs above
        // and steals focus from the location field on every keystroke.
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        renderItem={({ item }) => (
          <SubJobCard
            {...item}
            onPress={() => navigation.navigate('SubJobDetail', { job: item, jobId: item.id })}
            onApply={() => navigation.navigate('SubJobDetail', { job: item, openApply: true, jobId: item.id })}
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

      <DateModal
        visible={datePickerVisible}
        title="Start Date"
        value={startDate}
        onConfirm={(iso) => setStartDate(iso)}
        onClose={() => setDatePickerVisible(false)}
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
    paddingBottom: LIST_BOTTOM_PADDING,
  },
  headerContainer: { marginBottom: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10),
    color: '#10375C',
    flex: 1,
    lineHeight: RFValue(14),
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
  clearTrades: {
    marginLeft: 'auto',
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#F2A154',
  },
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

  // Date input
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: '#F8FAFC',
  },
  dateInputText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  dateInputPlaceholder: { color: '#94A3B8' },
  dateClear: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#94A3B8',
  },

  // Date picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  dateModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  dateModalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    color: '#10375C',
    marginBottom: 4,
    textAlign: 'center',
  },
  iosDatePicker: { width: '100%', marginBottom: 8 },
  dateModalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  dateModalCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  dateModalCancelText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#64748B' },
  dateModalConfirm: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#10375C', alignItems: 'center',
  },
  dateModalConfirmText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#FFFFFF' },
});

export default SubJobBoardScreen;
