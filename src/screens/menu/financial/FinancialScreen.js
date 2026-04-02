import React, { useState } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { PoundSterling, Briefcase, Clock, CreditCard, Search, Filter, Eye, Download } from 'lucide-react-native';
import StatCard from '~components/Common/StatCard';

const TABS = ['Project Invoices', 'CIS Returns'];

// ─── Project Invoices data ─────────────────────────────────────────────────────
const INVOICES = [
  { id: 'INV-001', status: 'Pending', amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-001', status: 'Paid',    amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-001', status: 'Pending', amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-001', status: 'Paid',    amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
  { id: 'INV-001', status: 'Pending', amount: '£1250.00', project: 'Downtown Office Renovation', date: 'Oct 24, 2023' },
];

// ─── CIS Returns data ──────────────────────────────────────────────────────────
const CIS_ITEMS = [
  { name: 'John Smith', trade: 'Electrician', company: 'Built Right Construction', project: 'Downtown Office Renovation', cis: '20%', amount: '20%', invoices: '3x', status: 'Pending' },
  { name: 'John Smith', trade: 'Electrician', company: 'Built Right Construction', project: 'Downtown Office Renovation', cis: '20%', amount: '20%', invoices: '3x', status: 'Paid' },
  { name: 'John Smith', trade: 'Electrician', company: 'Built Right Construction', project: 'Downtown Office Renovation', cis: '20%', amount: '20%', invoices: '3x', status: 'Pending' },
];

const StatusPill = ({ status }) => {
  const color = status === 'Paid' ? '#22C55E' : '#F97316';
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.pillText}>{status}</Text>
    </View>
  );
};

const FinancialScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [search, setSearch] = useState('');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Financial Tools"
        subtitle="Manage payments, generate documents, and track CIS compliance"
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Stats grid */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <StatCard label="Total Spend (YTD)" value="£142,500" subLabel="↘ +12% vs last year" icon={PoundSterling} iconColor="#10375C" positive={false} />
            </View>
            <View style={styles.statCell}>
              <StatCard label="Active Projects" value="8" subLabel="↗ +2 vs last month" icon={Briefcase} iconColor="#10375C" positive={true} />
            </View>
          </View>
          <View style={[styles.statsRow, { marginTop: 10 }]}>
            <View style={styles.statCell}>
              <StatCard label="On-Time Completion" value="94%" subLabel="↘ -2% vs target" icon={Clock} iconColor="#10375C" positive={false} />
            </View>
            <View style={styles.statCell}>
              <StatCard label="Pending Platform Free" value="-£2,500" subLabel="No spending recorded" icon={CreditCard} iconColor="#10375C" positive={undefined} />
            </View>
          </View>
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

        {/* Tabs */}
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

        {activeTab === TABS[0] ? (
          // ── Project Invoices ──
          <View style={styles.listCard}>
            {INVOICES.map((inv, idx) => (
              <View key={idx} style={[styles.invoiceRow, idx !== INVOICES.length - 1 && styles.rowDivider]}>
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
        ) : (
          // ── CIS Returns ──
          <View>
            <View style={styles.listCard}>
              {CIS_ITEMS.map((item, idx) => (
                <View key={idx} style={[styles.cisRow, idx !== CIS_ITEMS.length - 1 && styles.rowDivider]}>
                  <View style={styles.cisTop}>
                    <View style={styles.cisLeft}>
                      <Text style={styles.cisName}>{item.name}</Text>
                      <Text style={styles.cisTrade}>{item.trade}</Text>
                    </View>
                    <Text style={styles.cisCompany}>{item.company}</Text>
                    <StatusPill status={item.status} />
                  </View>
                  <Text style={styles.cisProject}>{item.project}</Text>
                  <View style={styles.cisMeta}>
                    <Text style={styles.cisMetaText}>CIS%: {item.cis}</Text>
                    <Text style={styles.cisMetaText}>CIS Amount: {item.amount}</Text>
                    <Text style={styles.cisMetaText}>Invoice: {item.invoices}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.hmrcBtn}>
              <Text style={styles.hmrcBtnText}>Send CIS Return to HMRC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.hmrcBtn, styles.hmrcBtnSecondary]}>
              <Text style={[styles.hmrcBtnText, { color: '#10375C' }]}>Payment to HMRC</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 120 },

  // Stats
  statsCard: { marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCell: { flex: 1 },

  // Search
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

  // Tabs
  tabRow: { flexDirection: 'row', marginBottom: 16, gap: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabItem: { paddingBottom: 10, alignItems: 'center' },
  tabLabel: { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#94A3B8' },
  tabLabelActive: { color: '#10375C', fontFamily: FontFamily.bold },
  tabUnderline: { position: 'absolute', bottom: 0, width: '100%', height: 2, backgroundColor: '#10375C', borderRadius: 2 },

  // Shared list
  listCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },

  // Invoice rows
  invoiceRow: { padding: 16 },
  invoiceTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  invoiceId: { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#10375C' },
  invoiceAmount: { marginLeft: 'auto', fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#10375C' },
  invoiceProject: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', marginBottom: 8 },
  invoiceBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceDate: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  invoiceActions: { flexDirection: 'row', gap: 14 },

  // CIS rows
  cisRow: { padding: 16 },
  cisTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  cisLeft: { flex: 1 },
  cisName: { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#10375C' },
  cisTrade: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  cisCompany: { fontFamily: FontFamily.bold, fontSize: RFValue(10), color: '#10375C', flex: 1, textAlign: 'center' },
  cisProject: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', marginBottom: 8 },
  cisMeta: { flexDirection: 'row', gap: 16 },
  cisMetaText: { fontFamily: FontFamily.medium, fontSize: RFValue(9.5), color: '#64748B' },

  // HMRC buttons
  hmrcBtn: {
    backgroundColor: '#10375C', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  hmrcBtnSecondary: { backgroundColor: '#E2E8F0' },
  hmrcBtnText: { fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#FFFFFF' },

  // Pill
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  pillText: { fontFamily: FontFamily.bold, fontSize: RFValue(9), color: '#FFFFFF' },
});

export default FinancialScreen;
