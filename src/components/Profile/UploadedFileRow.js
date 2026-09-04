/**
 * UploadedFileRow — one queued photo in the Upload New Work form.
 *
 * Props:
 *   uri       string
 *   name      string
 *   size      number|null  bytes; the size line hides when the picker did not
 *                          report one, rather than showing "0 B"
 *   onRemove  function
 */
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Trash2 } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const formatSize = (bytes) => {
  if (bytes == null || Number.isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const UploadedFileRow = ({ uri, name, size, onRemove }) => {
  const readableSize = formatSize(size);

  return (
    <View style={styles.row}>
      <Image source={{ uri }} style={styles.thumb} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {!!readableSize && <Text style={styles.size}>{readableSize}</Text>}
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        activeOpacity={0.7}
        hitSlop={8}
        onPress={onRemove}>
        <Trash2 size={RFValue(13)} color="#EF4444" strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: RFValue(8),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  thumb: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#2E2E2E',
  },
  size: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  deleteBtn: {
    width: RFValue(22),
    height: RFValue(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UploadedFileRow;
