import { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import dayjs from 'dayjs';

let DatePicker;
let DateTimePicker;
if (Platform.OS === 'android') {
  DatePicker = require('react-native-date-picker').default;
} else {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const NAVY = '#10375C';

/**
 * DateModal
 * Android: react-native-date-picker modal mode.
 * iOS:     @react-native-community/datetimepicker spinner inside a bottom sheet modal.
 *
 * Shared between PostJobScreen and SendOfferScreen for picking timeline dates.
 */
const DateModal = ({ visible, title, value, minimumDate, onConfirm, onClose }) => {
  const clamp  = (d) => minimumDate && d < minimumDate ? minimumDate : d;
  const dateObj = clamp(value ? new Date(value) : new Date());
  const [tempDate, setTempDate] = useState(dateObj);

  // Sync tempDate when modal opens
  const wasVisible = useRef(false);
  if (visible && !wasVisible.current) {
    wasVisible.current = true;
    const next = clamp(value ? new Date(value) : new Date());
    if (next.getTime() !== tempDate.getTime()) setTempDate(next);
  }
  if (!visible) wasVisible.current = false;

  const handleConfirm = useCallback((date) => {
    onConfirm(dayjs(date).format('YYYY-MM-DD'));
    onClose();
  }, [onConfirm, onClose]);

  if (Platform.OS === 'android') {
    return (
      <DatePicker
        modal
        open={visible}
        date={tempDate}
        mode="date"
        title={title}
        minimumDate={minimumDate}
        onConfirm={(date) => handleConfirm(date)}
        onCancel={onClose}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.dateModal}>
          <Text style={styles.dateModalTitle}>{title}</Text>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            minimumDate={minimumDate}
            onChange={(_, date) => { if (date) setTempDate(date); }}
            style={styles.iosDatePicker}
            // This sheet is always white, so keep the spinner light too —
            // otherwise iOS restyles its band and dividers for dark mode.
            themeVariant="light"
            textColor={NAVY}
          />
          <View style={styles.dateModalActions}>
            <TouchableOpacity style={styles.dateModalCancel} onPress={onClose}>
              <Text style={styles.dateModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateModalConfirm}
              onPress={() => handleConfirm(tempDate)}>
              <Text style={styles.dateModalConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  dateModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  dateModalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    color: NAVY,
    marginBottom: 4,
    textAlign: 'center',
  },
  iosDatePicker: { width: '100%', marginBottom: 8 },
  dateModalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  dateModalCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  dateModalCancelText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#64748B' },
  dateModalConfirm: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: NAVY, alignItems: 'center',
  },
  dateModalConfirmText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#FFFFFF' },
});

export default DateModal;
