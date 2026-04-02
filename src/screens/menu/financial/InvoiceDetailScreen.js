import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { CreditCard } from 'lucide-react-native';
import { Button } from '~components/Common';

// Mock invoice data populated from route params
const InvoiceDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();

  const CONTRACTORS = [
    { name: 'Emma Thompson', account: 'Account No: 88229911', iban: 'IBAN No: 88229911', hours: 14, amount: '£560.00' },
    { name: 'Emma Thompson', account: 'Account No: 88229911', iban: 'IBAN No: 88229911', hours: 14, amount: '£560.00' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: '#F8FAFC' }]}>
      <Header title="Compliance Centre" subtitle="Manage safety documents, permits, and regulatory requirements according to jobs" showBackButton />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.invoiceCard}>
          {/* Top: Logo + Invoice tag */}
          <View style={styles.invoiceHeader}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>T</Text>
              </View>
              <Text style={styles.brandText}>Traids<Text style={styles.brandDot}>.</Text></Text>
            </View>
            <View style={styles.invoiceTag}>
              <Text style={styles.invoiceTagLabel}>INVOICE</Text>
              <Text style={styles.invoiceTagNum}>#INV-000101</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Billing meta */}
          <View style={styles.billingRow}>
            <View style={styles.billingLeft}>
              <Text style={styles.billingLabel}>BILL TO Project</Text>
              <Text style={styles.billingLabel}>Subcontractors</Text>
              <Text style={styles.billingProject}>Project: Downtown office{'\n'}Renovation</Text>
            </View>
            <View style={styles.billingRight}>
              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>Date:</Text>
                <Text style={styles.metaVal}>2025-07-20</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>Due Date:</Text>
                <Text style={styles.metaVal}>2025-08-20</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>Status:</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Pending</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contractors */}
          {CONTRACTORS.map((c, idx) => (
            <View key={idx}>
              <View style={styles.contractorBlock}>
                <Text style={styles.contractorName}>{c.name}</Text>
                <Text style={styles.contractorMeta}>{c.account}</Text>
                <Text style={styles.contractorMeta}>{c.iban}</Text>
                <View style={styles.contractorAmtRow}>
                  <Text style={styles.contractorHours}>Hours: {c.hours}</Text>
                  <Text style={styles.contractorAmt}>{c.amount}</Text>
                </View>
              </View>
              {idx !== CONTRACTORS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          <View style={styles.divider} />

          {/* Platform Fee */}
          <View style={styles.feeRow}>
            <Text style={styles.feeName}>Platform Fee(5%)</Text>
            <Text style={styles.feeAmount}>-£10.00</Text>
          </View>

          {/* Total */}
          <View style={[styles.totalRow, { backgroundColor: '#F8FAFC' }]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>£784.00</Text>
          </View>

          <View style={styles.divider} />

          {/* Payment card */}
          <View style={styles.payCardBlock}>
            <View style={styles.payCardLeft}>
              <View style={styles.cardIcon}>
                <CreditCard size={RFValue(18)} color="#F2A154" />
              </View>
              <View>
                <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
                <Text style={styles.cardExpiry}>Expires 12/26 · Visa</Text>
              </View>
            </View>
            <Text style={styles.visaLabel}>VISA</Text>
          </View>

          <Button
            title="Pay Now  ›"
            variant="primary"
            style={styles.payBtn}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 120 },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: {
    width: 30, height: 30, borderRadius: 6,
    backgroundColor: '#F2A154', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#FFFFFF' },
  brandText: { fontFamily: FontFamily.bold, fontSize: RFValue(16), color: '#10375C' },
  brandDot: { color: '#F2A154' },
  invoiceTag: { alignItems: 'flex-end' },
  invoiceTagLabel: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#10375C', letterSpacing: 1 },
  invoiceTagNum: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  billingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billingLeft: { flex: 1 },
  billingLabel: { fontFamily: FontFamily.bold, fontSize: RFValue(10), color: '#10375C' },
  billingProject: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#64748B', marginTop: 4 },
  billingRight: { alignItems: 'flex-end', gap: 4 },
  metaRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  metaKey: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  metaVal: { fontFamily: FontFamily.semiBold, fontSize: RFValue(9.5), color: '#10375C' },
  statusPill: { backgroundColor: '#F97316', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontFamily: FontFamily.bold, fontSize: RFValue(8), color: '#FFFFFF' },
  contractorBlock: { paddingVertical: 4 },
  contractorName: { fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#10375C', marginBottom: 2 },
  contractorMeta: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  contractorAmtRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  contractorHours: { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#64748B' },
  contractorAmt: { fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#10375C' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  feeName: { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#64748B' },
  feeAmount: { fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#EF4444' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 8, marginVertical: 6,
  },
  totalLabel: { fontFamily: FontFamily.bold, fontSize: RFValue(13), color: '#10375C' },
  totalValue: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#10375C' },
  payCardBlock: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12,
  },
  payCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFF7ED',
    alignItems: 'center', justifyContent: 'center',
  },
  cardNumber: { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#10375C' },
  cardExpiry: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  visaLabel: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#10375C', fontStyle: 'italic' },
  payBtn: { marginTop: 16 },
});

export default InvoiceDetailScreen;
