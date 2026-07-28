import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, AddPaymentMethodModal } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import useCompanyInvoices from '~hooks/useCompanyInvoices';
import useCompanyCardSetup from '~hooks/useCompanyCardSetup';
import useAlert from '~hooks/useAlert';
import { useSelector } from 'react-redux';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => (n != null ? `£${Number(n).toFixed(2)}` : '—');

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const PAYMENT_STATUS_COLORS = {
  paid:      { bg: '#22C55E', text: '#FFFFFF' },
  unpaid:    { bg: '#F97316', text: '#FFFFFF' },
  overdue:   { bg: '#EF4444', text: '#FFFFFF' },
  finalized: { bg: '#F97316', text: '#FFFFFF' },
};

// ── Screen ────────────────────────────────────────────────────────────────────

const InvoiceDetailScreen = ({ route }) => {
  const { colors } = useTheme();
  const { invoiceId } = route.params ?? {};

  const {
    selectedInvoice: inv, loadingInvoiceDetail, getInvoiceById, resetSelectedInvoice,
    paying, payError, pay, dismissPayError,
  } = useCompanyInvoices();

  const { paymentMethod, loadingPaymentMethod, getPaymentMethod } = useCompanyCardSetup();
  const { showAlert } = useAlert();
  const companyName = useSelector((s) => s.profile?.data?.companyName ?? '');

  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    if (invoiceId) getInvoiceById(invoiceId);
    return () => resetSelectedInvoice();
  }, [invoiceId]);

  // Which card is about to be charged
  useEffect(() => {
    getPaymentMethod();
  }, []);

  // Surface a failed charge — the invoice stays unpaid and the button retries
  useEffect(() => {
    if (!payError) return;
    showAlert({ title: 'Payment Failed', message: payError, type: 'error' });
    dismissPayError();
  }, [payError]);

  const handlePay = useCallback(async () => {
    if (!paymentMethod) {
      setShowAddCard(true);
      return;
    }
    if (await pay(invoiceId)) {
      showAlert({ title: 'Payment Successful', message: 'This invoice has been paid.', type: 'success' });
    }
  }, [paymentMethod, pay, invoiceId, showAlert]);

  const handleCardSaved = useCallback(() => {
    setShowAddCard(false);
    getPaymentMethod();
    showAlert({ title: 'Card Saved', message: 'You can now pay this invoice.', type: 'success' });
  }, [getPaymentMethod, showAlert]);

  const statusKey    = (inv?.paymentStatus ?? inv?.status ?? '').toLowerCase();
  const statusColors = PAYMENT_STATUS_COLORS[statusKey] ?? { bg: '#94A3B8', text: '#FFFFFF' };
  const statusLabel  = inv?.paymentStatus
    ? inv.paymentStatus.charAt(0).toUpperCase() + inv.paymentStatus.slice(1).toLowerCase()
    : '—';

  const isPaid = statusKey === 'paid';

  return (
    <View style={[styles.root, { backgroundColor: '#F8FAFC' }]}>
      <Header title="Pdf Invoice" showBackButton />

      {loadingInvoiceDetail && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loadingInvoiceDetail && inv && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.invoiceCard}>

            {/* Logo + Invoice tag */}
            <View style={styles.invoiceHeader}>
              <View style={styles.logoRow}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoText}>T</Text>
                </View>
                <Text style={styles.brandText}>Traids<Text style={styles.brandDot}>.</Text></Text>
              </View>
              <View style={styles.invoiceTag}>
                <Text style={styles.invoiceTagLabel}>INVOICE</Text>
                <Text style={styles.invoiceTagNum}>#{inv.invoiceNumber ?? '—'}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.secondary }]} />

            {/* Billing meta */}
            <View style={styles.billingRow}>
              <View style={styles.billingLeft}>
                <Text style={styles.billingLabel}>BILL TO Project</Text>
                <Text style={styles.billingLabel}>Subcontractors</Text>
                <Text style={styles.billingProject}>
                  Project: {inv.job?.jobTitle ?? '—'}
                </Text>
              </View>
              <View style={styles.billingRight}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Date:</Text>
                  <Text style={styles.metaVal}>{formatDate(inv.weekStartDate)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Due Date:</Text>
                  <Text style={styles.metaVal}>{formatDate(inv.dueDate)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Status:</Text>
                  <View style={[styles.statusPill, { backgroundColor: statusColors.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>{statusLabel}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Line items */}
            {(inv.lineItems ?? []).map((item, idx) => (
              <View key={idx} style={[styles.contractorBlock, { borderColor: colors.border }]}>
                <Text style={styles.contractorName}>
                  {item.subcontractor?.fullName ?? item.subcontractorName ?? '—'}
                </Text>
                <Text style={styles.contractorMeta}>Hourly Rate: {fmt(item.hourlyRate)}/hr</Text>
                <View style={styles.itemDivider} />
                <View style={styles.contractorAmtRow}>
                  <Text style={styles.contractorHours}>Hours: {item.hours ?? 0}</Text>
                  <Text style={styles.contractorAmt}>{fmt(item.grossAmount)}</Text>
                </View>
              </View>
            ))}

            {/* Platform fee */}
            <View style={styles.feeRow}>
              <Text style={styles.feeName}>
                Platform Fee ({inv.lineItems?.[0]?.platformFeePercent != null
                  ? `${(inv.lineItems[0].platformFeePercent * 100).toFixed(0)}%`
                  : '5%'})
              </Text>
              <Text style={styles.feeAmount}>+{fmt(inv.totalPlatformFee)}</Text>
            </View>

            {/* CIS deduction (if present) */}
            {inv.totalCisDeduction != null && inv.totalCisDeduction > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeName}>CIS Deduction</Text>
                <Text style={styles.feeAmount}>-{fmt(inv.totalCisDeduction)}</Text>
              </View>
            )}

            {/* Stripe fee (if present) */}
            {inv.stripeFee != null && inv.stripeFee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeName}>Processing Fee</Text>
                <Text style={styles.feeAmountGrey}>+{fmt(inv.stripeFee)}</Text>
              </View>
            )}

            {/* Total */}
            <View style={[styles.totalRow, { backgroundColor: '#ECF6FF' }]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{fmt(inv.totalAmount)}</Text>
            </View>

            {/* Pay Now — only when not yet paid */}
            {!isPaid && (
              <>
                {/* Say which card gets charged before they commit */}
                {!loadingPaymentMethod && (
                  <Text style={[styles.cardOnFile, { color: colors.textMuted }]}>
                    {paymentMethod?.last4
                      ? `Paying with ${paymentMethod.brand ?? 'card'} •••• ${paymentMethod.last4}`
                      : 'No card on file — add one to pay this invoice.'}
                  </Text>
                )}

                <Button
                  title={paymentMethod ? 'Pay Now  ›' : 'Add Payment Method'}
                  variant="primary"
                  style={styles.payBtn}
                  onPress={handlePay}
                  loading={paying}
                />
              </>
            )}
          </View>
        </ScrollView>
      )}

      <AddPaymentMethodModal
        visible={showAddCard}
        onClose={() => setShowAddCard(false)}
        onSaved={handleCardSaved}
        billingName={companyName}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:           { flex: 1 },
  loader:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  invoiceHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: {
    width: 30, height: 30, borderRadius: 6,
    backgroundColor: '#F2A154', alignItems: 'center', justifyContent: 'center',
  },
  logoText:       { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#FFFFFF' },
  brandText:      { fontFamily: FontFamily.bold, fontSize: RFValue(16), color: '#10375C' },
  brandDot:       { color: '#F2A154' },
  invoiceTag:     { alignItems: 'flex-end' },
  invoiceTagLabel: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#10375C', letterSpacing: 1 },
  invoiceTagNum:  { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  divider:        { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  itemDivider:    { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  billingRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  billingLeft:    { flex: 1 },
  billingLabel:   { fontFamily: FontFamily.bold, fontSize: RFValue(10), color: '#10375C' },
  billingProject: { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#64748B', marginTop: 4 },
  billingRight:   { alignItems: 'flex-end', gap: 4 },
  metaRow:        { flexDirection: 'row', gap: 6, alignItems: 'center' },
  metaKey:        { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  metaVal:        { fontFamily: FontFamily.semiBold, fontSize: RFValue(9.5), color: '#10375C' },
  statusPill:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText:     { fontFamily: FontFamily.bold, fontSize: RFValue(8), color: '#FFFFFF' },
  contractorBlock: { paddingVertical: 10, borderWidth: 1, padding: 10, borderRadius: 10, marginBottom: 10 },
  contractorName:  { fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#10375C', marginBottom: 2 },
  contractorMeta:  { fontFamily: FontFamily.regular, fontSize: RFValue(9.5), color: '#94A3B8' },
  contractorAmtRow: { flexDirection: 'row', justifyContent: 'space-between' },
  contractorHours: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11) },
  contractorAmt:   { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#10375C' },
  feeRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  feeName:        { fontFamily: FontFamily.semiBold, fontSize: RFValue(11) },
  feeAmount:      { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#EF4444' },
  feeAmountGrey:  { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#94A3B8' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 8, marginTop: 10, marginBottom: 6,
  },
  totalLabel: { fontFamily: FontFamily.semiBold, fontSize: RFValue(13), color: '#10375C' },
  totalValue: { fontFamily: FontFamily.semiBold, fontSize: RFValue(14), color: '#10375C' },
  payBtn:     { marginTop: 16 },
  cardOnFile: { fontSize: RFValue(9), fontFamily: FontFamily.regular, marginTop: 14, textAlign: 'center' },
});

export default InvoiceDetailScreen;
