import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const BORDER = '#E2E8F0';

const TRADE_OPTIONS = [
  { label: 'Electrician', value: 'electrician' },
  { label: 'Plumber',     value: 'plumber' },
  { label: 'Carpenter',   value: 'carpenter' },
  { label: 'Masonry',     value: 'masonry' },
];

const tradeLabel = (val) =>
  TRADE_OPTIONS.find(o => o.value === val)?.label ?? val ?? '';

const TradeDropdown = ({ value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  const display = tradeLabel(value);

  return (
    <View style={{ zIndex: 10, marginBottom: 14 }}>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor: BORDER, backgroundColor: colors.surface }]}
        activeOpacity={0.8}
        onPress={() => setOpen(o => !o)}>
        <Text style={[styles.dropdownText, { color: display ? '#000000' : '#94A3B8' }]}>
          {display || 'Select trade'}
        </Text>
        <ChevronDown size={RFValue(14)} color={display ? '#000000' : '#94A3B8'} />
      </TouchableOpacity>
      {open && (
        <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
          {TRADE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.dropdownItem, value === opt.value && styles.dropdownItemActive]}
              onPress={() => { onSelect(opt.value); setOpen(false); }}>
              <Text style={[styles.dropdownItemText, { color: colors.textPrimary }, value === opt.value && styles.dropdownItemTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: { fontFamily: FontFamily.regular, fontSize: RFValue(11) },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem:         { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  dropdownItemActive:   { backgroundColor: '#F0F6FF' },
  dropdownItemText:     { fontFamily: FontFamily.regular, fontSize: RFValue(11) },
  dropdownItemTextActive: { fontFamily: FontFamily.bold, color: '#10375C' },
});

export default TradeDropdown;
