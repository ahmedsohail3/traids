import React from 'react';
import {
  View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { X } from 'lucide-react-native';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmt = (n) => (n != null ? `£${Number(n).toFixed(2)}` : '—');

const PAYMENT_STATUS_COLORS = {
  paid:    { bg: '#DCFCE7', text: '#16A34A' },
  unpaid:  { bg: '#FEF9C3', text: '#CA8A04' },
  overdue: { bg: '#FEE2E2', text: '#DC2626' },
};

const PaymentBadge = ({ status }) => {
  const key    = (status ?? '').toLowerCase();
  const colors = PAYMENT_STATUS_COLORS[key] ?? { bg: '#F1F5F9', text: '#64748B' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '—'}
      </Text>
    </View>
  );
};

const InvoicesModal = ({ visible, onClose, invoices, loading, jobTitle, onViewReceipt }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheet}>
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Invoices</Text>
                <Text style={styles.subtitle}>
                  All invoices linked to {jobTitle ?? 'this job'}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={RFValue(14)} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#10375C" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                {invoices.length === 0 && (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>No invoices found.</Text>
                  </View>
                )}

                {invoices.map((inv) => (
                  <View key={inv._id} style={styles.card}>
                    {/* Invoice number + badge */}
                    <View style={styles.cardTop}>
                      <View style={styles.cardTopLeft}>
                        <Text style={styles.invoiceNumber}>{inv.invoiceNumber ?? '—'}</Text>
                        <PaymentBadge status={inv.paymentStatus} />
                      </View>
                      <TouchableOpacity style={styles.receiptBtn} onPress={() => onViewReceipt?.(inv._id)}>
                        <Text style={styles.receiptBtnText}>View Receipt</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Dates */}
                    <Text style={styles.dates}>
                      Created: {formatDate(inv.weekStartDate)}{'  ·  '}Due: {formatDate(inv.dueDate)}
                    </Text>

                    {/* Amount */}
                    <Text style={styles.amount}>{fmt(inv.subtotal)}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 23, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    color: '#10375C',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#64748B',
  },
  closeBtn: {
    padding: 4,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#94A3B8',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invoiceNumber: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8),
  },
  receiptBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  receiptBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9.5),
    color: '#10375C',
  },
  dates: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
    marginBottom: 10,
  },
  amount: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
});

export default InvoicesModal;
