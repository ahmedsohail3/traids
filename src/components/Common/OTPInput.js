import React, { useRef, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

/**
 * OTPInput — 6 (or N) digit OTP entry with auto-focus progression.
 * Props:
 *   length   – number of boxes (default 6)
 *   value    – string of digits so far
 *   onChange – callback(newValue: string)
 */
const OTPInput = ({ length = 6, value = '', onChange }) => {
  const { colors } = useTheme();
  const inputRefs = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = useCallback(
    (text, index) => {
      const cleaned = text.replace(/\D/g, '');
      if (!cleaned) {
        const next = value.slice(0, index) + value.slice(index + 1);
        onChange(next);
        if (index > 0) inputRefs.current[index - 1]?.focus();
        return;
      }
      const digit = cleaned[cleaned.length - 1];
      const next = value.slice(0, index) + digit + value.slice(index + 1);
      onChange(next);
      if (index < length - 1) inputRefs.current[index + 1]?.focus();
    },
    [value, onChange, length],
  );

  const handleKeyPress = useCallback(
    (e, index) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={1}
          onPress={() => inputRefs.current[i]?.focus()}
          style={[
            styles.cellContainer,
            { borderColor: colors.border || '#E5E7EB', backgroundColor: colors.surface }
          ]}>
          <TextInput
            ref={ref => (inputRefs.current[i] = ref)}
            value={digit}
            onChangeText={text => handleChange(text, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            autoFocus={i === 0}
            style={[
              styles.input,
              { color: colors.textPrimary },
            ]}
          />
          {!!digit && (
            <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  cellContainer: {
    flex: 1,
    height: RFValue(45),
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  input: {
    ...StyleSheet.absoluteFillObject,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: RFValue(16),
    fontFamily: FontFamily.semiBold,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: RFValue(2.5),
    borderRadius: 3,
  },
});

export default OTPInput;
