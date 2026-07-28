/**
 * SubcontractorListScreen
 *
 * "Find Subcontractors" screen for Company role.
 * Shows a searchable, filterable list of subcontractors.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Briefcase, DollarSign, MapPin, ArrowDownUp } from 'lucide-react-native';
import { Text, TextInput, Checkbox, PriceSlider } from '~components/Common';
import Header from '~components/Header';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import SubcontractorCard from '~components/Subcontractors/SubcontractorCard';
import useCompanySubcontractors from '~hooks/useCompanySubcontractors';

const TRADES = [{id: 1, name: 'Electrician', key: 'electrician'}, {id: 2, name: 'Plumber', key: 'plumber'}, {id: 3, name: 'Carpenter', key: 'carpenter'}, {id: 4, name: 'Masonry', key: 'masonry'}];

// ─── Screen ───────────────────────────────────────────────────────────────────
const SubcontractorListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { subcontractors, loading, fetch } = useCompanySubcontractors();

  console.log('subcontractors', subcontractors);

  const [selectedTrade, setSelectedTrade] = useState(null);
  const [maxRate, setMaxRate] = useState(600);
  const [locationInput, setLocationInput] = useState('');
  const [search, setSearch] = useState('');
  const locationTimer = useRef(null);

  useEffect(() => {
    fetch({
      maxHourlyRate: maxRate,
      primaryTrade: selectedTrade?.key || undefined,
    });
  }, [selectedTrade, maxRate]);

  // Clear any pending debounced fetch if the screen unmounts mid-delay
  useEffect(() => () => {
    if (locationTimer.current) clearTimeout(locationTimer.current);
  }, []);
  

  const handleLocationChange = (text) => {
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

  const toggleTrade = (trade) => {
    setSelectedTrade(prev => prev?.key === trade.key ? null : trade);
  };

  const filtered = subcontractors.filter(s =>
    !search ||
    (s.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (s.trade ?? s.primaryTrade ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top row: Recommended and Sort By */}
      <View style={[styles.filterSection, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={styles.sectionHeading}>Recommended Subcontractors</Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
          <Text style={styles.sortText}>Sort By:</Text>
          <View style={styles.arrowContainer}>
            <ArrowDownUp size={RFValue(11)} color="#94A3B8" />
          </View>
        </TouchableOpacity>
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
        <TextInput
          value={locationInput}
          onChangeText={handleLocationChange}
          placeholder="Enter Location"
          forceLight
          containerStyle={styles.inputContainer}
        />
      </View>


      {/* Search Filter */}
      <View style={styles.filterSection}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or skill..."
          leftIcon="search"
          forceLight
          containerStyle={styles.inputContainer}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Find Subcontractors" subtitle="Discover and book top rated professionals for your project." />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <SubcontractorCard
          key={item._id}
            {...item}
            onViewProfile={() => navigation.navigate('SubcontractorProfile', { sub: item })}
          />
        )}
        ListFooterComponent={
          <View style={styles.paginationRow}>
            <Text style={styles.paginationText}>Showing 1–4 of 32</Text>
            <View style={styles.pageButtons}>
              {['«', '1', '2', '3', '»'].map((p, i) => (
                <TouchableOpacity key={i} style={[styles.pageBtn, p === '1' && styles.pageBtnActive]}>
                  <Text style={[styles.pageText, p === '1' && { color: '#FFFFFF' }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 130,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  arrowContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 4,
  },
  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10),
    color: '#10375C',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  filterSection: {
    marginBottom: 20,
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
  paginationText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#64748B' },
  pageButtons: { flexDirection: 'row', gap: 4 },
  pageBtn: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  pageBtnActive: { backgroundColor: '#10375C', borderColor: '#10375C' },
  pageText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#10375C' },
});

export default SubcontractorListScreen;
