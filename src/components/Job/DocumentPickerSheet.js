import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { FileText, File } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';

/**
 * DocumentPickerSheet — bottom sheet offering "Photo / Image" vs "Document" picker.
 * Shared between PostJobScreen and SendOfferScreen.
 *
 * Props:
 *   visible        boolean
 *   onClose        function
 *   onPickImage    function
 *   onPickDocument function
 */
const DocumentPickerSheet = ({ visible, onClose, onPickImage, onPickDocument }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <TouchableOpacity style={styles.sheetOption} onPress={onPickImage}>
          <View style={[styles.sheetIcon, { backgroundColor: '#EFF6FF' }]}>
            <FileText size={RFValue(18)} color="#3B82F6" strokeWidth={1.8} />
          </View>
          <View>
            <Text style={styles.sheetLabel}>Photo / Image</Text>
            <Text style={styles.sheetSub}>Choose from gallery</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sheetOption} onPress={onPickDocument}>
          <View style={[styles.sheetIcon, { backgroundColor: '#F0FDF4' }]}>
            <File size={RFValue(18)} color="#22C55E" strokeWidth={1.8} />
          </View>
          <View>
            <Text style={styles.sheetLabel}>Document</Text>
            <Text style={styles.sheetSub}>PDF, DOC, DOCX and more</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sheetCancel} onPress={onClose}>
          <Text style={styles.sheetCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingBottom: 32, paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 20,
  },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  sheetIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sheetLabel: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: NAVY, marginBottom: 2 },
  sheetSub:   { fontFamily: FontFamily.regular,  fontSize: RFValue(9.5), color: '#94A3B8' },
  sheetCancel: { marginTop: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12 },
  sheetCancelText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11), color: '#64748B' },
});

export default DocumentPickerSheet;
