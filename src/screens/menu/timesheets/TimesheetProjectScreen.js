import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, ScrollView, TextInput } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Search, Plus, Eye, ChevronDown, Check } from 'lucide-react-native';
import WorkerTimesheetModal from './components/WorkerTimesheetModal';

const TABS = ['All', 'Pending', 'Approved'];

const PENDING_DATA = [
  { id: 1, name: 'Ralph Edwards', hours: 12, date: 'Oct 24, 2023', amount: '£1250.00', timeLeft: '3h 57m left', status: 'Pending' },
  { id: 2, name: 'Courtney Henry', hours: 12, date: 'Oct 24, 2023', amount: '£1250.00', timeLeft: '3h 57m left', status: 'Pending' },
  { id: 3, name: 'Kathryn Murphy', hours: 12, date: 'Oct 24, 2023', amount: '£1250.00', timeLeft: '3h 57m left', status: 'Pending' },
];

const APPROVED_DATA = [
  { id: 4, name: 'Ralph Edwards', hours: 12, date: 'Oct 24, 2023', amount: '£1250.00', timeLeft: 'Review Closed', status: 'Approved' },
  { id: 5, name: 'Courtney Henry', hours: 12, date: 'Oct 24, 2023', amount: '£1250.00', timeLeft: 'Review Closed', status: 'Approved' },
  { id: 6, name: 'Kathryn Murphy', hours: 12, date: 'Oct 24, 2023', amount: '£1250.00', timeLeft: 'Review Closed', status: 'Approved' },
];

const ActionPill = ({ label, variant, fill = true, colors }) => {
  // variant: 'orange' | 'green'
  // fill: boolean (solid bg vs outline)
  
  let borderColor = variant === 'green' ? colors.success : colors.secondary;
  let bgColor = fill ? (variant === 'green' ? colors.success : colors.secondary) : 'transparent';
  let textColor = fill ? '#FFFFFF' : (variant === 'green' ? colors.success : colors.secondary);

  return (
    <View style={[styles.pill, { borderColor, backgroundColor: bgColor, borderWidth: 1 }]}>
      <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const TimesheetProjectScreen = ({ route }) => {
  const { colors } = useTheme();
  const { projectTitle = 'Downtown Office Renovation' } = route.params || {};
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const displayData = activeTab === 'Pending' ? PENDING_DATA : (activeTab === 'Approved' ? APPROVED_DATA : [...PENDING_DATA, ...APPROVED_DATA]);

  const DropdownMock = ({ label }) => (
    <TouchableOpacity style={styles.dropdown}>
      <Text style={styles.dropdownText}>{label}</Text>
      <ChevronDown size={RFValue(12)} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title={projectTitle}
        subtitle="Here is office renovation job overview"
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentCard}>
          {/* Filters Block */}
          <View style={styles.filtersTopRow}>
            <View style={styles.dropdownFlex}><DropdownMock label="Hourly Rate" /></View>
            <View style={styles.dropdownFlex}><DropdownMock label="Free Percentage" /></View>
          </View>
          
          <View style={styles.searchAddRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Search item..."
                value={search}
                onChangeText={setSearch}
                leftIcon="search"
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Plus size={RFValue(14)} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Custom Tabs */}
          <View style={styles.tabRow}>
            {TABS.map(tab => {
              const active = tab === activeTab;
              return (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem} activeOpacity={0.7}>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab}</Text>
                  {active && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Worker List */}
          <View style={styles.listArea}>
            {displayData.map((item, idx) => (
              <View key={item.id} style={[styles.workerCard, idx !== displayData.length - 1 && styles.borderBottom]}>
                <View style={styles.workerTop}>
                  <View style={styles.workerLeft}>
                    <Image source={{ uri: `https://i.pravatar.cc/150?u=${item.id + 10}` }} style={styles.avatar} />
                    <View>
                      <Text style={styles.workerName}>{item.name}</Text>
                      <Text style={styles.workerMeta}>
                        <Text style={styles.workerHours}>{item.hours} Hours</Text> {item.date}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.workerAmount}>{item.amount}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.workerBottom}>
                  <View style={styles.pillsRow}>
                    <ActionPill 
                      label={item.timeLeft} 
                      variant={item.status === 'Approved' ? 'green' : 'orange'} 
                    
                      colors={colors}
                    />
                    <ActionPill 
                      label={item.status} 
                      variant={item.status === 'Approved' ? 'green' : 'orange'} 
                   
                      colors={colors}
                    />
                  </View>

                  <View style={styles.actionBtnsRow}>
                    <TouchableOpacity 
                      style={styles.iconBtn} 
                      onPress={() => {
                        setSelectedWorker(item);
                        setModalVisible(true);
                      }}
                    >
                      <Eye size={RFValue(12)} color="#94A3B8" />
                    </TouchableOpacity>
                    {item.status === 'Pending' && (
                      <TouchableOpacity style={[styles.iconBtn, styles.checkBg]}>
                        <Check size={RFValue(12)} color="#22C55E" strokeWidth={3} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <WorkerTimesheetModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        worker={selectedWorker} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 120 },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 16,
  },
  filtersTopRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  dropdownFlex: { flex: 1 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dropdownText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  searchAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    gap: 8,
    backgroundColor: '#FAFAFA'
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: RFValue(10.5),
    fontFamily: FontFamily.regular,
    color: '#10375C',
  },
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    gap: 20,
  },
  tabItem: {
    paddingBottom: 10,
  },
  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#10375C',
    fontFamily: FontFamily.bold,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: '#10375C',
    borderRadius: 2,
  },
  listArea: {
    paddingHorizontal: 16,
  },
  workerCard: {
    paddingVertical: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  workerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  workerName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#10375C',
    marginBottom: 2,
  },
  workerMeta: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  workerHours: {
    fontFamily: FontFamily.medium,
  },
  workerAmount: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11.5),
    color: '#10375C',
  },

  divider: { height: 1, backgroundColor: '#E0E4EC', marginVertical: 14 },

  workerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 18,
  },
  pillText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8),
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9CA3AF26',
  },
  checkBg: {
    backgroundColor: '#22C55E26', // light green base for the checkmark
  },
});

export default TimesheetProjectScreen;
