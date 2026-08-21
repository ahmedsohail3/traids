import { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  Platform,
  ActionSheetIOS,
  Pressable,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Camera, ImageIcon, X, Pencil } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import {
  pickImageFromLibrary,
  pickImageFromCamera,
  PROFILE_IMAGE_OPTIONS,
} from '~utils/filePicker';

// ── Action Sheet (cross-platform) ──────────────────────────────────────────────

const PickerSheet = ({ visible, onClose, onGallery, onCamera, onRemove, showRemove, colors }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}>
    <Pressable style={styles.sheetOverlay} onPress={onClose}>
      <Pressable style={[styles.sheetContainer, { backgroundColor: colors.modalBackground }]}>

        <TouchableOpacity
          style={[styles.sheetOption, { borderBottomColor: colors.border }]}
          onPress={() => { onClose(); onCamera(); }}>
          <Camera size={RFValue(18)} color={colors.textPrimary} strokeWidth={1.5} />
          <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sheetOption, { borderBottomColor: colors.border }]}
          onPress={() => { onClose(); onGallery(); }}>
          <ImageIcon size={RFValue(18)} color={colors.textPrimary} strokeWidth={1.5} />
          <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>Choose from Gallery</Text>
        </TouchableOpacity>

        {showRemove && (
          <TouchableOpacity
            style={[styles.sheetOption, { borderBottomColor: colors.border }]}
            onPress={() => { onClose(); onRemove(); }}>
            <X size={RFValue(18)} color={colors.error} strokeWidth={1.5} />
            <Text style={[styles.sheetOptionText, { color: colors.error }]}>Remove Photo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.sheetCancel, { borderTopColor: colors.border }]}
          onPress={onClose}>
          <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>

      </Pressable>
    </Pressable>
  </Modal>
);

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * ImagePickerField
 *
 * Props:
 *   label      – field label (append * for required marker)
 *   hint       – helper text under the title (default: JPG or PNG, max 5MB)
 *   value      – { uri, type, name } | null
 *   onChange   – (image: { uri, type, name } | null) => void
 *   error      – validation error string
 *   size       – avatar diameter in px (default: 100)
 *   shape      – 'circle' | 'square' (default: 'circle')
 *   showCamera – show camera option in picker sheet (default: true)
 *   disabled   – disables interactions
 *   style      – outer container style override
 */
const ImagePickerField = ({
  label,
  hint = 'JPG or PNG, max 5MB',
  value,
  onChange,
  error,
  size = 100,
  shape = 'circle',
  showCamera = true,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);

  const borderRadius = shape === 'circle' ? size / 2 : 12;

  const handleGallery = useCallback(async () => {
    try {
      const image = await pickImageFromLibrary(PROFILE_IMAGE_OPTIONS);
      if (image) onChange?.(image);
    } catch { /* silent */ }
  }, [onChange]);

  const handleCamera = useCallback(async () => {
    try {
      const image = await pickImageFromCamera(PROFILE_IMAGE_OPTIONS);
      if (image) onChange?.(image);
    } catch { /* silent */ }
  }, [onChange]);

  const handleRemove = useCallback(() => onChange?.(null), [onChange]);

  const openPicker = useCallback(() => {
    if (disabled) return;
    // Nothing to choose between without the camera — go straight to the library.
    if (!showCamera) return handleGallery();

    if (Platform.OS === 'ios') {
      const options = ['Take Photo', 'Choose from Gallery'];
      if (value) options.push('Remove Photo');
      options.push('Cancel');
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: value ? 2 : undefined },
        (index) => {
          if (index === 0) handleCamera();
          else if (index === 1) handleGallery();
          else if (index === 2 && value) handleRemove();
        },
      );
    } else {
      setSheetVisible(true);
    }
  }, [disabled, showCamera, value, handleCamera, handleGallery, handleRemove]);

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

      {/* Avatar */}
      <View style={styles.avatarRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openPicker}
          disabled={disabled}
          style={[
            styles.avatarWrapper,
            {
              width: size,
              height: size,
              borderRadius,
              borderColor: error ? colors.error : colors.border,
              backgroundColor: colors.inputDisabled,
            },
          ]}>

          {value?.uri ? (
            <Image
              source={{ uri: value.uri }}
              style={[styles.avatar, { width: size, height: size, borderRadius }]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <ImageIcon size={RFValue(26)} color={colors.textMuted} strokeWidth={1.2} />
            </View>
          )}

          {/* Edit badge */}
          {!disabled && (
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Pencil size={RFValue(9)} color="#FFFFFF" strokeWidth={2} />
            </View>
          )}
        </TouchableOpacity>

        {/* Inline helper text */}
        <View style={styles.helperCol}>
          <Text style={[styles.helperTitle, { color: colors.textPrimary }]}>
            {value ? 'Photo selected' : 'Upload a photo'}
          </Text>
          <Text style={[styles.helperSub, { color: colors.textMuted }]}>
            {hint}
          </Text>
          {value && (
            <TouchableOpacity onPress={handleRemove} disabled={disabled} style={styles.removeBtn}>
              <X size={RFValue(11)} color={colors.error} strokeWidth={2} />
              <Text style={[styles.removeText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error */}
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}

      {/* Android/non-iOS action sheet */}
      {Platform.OS !== 'ios' && (
        <PickerSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          onGallery={handleGallery}
          onCamera={handleCamera}
          onRemove={handleRemove}
          showRemove={!!value}
          colors={colors}
        />
      )}

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
    marginBottom: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    borderWidth: 1,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    position: 'absolute',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: RFValue(20),
    height: RFValue(20),
    borderRadius: RFValue(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  helperCol: {
    flex: 1,
    gap: 4,
  },
  helperTitle: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
  },
  helperSub: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  removeText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.medium,
  },
  errorText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    marginTop: 6,
  },

  // ── Android picker sheet ───────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetOptionText: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.medium,
  },
  sheetCancel: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
  },
});

export default ImagePickerField;
