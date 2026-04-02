import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const NAVY = '#10375C';
const BORDER = '#E2E8F0';
const TRADE_OPTIONS = ['Electrician', 'Plumber', 'Bricklayer', 'Carpenter', 'Roofer', 'Painter'];

const TradeDropdown = ({ value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={{ zIndex: 10, marginBottom: 14 }}>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor: BORDER, backgroundColor: colors.surface }]}
        activeOpacity={0.8}
        onPress={() => setOpen(o => !o)}>
        <Text style={[styles.dropdownText, { color: value ? '#000000' : '#94A3B8' }]}>
          {value || 'Select trade'}
        </Text>
        <ChevronDown size={RFValue(14)} color={value ? '#000000' : '#94A3B8'} />
      </TouchableOpacity>
      {open && (
        <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
          {TRADE_OPTIONS.map(t => (
            <TouchableOpacity
              key={t}
              style={styles.dropdownItem}
              onPress={() => { onSelect(t); setOpen(false); }}>
              <Text style={[styles.dropdownItemText, { color: colors.textPrimary }]}>{t}</Text>
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
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  dropdownItemText: { fontFamily: FontFamily.regular, fontSize: RFValue(11) },
});

export default TradeDropdown;
