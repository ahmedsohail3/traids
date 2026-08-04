import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { PoundSterling, Briefcase, Clock, Star, Search, Filter, Eye } from 'lucide-react-native';
import StatCard from '~components/Common/StatCard';
import useCompanyFinancials from '~hooks/useCompanyFinancials';
import useCompanyInvoices from '~hooks/useCompanyInvoices';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (amount) => {
  if (amount == null) return '£0';
  return `£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const STATUS_COLORS = { Paid: '#22C55E', Overdue: '#EF4444', Pending: '#F97316' };

// An unpaid invoice past its due date is called out in red, matching the
// detail screen's payment status colours.
const invoiceStatus = ({ paymentStatus, dueDate }) => {
  if (paymentStatus === 'paid') return 'Paid';
  if (dueDate && new Date(dueDate) < new Date()) return 'Overdue';
  return 'Pending';
};

// Flattens an API invoice into the fields the row renders. `raw` is handed to
// the detail screen so it can render straight away from this response.
const mapInvoice = (inv) => ({
  _id:     inv._id,
  raw:     inv,
  number:  inv.invoiceNumber ?? '—',
  status:  invoiceStatus(inv),
  amount:  fmtCurrency(inv.totalAmount),
  project: inv.job?.jobTitle ?? 'Untitled project',
  date:    fmtDate(inv.createdAt),
});

const StatusPill = ({ status }) => (
  <View style={[styles.pill, { backgroundColor: STATUS_COLORS[status] ?? '#F97316' }]}>
    <Text style={styles.pillText}>{status}</Text>
  </View>
);

// ─── Screen ────────────────────────────────────────────────────────────────────

const FinancialScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const { financialSummary, loading, getFinancialSummary } = useCompanyFinancials();
  const { allInvoices, loadingAll, allError, getCompanyInvoices } = useCompanyInvoices();

  useEffect(() => {
    getFinancialSummary();
    getCompanyInvoices();
  }, []);

  // Map once per fetch, then filter on the search term — invoice number,
  // project title and amount are all searchable.
  const invoices = useMemo(() => allInvoices.map(mapInvoice), [allInvoices]);

  const visibleInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return invoices;
    return invoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(term) ||
        inv.project.toLowerCase().includes(term) ||
        inv.amount.toLowerCase().includes(term),
    );
  }, [invoices, search]);

  const summary       = financialSummary ?? {};
  const ytdAmount     = summary.totalSpendYTD?.amount;
  const ytdVsLastYear = summary.totalSpendYTD?.vsLastYearPercent;
  const activeProjects     = summary.activeProjects     ?? null;
  const avgRating          = summary.avgContractorRating ?? null;
  const onTimeCompletion   = summary.onTimeCompletionPercent ?? null;

  const ytdSubLabel = ytdVsLastYear != null ? `${ytdVsLastYear > 0 ? '↗' : '↘'} ${Math.abs(ytdVsLastYear)}% vs last year` : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Financial Tools"
        subtitle="Manage payments, generate documents, and track financial performance"
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

        {/* Stats grid */}
        <View style={styles.statsCard}>
          {loading && !financialSummary ? (
            <View style={styles.statsLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <StatCard
                    label="Total Spend YTD"
                    value={fmtCurrency(ytdAmount)}
                    subLabel={ytdSubLabel}
                    icon={PoundSterling}
                    iconColor="#10375C"
                    positive={false}
                  />
                </View>
                <View style={styles.statCell}>
                  <StatCard
                    label="Active Projects"
                    value={activeProjects != null ? String(activeProjects) : '—'}
                    icon={Briefcase}
                    iconColor="#10375C"
                    positive={true}
                  />
                </View>
              </View>
              <View style={[styles.statsRow, { marginTop: 10 }]}>
                <View style={styles.statCell}>
                  <StatCard
                    label="On-Time Completion"
                    value={onTimeCompletion != null ? `${onTimeCompletion}%` : '—'}
                    icon={Clock}
                    iconColor="#10375C"
                    positive={true}
                  />
                </View>
                <View style={styles.statCell}>
                  <StatCard
                    label="Avg Contractor Rating"
                    value={avgRating != null ? `${avgRating}/5` : '—'}
                    icon={Star}
                    iconColor="#10375C"
                    positive={true}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { borderColor: colors.border }]}>
            <Search size={RFValue(13)} color="#94A3B8" />
            <RNTextInput
              style={styles.searchInput}
              placeholder="Search item..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={[styles.filterBtn, { borderColor: colors.border }]}>
            <Filter size={RFValue(13)} color="#64748B" />
            <Text style={styles.filterText}>All Status</Text>
          </TouchableOpacity>
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Project Invoices</Text>

        {/* Invoice list */}
        <View style={styles.listCard}>
          {loadingAll && invoices.length === 0 ? (
            <View style={styles.listState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : visibleInvoices.length === 0 ? (
            <View style={styles.listState}>
              <Text style={styles.emptyText}>
                {allError
                  ? allError
                  : search.trim()
                    ? 'No invoices match your search.'
                    : 'No invoices yet.'}
              </Text>
            </View>
          ) : (
            visibleInvoices.map((inv, idx) => (
              <View
                key={inv._id}
                style={[styles.invoiceRow, idx !== visibleInvoices.length - 1 && styles.rowDivider]}
              >
                <View style={styles.invoiceTop}>
                  <Text style={styles.invoiceId}>{inv.number}</Text>
                  <StatusPill status={inv.status} />
                  <Text style={styles.invoiceAmount}>{inv.amount}</Text>
                </View>
                <Text style={styles.invoiceProject} numberOfLines={1}>{inv.project}</Text>
                <View style={styles.invoiceBottom}>
                  <Text style={styles.invoiceDate}>{inv.date}</Text>
                  <TouchableOpacity
                    hitSlop={8}
                    onPress={() =>
                      navigation.navigate('InvoiceDetail', { invoiceId: inv._id, invoice: inv.raw })
                    }
                  >
                    <Eye size={RFValue(14)} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:            { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 120 },

  statsCard:   { marginBottom: 16 },
  statsRow:    { flexDirection: 'row', gap: 12 },
  statCell:    { flex: 1 },
  statsLoader: { paddingVertical: 40, alignItems: 'center' },

  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  searchInput: { flex: 1, fontSize: RFValue(11), fontFamily: FontFamily.regular, color: '#10375C', padding: 0 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  filterText: { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#64748B' },

  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 12,
  },

  listCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listState:  { paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText:  {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  invoiceRow:     { padding: 16 },
  invoiceTop:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  invoiceId:      { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#10375C' },
  invoiceAmount:  { marginLeft: 'auto', fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#10375C' },
  invoiceProject: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', marginBottom: 8 },
  invoiceBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceDate:    { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },

  pill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  pillText: { fontFamily: FontFamily.bold, fontSize: RFValue(9), color: '#FFFFFF' },
});

export default FinancialScreen;
