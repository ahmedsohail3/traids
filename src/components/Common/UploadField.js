import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Upload, X } from 'lucide-react-native';
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
const UploadField = ({ label, instructions = 'Click to upload or drag and drop',  hint = 'PDF, JPG or PNG (max. 5MB)', onPress, onRemove, file, style }) => {
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
            backgroundColor: '#FFFFFF',
          },
        ]}>
        <Upload
          size={RFValue(24)}
          color={colors.textSecondary}
          strokeWidth={1.5}
          style={styles.icon}
        />
        <Text style={[styles.ctaText, { color: colors.textSecondary }]}>
          {instructions}
        </Text>
        <Text style={[styles.hintText, { color: colors.textMuted }]}>{hint}</Text>
      </TouchableOpacity>

      {file ? (
        <View style={styles.fileRow}>
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: colors.textPrimary || '#10375C' }]}>
               {typeof file === 'object' ? file.name : file}
            </Text>
            {typeof file === 'object' && file.size && (
              <Text style={[styles.fileSize, { color: colors.textMuted || '#64748B' }]}>
                {file.size}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <X size={RFValue(14)} color={colors.textMuted || '#94A3B8'} />
          </TouchableOpacity>
        </View>
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: RFValue(20),
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    marginBottom: 2,
  },
  fileSize: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  removeBtn: {
    padding: 4,
  },
});

export default UploadField;
