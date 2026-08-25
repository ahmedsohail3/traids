/**
 * SubcontractorListScreen
 *
 * "Find Subcontractors" screen for Company role.
 * Shows a searchable, filterable list of subcontractors.
 */
import {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Briefcase, DollarSign, MapPin} from 'lucide-react-native';
import {
  Text,
  TextInput,
  Checkbox,
  PriceSlider,
  SortBy,
  applySort,
} from '~components/Common';
import Header from '~components/Header';
import {FontFamily} from '~theme/fonts';
import {useTheme} from '~context/ThemeContext';
import SubcontractorCard from '~components/Subcontractors/SubcontractorCard';
import useCompanySubcontractors from '~hooks/useCompanySubcontractors';
import useKeyboardInset from '~hooks/useKeyboardInset';

// Breathing room kept between a focused field and the top of the keyboard.
const FIELD_GAP = 52;

// Clears the floating tab bar; the keyboard inset is added on top when open.
const LIST_BOTTOM_PADDING = 130;

const TRADES = [
  {id: 1, name: 'Electrician', key: 'electrician'},
  {id: 2, name: 'Plumber', key: 'plumber'},
  {id: 3, name: 'Carpenter', key: 'carpenter'},
  {id: 4, name: 'Masonry', key: 'masonry'},
];

// Sorting is applied locally to the subcontractors already in state — nothing is
// sent to the API. "Recommended" carries no field, so it keeps the server's order.
const SORT_OPTIONS = [
  {label: 'Recommended', short: 'Default', value: 'recommended'},
  {
    label: 'Highest rated',
    short: 'Top rated',
    value: 'rating-desc',
    field: ['averageRating', 'rating', 'totalRatings'],
    order: 'desc',
    type: 'number',
  },
  {
    label: 'Most experience',
    short: 'Experience',
    value: 'exp-desc',
    field: 'yearsOfExperience',
    order: 'desc',
    type: 'number',
  },
  {
    label: 'Lowest hourly rate',
    short: 'Rate: low',
    value: 'rate-asc',
    field: 'hourlyRate',
    order: 'asc',
    type: 'number',
  },
  {
    label: 'Highest hourly rate',
    short: 'Rate: high',
    value: 'rate-desc',
    field: 'hourlyRate',
    order: 'desc',
    type: 'number',
  },
  {
    label: 'Name (A–Z)',
    short: 'A–Z',
    value: 'name-asc',
    field: ['fullName', 'name'],
    order: 'asc',
    type: 'string',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
const SubcontractorListScreen = ({navigation}) => {
  const {colors} = useTheme();
  const {subcontractors, loading, fetch} = useCompanySubcontractors();

  console.log('subcontractors', subcontractors);

  const [selectedTrade, setSelectedTrade] = useState(null);
  const [maxRate, setMaxRate] = useState(600);
  const [locationInput, setLocationInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const locationTimer = useRef(null);

  // ── Keyboard avoidance ─────────────────────────────────────────────────────
  // Both filter inputs live inside the FlatList header, so a focus near the
  // bottom of the screen would otherwise sit under the keyboard. Same approach
  // as PostJobScreen: measure in window coordinates and scroll by the overlap.
  const insets = useSafeAreaInsets();
  const {
    keyboardInset,
    keyboardVisible,
    onLayout: onViewportLayout,
  } = useKeyboardInset(insets.bottom);

  const listRef = useRef(null);
  // Root view — its bottom edge is the list's bottom edge, so it is the viewport.
  const viewportRef = useRef(null);
  const scrollYRef = useRef(0);
  const focusedRef = useRef(null);
  const insetRef = useRef(0);
  // Offset of the FlatList inside the root view — i.e. the height of Header.
  const listTopRef = useRef(0);

  // These wrap the whole bordered field. Measuring the inner TextInput instead
  // reads ~18px short: it is flex:1 with no vertical padding, centred inside a
  // 56px box, so the box hangs below it and the keyboard clips that overhang.
  const locationFieldRef = useRef(null);
  const searchFieldRef = useRef(null);
  // The whole filter block, measured so sorting can scroll exactly past it.
  const headerRef = useRef(null);

  useEffect(() => {
    insetRef.current = keyboardInset;
  }, [keyboardInset]);

  const handleScroll = useCallback(({nativeEvent}) => {
    scrollYRef.current = nativeEvent.contentOffset.y;
  }, []);

  const handleListLayout = useCallback(({nativeEvent}) => {
    listTopRef.current = nativeEvent.layout.y;
  }, []);

  /**
   * Scrolls just enough to bring `node` fully into the space left above the
   * keyboard, then back down if it ended up above the visible area.
   */
  const revealNode = useCallback(node => {
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
   * Scrolls so the results start at the top of the list viewport. Measured in
   * window coordinates rather than left to scrollToIndex, which needs row layout
   * metrics that aren't dependable underneath a header this tall.
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

  const handleFocus = useCallback(
    node => {
      focusedRef.current = node;
      revealNode(node);
    },
    [revealNode],
  );

  const handleBlur = useCallback(node => {
    if (focusedRef.current === node) focusedRef.current = null;
  }, []);

  // Re-reveal once the keyboard has actually opened, and again whenever its
  // height changes.
  useEffect(() => {
    if (!keyboardVisible) return;
    const frame = requestAnimationFrame(() => revealNode(focusedRef.current));
    return () => cancelAnimationFrame(frame);
  }, [keyboardVisible, keyboardInset, revealNode]);

  useEffect(() => {
    fetch({
      maxHourlyRate: maxRate,
      primaryTrade: selectedTrade?.key || undefined,
      location: locationInput || undefined,
    });
  }, [selectedTrade, maxRate]);

  // Clear any pending debounced fetch if the screen unmounts mid-delay
  useEffect(
    () => () => {
      if (locationTimer.current) clearTimeout(locationTimer.current);
    },
    [],
  );

  const handleLocationChange = text => {
    setLocationInput(text);
    if (locationTimer.current) clearTimeout(locationTimer.current);
    locationTimer.current = setTimeout(() => {
      fetch({
        maxHourlyRate: maxRate,
        location: text || undefined,
        primaryTrade: selectedTrade?.key || undefined,
      });
    }, 500);
  };

  const toggleTrade = trade => {
    setSelectedTrade(prev => (prev?.key === trade.key ? null : trade));
  };

  // Search filter then sort, both applied client-side on the fetched list
  const filtered = applySort(
    subcontractors.filter(
      s =>
        !search ||
        (s.name ?? s.fullName ?? '')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (s.trade ?? s.primaryTrade ?? '')
          .toLowerCase()
          .includes(search.toLowerCase()),
    ),
    sort,
  );

  // Sorting reorders the list underneath the filters, which are tall enough to
  // hide the result of the sort entirely. Drop the user at the first entry so
  // the new order is actually visible.
  const handleSortChange = option => {
    setSort(option);
    if (!filtered.length) return;
    // One frame is enough for the reordered list to commit; the header's height
    // doesn't change with sort order, so the measurement is stable either way.
    requestAnimationFrame(scrollToResults);
  };

  const renderHeader = () => (
    <View ref={headerRef} collapsable={false} style={styles.headerContainer}>
      {/* Top row: Recommended and Sort By */}
      <View style={[styles.filterSection, styles.titleRow]}>
        <Text style={styles.sectionHeading} numberOfLines={2}>
          Recommended Subcontractors
        </Text>
        <SortBy
          options={SORT_OPTIONS}
          value={sort?.value}
          onChange={handleSortChange}
          title="Sort subcontractors by"
        />
      </View>

      {/* Trade Type Filter */}
      <View style={styles.filterSection}>
        <View style={styles.filterTitleRow}>
          <Briefcase size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Trade Type</Text>
        </View>
        <View style={styles.tradesContainer}>
          {TRADES.map(trade => (
            <Checkbox
              key={trade.id}
              label={trade.name}
              checked={selectedTrade?.id === trade.id}
              onPress={() => toggleTrade(trade)}
              style={styles.tradeCheckbox}
            />
          ))}
        </View>
      </View>

      {/* Max Hourly Rate + Location Filter */}
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
            placeholder="Enter Location"
            forceLight
            containerStyle={styles.inputContainer}
          />
        </View>
      </View>

      {/* Search Filter */}
      <View style={styles.filterSection}>
        <View ref={searchFieldRef} collapsable={false}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => handleFocus(searchFieldRef.current)}
            onBlur={() => handleBlur(searchFieldRef.current)}
            placeholder="Search name or skill..."
            leftIcon="search"
            forceLight
            containerStyle={styles.inputContainer}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View
      ref={viewportRef}
      onLayout={onViewportLayout}
      style={[styles.root, {backgroundColor: colors.background}]}>
      <Header
        title="Find Subcontractors"
        subtitle="Discover and book top rated professionals for your project."
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={[
          styles.list,
          // Room to scroll a bottom-most field clear of the keyboard.
          {paddingBottom: LIST_BOTTOM_PADDING + keyboardInset},
        ]}
        showsVerticalScrollIndicator={false}
        onLayout={handleListLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // Without this the first tap on the sort chip is swallowed just to
        // dismiss the keyboard while a filter field is focused.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={renderHeader()}
        renderItem={({item}) => (
          <SubcontractorCard
            key={item._id}
            {...item}
            onViewProfile={() =>
              navigation.navigate('SubcontractorProfile', {sub: item})
            }
          />
        )}
        // ListFooterComponent={
        //   <View style={styles.paginationRow}>
        //     <Text style={styles.paginationText}>Showing 1–4 of 32</Text>
        //     <View style={styles.pageButtons}>
        //       {['«', '1', '2', '3', '»'].map((p, i) => (
        //         <TouchableOpacity key={i} style={[styles.pageBtn, p === '1' && styles.pageBtnActive]}>
        //           <Text style={[styles.pageText, p === '1' && { color: '#FFFFFF' }]}>{p}</Text>
        //         </TouchableOpacity>
        //       ))}
        //     </View>
        //   </View>
        // }
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {flex: 1},
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: LIST_BOTTOM_PADDING,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
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
    // Long heading wraps to a second line instead of squeezing the sort chip
    flex: 1,
    lineHeight: RFValue(14),
  },
  filterSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  divider: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginTop: 25,
    marginBottom: 15,
  },
  tradesContainer: {
    // paddingLeft: 22, // Align with the text, not the icon
  },
  tradeCheckbox: {
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 0, // Input component has bottom margin by default, override it
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
    color: '#64748B',
  },
  pageButtons: {flexDirection: 'row', gap: 4},
  pageBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageBtnActive: {backgroundColor: '#10375C', borderColor: '#10375C'},
  pageText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#10375C',
  },
});

export default SubcontractorListScreen;
