import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const Checkbox = ({ label, checked, onPress, style }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.box,
          { borderColor: checked ? colors.primary : '#E2E8F0' },
          checked && { backgroundColor: colors.primary }
        ]}
      >
        {checked && <Check size={RFValue(12)} color="#FFFFFF" />}
      </View>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  box: {
    width: RFValue(14),
    height: RFValue(14),
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
  },
});

export default Checkbox;
