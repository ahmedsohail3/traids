/**
 * UploadDropzone — the dashed "add photos" panel from the Upload New Work form.
 *
 * The design was drawn for the web and says "drag and drop"; on a phone the
 * panel is simply a large tap target, so the copy says so instead.
 *
 * Props:
 *   title     string
 *   hint      string
 *   disabled  boolean
 *   onPress   function
 */
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { UploadCloud } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const UploadDropzone = ({
  title = 'Tap to add your project photos',
  hint = 'Formats: JPG, PNG, WEBP (Max 5MB each)',
  disabled = false,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.zone, disabled && styles.zoneDisabled]}
    activeOpacity={0.8}
    disabled={disabled}
    onPress={onPress}>
    <View style={styles.iconBg}>
      <UploadCloud size={RFValue(17)} color="#10375C" strokeWidth={1.8} />
    </View>
    <View style={styles.textBlock}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  zone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: RFValue(16),
    alignItems: 'center',
    gap: RFValue(10),
  },
  zoneDisabled: { opacity: 0.5 },
  iconBg: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: RFValue(18),
    backgroundColor: '#E9F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { alignItems: 'center', gap: 4 },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11.5),
    color: '#10375C',
    textAlign: 'center',
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#545454',
    textAlign: 'center',
  },
});

export default UploadDropzone;
