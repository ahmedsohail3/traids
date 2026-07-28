import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { FileText, File, X } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';
const BORDER = '#E2E8F0';

/**
 * DocumentChip — single picked-document row with a remove button.
 * Shared between PostJobScreen and SendOfferScreen.
 */
const DocumentChip = ({ doc, onRemove }) => {
  const isPdf   = doc.type === 'application/pdf' || doc.name?.endsWith('.pdf');
  const isImage = doc.type?.startsWith('image/');
  const Icon    = isPdf || isImage ? FileText : File;

  return (
    <View style={styles.docChip}>
      <Icon size={RFValue(13)} color={NAVY} strokeWidth={1.8} />
      <Text style={styles.docChipName} numberOfLines={1}>{doc.name ?? 'document'}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.docChipRemove}>
        <X size={RFValue(12)} color="#94A3B8" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  docChipName: { flex: 1, fontFamily: FontFamily.medium, fontSize: RFValue(10), color: NAVY },
  docChipRemove: { padding: 2 },
});

export default DocumentChip;
