import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import Checkbox from '~components/Common/Checkbox';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const { width, height } = Dimensions.get('window');

const TRADE_OPTIONS = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'HVAC Tech',
  'Painter',
  'Masonry',
];

const SubJobFilterModal = ({ visible, onClose, onApply }) => {
  const { colors } = useTheme();

  const [selectedTrades, setSelectedTrades] = useState([]);
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');

  const toggleTrade = trade => {
    setSelectedTrades(prev =>
      prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade],
    );
  };

  const handleReset = () => {
    setSelectedTrades([]);
    setMinRate('');
    setMaxRate('');
    setLocation('');
    setAvailability('');
  };

  const handleApply = () => {
    onApply?.({ trades: selectedTrades, minRate, maxRate, location, availability });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.modalBackground }]}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Filter Jobs</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <X size={RFValue(18)} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Trade Type */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Trade Type</Text>
            <View style={styles.checkboxGrid}>
              {TRADE_OPTIONS.map(trade => (
                <View key={trade} style={styles.checkboxWrap}>
                  <Checkbox
                    label={trade}
                    checked={selectedTrades.includes(trade)}
                    onPress={() => toggleTrade(trade)}
                  />
                </View>
              ))}
            </View>

            {/* Max Hourly Rate */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Hourly Rate Range
            </Text>
            <View style={styles.rateRow}>
              <View
                style={[
                  styles.rateInput,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.rateCurrency, { color: colors.textSecondary }]}>£</Text>
                <TextInput
                  style={[styles.rateField, { color: colors.textPrimary }]}
                  placeholder="Min"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numeric"
                  value={minRate}
                  onChangeText={setMinRate}
                />
              </View>
              <Text style={[styles.rateSep, { color: colors.textSecondary }]}>–</Text>
              <View
                style={[
                  styles.rateInput,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.rateCurrency, { color: colors.textSecondary }]}>£</Text>
                <TextInput
                  style={[styles.rateField, { color: colors.textPrimary }]}
                  placeholder="Max"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numeric"
                  value={maxRate}
                  onChangeText={setMaxRate}
                />
              </View>
            </View>

            {/* Location */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Location</Text>
            <View
              style={[
                styles.fieldWrap,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[styles.fieldInput, { color: colors.textPrimary }]}
                placeholder="Enter location"
                placeholderTextColor={colors.inputPlaceholder}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Availability */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Availability</Text>
            <View
              style={[
                styles.fieldWrap,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[styles.fieldInput, { color: colors.textPrimary }]}
                placeholder="mm/dd/yyyy"
                placeholderTextColor={colors.inputPlaceholder}
                value={availability}
                onChangeText={setAvailability}
              />
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetBtnText, { color: colors.textPrimary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Show Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(16,55,92,0.4)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
  },
  sectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  checkboxWrap: {
    width: '50%',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  rateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  rateCurrency: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(12),
    marginRight: 4,
  },
  rateField: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    padding: 0,
  },
  rateSep: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(16),
  },
  fieldWrap: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    marginBottom: 16,
  },
  fieldInput: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  resetBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
  },
  applyBtn: {
    flex: 2,
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
  },
});

export default SubJobFilterModal;
