import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { FileText, CheckCircle } from 'lucide-react-native';
import { Button } from '~components/Common';

// ─── Shared summary row ────────────────────────────────────────────────────────
const SummaryRow = ({ label, value, labelStyle, valueStyle }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, labelStyle]}>{label}</Text>
    <Text style={[styles.summaryValue, valueStyle]}>{value}</Text>
  </View>
);

// ─── SubmitInvoiceModal ────────────────────────────────────────────────────────
// Two states: 'confirm' and 'success'
const SubmitInvoiceModal = ({
  visible, onClose, onConfirm, submitted,
  submitting = false,
  submitMessage = null,
  totalHours = 0,
  totalPayable = 0,
  grossAmount = 0,
  jobTitle = 'this project',
  companyName = 'the company',
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handleBar} />

        {!submitted ? (
          // ── Confirm State ─────────────────────────────────────────────────
          <>
            <View style={styles.iconCircle}>
              <FileText size={RFValue(32)} color="#10375C" />
            </View>
            <Text style={styles.modalTitle}>Submit Timesheet</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to submit this week's timesheet?</Text>

            <View style={styles.modalSummaryBlock}>
              <SummaryRow label="Total Hours Worked" value={`${totalHours} hrs`} />
              <View style={styles.modalDivider} />
              <View style={styles.totalPayable}>
                <SummaryRow label="Total Payable" value={`£ ${totalPayable.toFixed(2)}`} labelStyle={styles.semiBoldText} /></View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
                <Text style={styles.cancelBtnText}>No, Close</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Button
                  title={submitting ? 'Submitting…' : 'Yes, Sure'}
                  variant="primary"
                  onPress={onConfirm}
                  disabled={submitting}
                />
              </View>
            </View>
          </>
        ) : (
          // ── Success State ─────────────────────────────────────────────────
          <>
            <View style={styles.successIconCircle}>
              <CheckCircle size={RFValue(40)} color="#22C55E" />
            </View>
            <Text style={styles.modalTitle}>Timesheet Submitted</Text>
            <Text style={styles.modalSubtitle}>
              Your timesheet for {jobTitle} has been submitted to {companyName} for approval. Gross amount: £{grossAmount.toFixed(2)}.
            </Text>
            {submitMessage ? (
              <View style={styles.statusNoteBox}>
                <Text style={styles.statusNoteText}>{submitMessage}</Text>
              </View>
            ) : null}

            <View style={styles.modalSummaryBlock}>
              <SummaryRow label="Total Hours Worked" value={`${totalHours} hrs`} />
              <View style={styles.modalDivider} />
              <View style={styles.totalPayable}>
                <SummaryRow label="Total Payable" value={`£ ${totalPayable.toFixed(2)}`} labelStyle={styles.semiBoldText} />
              </View>
            </View>

            <Button title="Done" variant="primary" onPress={onClose} style={{ marginTop: 8 }} />
          </>
        )}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 42 : 28,
    alignItems: 'center',
  },
  handleBar: {
    width: 40, height: 4, backgroundColor: '#CBD5E1',
    borderRadius: 2, marginBottom: 24, alignSelf: 'center',
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  successIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(15),
    color: '#10375C',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: RFValue(16),
  },
  statusNoteBox: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  statusNoteText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#C2410C',
    textAlign: 'center',
    lineHeight: RFValue(15),
  },
  modalSummaryBlock: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  semiBoldText: {
    fontFamily: FontFamily.semiBold,
    color: '#10375C',
  },
  totalPayable: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    backgroundColor: '#F8FAFC'
  },
  modalDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#64748B',
  },
});

export default SubmitInvoiceModal;
