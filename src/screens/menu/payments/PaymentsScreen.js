import { useState, useEffect, useMemo } from 'react';
import {
  View, StyleSheet, TextInput as RNTextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { DollarSign, Search } from 'lucide-react-native';
import useSubcontractorWallet from '~hooks/useSubcontractorWallet';
import useAlert from '~hooks/useAlert';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

const money = (amount, currency = 'GBP') =>
  `${CURRENCY_SYMBOLS[currency] ?? ''}${Number(amount ?? 0).toFixed(2)}`;

// Balances arrive as one entry per currency. Accounts are single-currency in
// practice, so the first entry is the balance to show.
const primaryBalance = (balances = []) => balances[0] ?? { amount: 0, currency: 'GBP' };

const fmtDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

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

const TransactionRow = ({ item, currency }) => (
  <View style={styles.invoiceRow}>
    {/* Top line */}
    <View style={styles.invoiceTop}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Text style={styles.invoiceId}>{item.invoiceNumber ?? '—'}</Text>
        <StatusPill status={item.paidAt ? 'Paid' : 'Pending'} />
      </View>
      <View style={styles.invoiceAmountBlock}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={styles.invoiceHours}>{item.hours ?? 0} hrs</Text>
          <Text style={styles.invoiceAmount}>{money(item.netPayable, currency)}</Text>
        </View>
        <Text style={styles.invoiceFee}>
          {money(item.grossAmount, currency)} gross · {money(item.platformFee, currency)} fee
        </Text>
      </View>
    </View>

    {/* Company + job */}
    <Text style={styles.invoiceCompany}>{item.company?.companyName?.trim() ?? '—'}</Text>
    <Text style={styles.invoiceJob} numberOfLines={1}>
      {item.job?.jobTitle ?? '—'}
      {item.hourlyRate != null ? ` · ${money(item.hourlyRate, currency)}/hr` : ''}
    </Text>

    <View style={styles.divider} />

    {/* Meta row */}
    <View style={styles.invoiceActions}>
      <Text style={styles.actionsLabel}>
        {item.weekNumber != null ? `Week ${item.weekNumber}` : 'Week —'}
        {item.weekStartDate ? ` · ${fmtDate(item.weekStartDate)}` : ''}
      </Text>
      <Text style={styles.actionsLabel}>
        {item.paidAt ? `Paid ${fmtDate(item.paidAt)}` : 'Awaiting payment'}
      </Text>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const PaymentsScreen = () => {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState('');

  const { available, pending, transactions, loading, error, getWallet } = useSubcontractorWallet();

  useEffect(() => { getWallet(); }, [getWallet]);

  useEffect(() => {
    if (error) showAlert({ title: 'Unable to Load', message: error, type: 'error' });
  }, [error, showAlert]);

  const availableBalance = primaryBalance(available);
  const pendingBalance   = primaryBalance(pending);
  const currency         = availableBalance.currency ?? pendingBalance.currency;

  const totalPaid = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.netPayable ?? 0), 0),
    [transactions],
  );

  const visibleTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((t) =>
      [t.invoiceNumber, t.company?.companyName, t.job?.jobTitle, t.job?.trade]
        .some((field) => field?.toLowerCase().includes(query)),
    );
  }, [transactions, search]);

  const showEmptyState = !loading && visibleTransactions.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Payments"
        subtitle="Financial ledger and invoice tracking"
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getWallet} tintColor="#10375C" />
        }
      >
        {/* Summary Cards */}
        <SummaryCard label="Available Balance" value={money(availableBalance.amount, currency)} />
        <SummaryCard label="Awaiting Payment"  value={money(pendingBalance.amount, currency)} />
        <SummaryCard label="Total Paid Out"    value={money(totalPaid, currency)} />

        {/* Transaction List Card */}
        <View style={styles.listCard}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <View style={styles.searchInputWrap}>
              <Search size={RFValue(12)} color="#94A3B8" />
              <RNTextInput
                style={styles.searchInput}
                placeholder="Search invoice, company or job..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {loading && transactions.length === 0 ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#10375C" />
            </View>
          ) : showEmptyState ? (
            <View style={styles.loader}>
              <Text style={styles.emptyText}>
                {search.trim() ? 'No matching transactions.' : 'No transactions yet.'}
              </Text>
            </View>
          ) : (
            visibleTransactions.map((item, idx) => (
              <TransactionRow
                key={item.invoiceNumber ?? idx}
                item={item}
                currency={currency}
              />
            ))
          )}

          {/* Footer count */}
          {visibleTransactions.length > 0 && (
            <View style={styles.paginationRow}>
              <Text style={styles.paginationCount}>
                Showing {visibleTransactions.length} of {transactions.length} results
              </Text>
            </View>
          )}
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

  // Loading / empty
  loader: { paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#94A3B8',
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
    marginBottom: 2,
  },
  invoiceJob: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    marginBottom: 10,
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
});

export default PaymentsScreen;
