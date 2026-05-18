import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Upload, FileText, X } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { pickDocument } from '~utils/filePicker';

// ── Helpers ────────────────────────────────────────────────────────────────────

const getFileIcon = (type = '') => {
  if (type.includes('pdf')) return { label: 'PDF', bg: '#FEE2E2', text: '#DC2626' };
  if (type.includes('image')) return { label: 'IMG', bg: '#DBEAFE', text: '#2563EB' };
  return { label: 'DOC', bg: '#F3F4F6', text: '#6B7280' };
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * DocumentPickerField
 *
 * Props:
 *   label         – field label (append * for required marker)
 *   hint          – helper text shown inside upload box
 *   value         – { uri, type, name } | null
 *   onChange      – (file: { uri, type, name } | null) => void
 *   error         – validation error string
 *   allowedTypes  – array of @react-native-documents/picker types (default: pdf + images)
 *   disabled      – disables interactions
 *   style         – outer container style override
 */
const DocumentPickerField = ({
  label,
  hint = 'PDF, JPG or PNG (max. 5MB)',
  value,
  onChange,
  error,
  allowedTypes,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  const handlePick = useCallback(async () => {
    if (disabled) return;
    try {
      const file = await pickDocument(allowedTypes);
      if (file) onChange?.(file);
    } catch {
      // User-facing errors handled by parent via error prop
    }
  }, [disabled, allowedTypes, onChange]);

  const handleRemove = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  const badge = value ? getFileIcon(value.type) : null;

  return (
    <View style={[styles.container, style]}>

      {/* Label */}
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

      {/* Upload box — hidden once a file is chosen */}
      {!value ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePick}
          disabled={disabled}
          style={[
            styles.box,
            {
              borderColor: error ? colors.error : colors.border,
              backgroundColor: disabled ? colors.inputDisabled : '#FFFFFF',
            },
          ]}>
          <Upload size={RFValue(22)} color={colors.textSecondary} strokeWidth={1.5} style={styles.uploadIcon} />
          <Text style={[styles.cta, { color: colors.textSecondary }]}>Click to upload</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
        </TouchableOpacity>
      ) : (

        /* File preview row */
        <View style={[styles.fileRow, { borderColor: colors.border }]}>
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <FileText size={RFValue(13)} color={badge.text} strokeWidth={1.5} />
            <Text style={[styles.typeLabel, { color: badge.text }]}>{badge.label}</Text>
          </View>

          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="middle">
              {value.name}
            </Text>
            <Text style={[styles.fileType, { color: colors.textMuted }]}>{value.type}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handlePick} disabled={disabled} hitSlop={8} style={styles.actionBtn}>
              <Text style={[styles.replaceText, { color: colors.primary }]}>Replace</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRemove} disabled={disabled} hitSlop={8} style={styles.actionBtn}>
              <X size={RFValue(14)} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Error */}
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
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
    borderRadius: 10,
    paddingVertical: RFValue(20),
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    marginBottom: 8,
  },
  cta: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.medium,
    marginBottom: 4,
  },
  hint: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  typeBadge: {
    width: RFValue(40),
    height: RFValue(40),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  typeLabel: {
    fontSize: RFValue(7.5),
    fontFamily: FontFamily.bold,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.semiBold,
    marginBottom: 2,
  },
  fileType: {
    fontSize: RFValue(9),
    fontFamily: FontFamily.regular,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  replaceText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.medium,
  },
  errorText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    marginTop: 6,
  },
});

export default DocumentPickerField;
