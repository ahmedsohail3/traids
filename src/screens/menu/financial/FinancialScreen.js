import { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { PoundSterling, Briefcase, Clock, Star, Search, Filter, Eye, Download } from 'lucide-react-native';
import StatCard from '~components/Common/StatCard';
import useCompanyFinancials from '~hooks/useCompanyFinancials';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (amount) => {
  if (amount == null) return '£0';
  return `£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Static invoice data (real data will come from invoices API) ───────────────

const INVOICES = [
  { id: 'INV-001', status: 'Pending', amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-002', status: 'Paid',    amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-003', status: 'Pending', amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-004', status: 'Paid',    amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-005', status: 'Pending', amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
];

const StatusPill = ({ status }) => {
  const color = status === 'Paid' ? '#22C55E' : '#F97316';
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.pillText}>{status}</Text>
    </View>
  );
};

// ─── Screen ────────────────────────────────────────────────────────────────────

const FinancialScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const { financialSummary, loading, getFinancialSummary } = useCompanyFinancials();

  useEffect(() => { getFinancialSummary(); }, []);

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
          {INVOICES.map((inv, idx) => (
            <View key={inv.id} style={[styles.invoiceRow, idx !== INVOICES.length - 1 && styles.rowDivider]}>
              <View style={styles.invoiceTop}>
                <Text style={styles.invoiceId}>{inv.id}</Text>
                <StatusPill status={inv.status} />
                <Text style={styles.invoiceAmount}>{inv.amount}</Text>
              </View>
              <Text style={styles.invoiceProject}>{inv.project}</Text>
              <View style={styles.invoiceBottom}>
                <Text style={styles.invoiceDate}>{inv.date}</Text>
                <View style={styles.invoiceActions}>
                  <TouchableOpacity onPress={() => navigation.navigate('InvoiceDetail', { invoice: inv })}>
                    <Eye size={RFValue(14)} color="#94A3B8" />
                  </TouchableOpacity>
                  <Download size={RFValue(14)} color="#94A3B8" />
                </View>
              </View>
            </View>
          ))}
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

  invoiceRow:     { padding: 16 },
  invoiceTop:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  invoiceId:      { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#10375C' },
  invoiceAmount:  { marginLeft: 'auto', fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#10375C' },
  invoiceProject: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', marginBottom: 8 },
  invoiceBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceDate:    { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  invoiceActions: { flexDirection: 'row', gap: 14 },

  pill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  pillText: { fontFamily: FontFamily.bold, fontSize: RFValue(9), color: '#FFFFFF' },
});

export default FinancialScreen;
