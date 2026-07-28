import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { DollarSign, Search, SlidersHorizontal, Download, Eye } from 'lucide-react-native';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INVOICES = [
  { id: 'INV-001', status: 'Pending', hours: 16, amount: '£1250.00', fee: '£40.00', company: 'Buildright Construction' },
  { id: 'INV-001', status: 'Pending', hours: 16, amount: '£1250.00', fee: '£40.00', company: 'Buildright Construction' },
  { id: 'INV-001', status: 'Paid',    hours: 16, amount: '£1250.00', fee: '£40.00', company: 'Buildright Construction' },
  { id: 'INV-001', status: 'Paid',    hours: 16, amount: '£1250.00', fee: '£40.00', company: 'Buildright Construction' },
  { id: 'INV-001', status: 'Paid',    hours: 16, amount: '£1250.00', fee: '£40.00', company: 'Buildright Construction' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, negative }) => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryCardInner}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, negative && styles.summaryValueNegative]}>{value}</Text>
    </View>
    <DollarSign size={RFValue(18)} color="#10375C" strokeWidth={1.5} />
  </View>
);

const StatusPill = ({ status }) => {
  const isPaid = status === 'Paid';
  return (
    <View style={[styles.pill, { backgroundColor: isPaid ? '#22C55E' : '#F97316' }]}>
      <Text style={styles.pillText}>{status}</Text>
    </View>
  );
};

const InvoiceRow = ({ item }) => (
  <View style={styles.invoiceRow}>
    {/* Top line */}
    <View style={styles.invoiceTop}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center',  }}>
        <Text style={styles.invoiceId}>{item.id}</Text>
        <StatusPill status={item.status} />
      </View>
      <View style={styles.invoiceAmountBlock}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={styles.invoiceHours}>{item.hours} hours</Text>
          <Text style={styles.invoiceAmount}>{item.amount}</Text>
        </View>
        <Text style={styles.invoiceFee}>{item.fee}</Text>
      </View>
    </View>

    {/* Company name */}
    <Text style={styles.invoiceCompany}>{item.company}</Text>

    <View style={styles.divider} />

    {/* Actions row */}
    <View style={styles.invoiceActions}>
      <Text style={styles.actionsLabel}>Actions</Text>
      <View style={styles.actionIcons}>
        <TouchableOpacity style={styles.iconBtn}>
          <Eye size={RFValue(13)} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Download size={RFValue(13)} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const PaymentsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Payments"
        subtitle="Financial ledger and invoice tracking"
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Summary Cards */}
        <SummaryCard label="Net Earnings" value="£142,500" />
        <SummaryCard label="Awaiting Payment" value="£445.50" />
        <SummaryCard label="Overdue Balance" value="£1,080.00" negative />

        {/* Invoice List Card */}
        <View style={styles.listCard}>
          {/* Search & Filter Bar */}
          <View style={styles.searchBar}>
            <View style={styles.searchInputWrap}>
              <Search size={RFValue(12)} color="#94A3B8" />
              <RNTextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <SlidersHorizontal size={RFValue(14)} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterBtn}>
              <Download size={RFValue(14)} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Invoice Rows */}
          {INVOICES.map((item, idx) => (
            <View key={idx}>
              <InvoiceRow item={item} />
            </View>
          ))}

          {/* Pagination Footer */}
          <View style={styles.paginationRow}>
            <Text style={styles.paginationCount}>Showing {INVOICES.length} results</Text>
            <View style={styles.paginationBtns}>
              <TouchableOpacity>
                <Text style={styles.paginationBtn}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.paginationBtn, styles.paginationBtnActive]}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: { paddingBottom: 120, gap: 12, paddingHorizontal: 16, paddingTop: 16 },

  // Summary Cards
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16
  },
  summaryCardInner: { gap: 4 },
  summaryLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(20),
    color: '#10375C',
  },
  summaryValueNegative: {
    color: '#EF4444',
  },

  // Invoice list card
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    padding: 0,
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Invoice rows
  invoiceRow: { padding: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, marginBottom: 16 , marginHorizontal: 16},
  invoiceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  invoiceId: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#10375C',
    lineHeight: RFValue(20),
  },
  invoiceAmountBlock: { marginLeft: 'auto', alignItems: 'flex-end' },
  invoiceHours: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
  },
  invoiceAmount: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
  },
  invoiceFee: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  invoiceCompany: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#10375C',
    marginBottom: 12,
  },
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  actionIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 2 },
  divider: { height: 1, backgroundColor: '#EFEFEF', marginVertical: 10 },

  // Status Pill
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  pillText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(9),
    color: '#FFFFFF',
  },

  // Pagination
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paginationCount: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  paginationBtns: { flexDirection: 'row', gap: 16 },
  paginationBtn: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
  },
  paginationBtnActive: { color: '#10375C', fontFamily: FontFamily.bold },
});

export default PaymentsScreen;
