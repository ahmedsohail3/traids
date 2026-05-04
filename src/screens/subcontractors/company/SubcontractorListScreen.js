/**
 * SubcontractorListScreen
 *
 * "Find Subcontractors" screen for Company role.
 * Shows a searchable, filterable list of subcontractors.
 */
import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Briefcase, DollarSign, MapPin, Search, ArrowDownUp } from 'lucide-react-native';
import { Text, TextInput, Checkbox } from '~components/Common';
import Header from '~components/Header';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import SubcontractorCard from '~components/Subcontractors/SubcontractorCard';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUBS = [
  {
    id: '1', name: 'Michael Chen', trade: 'Electrician', rating: 4.9, reviews: 154, distance: '2.5 mi',
    about: 'Highly skilled Electrician with over 8 years of experience in both residential and commercial projects. Specialising in energy-efficient installations and rapid troubleshooting. Committed to delivering high-quality...',
    hourlyRate: '£12/hr', avatarUri: 'https://i.pravatar.cc/150?u=michael',
  },
  {
    id: '2', name: 'Sarah Miller', trade: 'Plumber', rating: 4.3, reviews: 140, distance: '2.5 mi',
    about: 'Highly skilled Electrician with over 8 years of experience in both residential and commercial projects. Specialising in energy-efficient installations and rapid troubleshooting. Committed to delivering high-quality...',
    hourlyRate: '£12/hr', avatarUri: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    id: '3', name: 'David Willson', trade: 'Carpenter', rating: 4.9, reviews: 124, distance: '2.5 mi',
    about: 'Highly skilled Electrician with over 8 years of experience in both residential and commercial projects. Specialising in energy-efficient installations and rapid troubleshooting. Committed to delivering high-quality...',
    hourlyRate: '£12/hr', avatarUri: 'https://i.pravatar.cc/150?u=david',
  },
  {
    id: '4', name: 'James Rodriguez', trade: 'HVAC Tech', rating: 4.9, reviews: 98, distance: '1.5 mi',
    about: 'Highly skilled Electrician with over 8 years of experience in both residential and commercial projects. Specialising in energy-efficient installations and rapid troubleshooting. Committed to delivering high-quality...',
    hourlyRate: '£12/hr', avatarUri: 'https://i.pravatar.cc/150?u=james',
  },
];

const TRADES = ['Electrician', 'Plumber', 'Carpenter', 'HVAC Tech', 'Painter', 'Masonry'];

// ─── Screen ───────────────────────────────────────────────────────────────────
const SubcontractorListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [selectedTrades, setSelectedTrades] = useState(['Electrician', 'Plumber']);
  const [maxRate, setMaxRate] = useState(600);
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');

  const toggleTrade = (trade) => {
    setSelectedTrades(prev =>
      prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade]
    );
  };

  const filtered = MOCK_SUBS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.trade.toLowerCase().includes(search.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top row: Recommended and Sort By */}
      <View style={styles.topRow}>
        <Text style={styles.sectionHeading}>Recommended Subcontractors</Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
          <Text style={styles.sortText}>Sort By:</Text>
          <ArrowDownUp size={RFValue(12)} color="#94A3B8" />
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
              key={trade}
              label={trade}
              checked={selectedTrades.includes(trade)}
              onPress={() => toggleTrade(trade)}
              style={styles.tradeCheckbox}
            />
          ))}
        </View>
      </View>

      {/* Max Hourly Rate Filter */}
      <View style={styles.filterSection}>
        <View style={styles.filterTitleRow}>
          <DollarSign size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Max Hourly Rate</Text>
          <Text style={[styles.filterTitle, { marginLeft: 'auto' }]}>£{maxRate}</Text>
        </View>
        <View style={styles.rateRow}>
          <Text style={styles.rateSmall}>£200</Text>
          <Text style={styles.rateSmall}>£1000+</Text>
        </View>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${(maxRate / 1000) * 100}%` }]} />
          <View style={styles.sliderThumb} />
        </View>
      </View>

      {/* Location Filter */}
      <View style={styles.filterSection}>
        <View style={styles.filterTitleRow}>
          <MapPin size={RFValue(14)} color="#F2A154" />
          <Text style={styles.filterTitle}>Location</Text>
        </View>
        <TextInput
          value={location}
          onChangeText={setLocation}
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

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <SubcontractorCard
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 130,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  filterSection: {
    marginBottom: 20,
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
  tradesContainer: {
    // paddingLeft: 22, // Align with the text, not the icon
  },
  tradeCheckbox: {
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rateSmall: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sliderFill: {
    height: 4,
    backgroundColor: '#10375C',
    borderRadius: 2,
  },
  sliderThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10375C',
    position: 'absolute',
    left: '60%', // Matches maxRate = 600 / 1000
    top: -6,
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
