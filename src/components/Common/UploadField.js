import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Upload } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

/**
 * UploadField — file upload card styled consistently with the login flow card design.
 *
 * Props:
 *   label     – section label (e.g. "Company Document*")
 *   hint      – hint text shown inside the box (file types / max size)
 *   onPress   – callback when the box or button is pressed
 *   file      – currently selected file object { name, uri } – optional
 *   style     – optional outer style
 */
const UploadField = ({ label, hint = 'PDF, JPG or PNG (max. 5MB)', onPress, file, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {label.includes('*')
            ? [
                label.substring(0, label.indexOf('*')),
                <Text key="star" style={{ color: colors.error }}>*</Text>,
                label.substring(label.indexOf('*') + 1),
              ]
            : label}
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.box,
          {
            borderColor: colors.border,
            backgroundColor: colors.backgroundSecondary || '#F9FAFB',
          },
        ]}>
        <Upload
          size={RFValue(24)}
          color={colors.textSecondary}
          strokeWidth={1.5}
          style={styles.icon}
        />
        <Text style={[styles.ctaText, { color: colors.textSecondary }]}>
          Click to upload or drag and drop
        </Text>
        <Text style={[styles.hintText, { color: colors.textMuted }]}>{hint}</Text>
      </TouchableOpacity>

      {file ? (
        <Text
          numberOfLines={1}
          style={[styles.fileName, { color: colors.primary }]}>
          {file.name}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
    marginBottom: 8,
  },
  box: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: RFValue(20),
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 10,
  },
  ctaText: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.medium,
    textAlign: 'center',
    marginBottom: 4,
  },
  hintText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  fileName: {
    marginTop: 8,
    fontSize: RFValue(11),
    fontFamily: FontFamily.medium,
  },
});

export default UploadField;
