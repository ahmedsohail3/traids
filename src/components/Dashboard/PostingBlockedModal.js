import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Lock } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';

const PostingBlockedModal = ({ visible, onDismiss, onViewInvoices }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
    <View style={styles.modalBg}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onDismiss} activeOpacity={1} />
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />
          
          <Lock size={RFValue(40)} color="#EF4444" strokeWidth={2} style={styles.lockIcon} />
          <Text variant='screenTitle' style={styles.title}>Posting Blocked</Text>
          <Text style={styles.sub}>
            You have unpaid invoices. To ensure platform fairness, we require all outstanding payments to be settled externally before posting new jobs or sending offers.
          </Text>
          
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.laterBtn} onPress={onDismiss} activeOpacity={0.8}>
              <Text style={styles.laterTxt}>Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewBtn} onPress={onViewInvoices} activeOpacity={0.8}>
              <Text style={styles.viewTxt}>View Unpaid Invoices</Text>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 23, 0.4)', // Dark subtle background
    justifyContent: 'flex-end',
  },
  backdropTouch: { flex: 1, width: '100%' },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: NAVY,
    marginBottom: 24,
  },
  lockIcon: {
    marginBottom: 16,
  },
  title: { 
    marginBottom: 12, 
  },
  sub: { 
    fontFamily: FontFamily.regular, 
    fontSize: RFValue(11), 
    color: '#545454', 
    textAlign: 'center', 
    lineHeight: RFValue(17), 
    marginBottom: 32,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  laterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterTxt: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
    color: NAVY,
  },
  viewBtn: {
    flex: 1,
    backgroundColor: NAVY,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTxt: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
    color: '#fff',
  },
});

export default PostingBlockedModal;
