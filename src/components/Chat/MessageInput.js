import {useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {FontFamily} from '~theme/fonts';
import {
  Paperclip,
  Send,
  X,
  FileText,
  File,
  ImageIcon,
} from 'lucide-react-native';
import {Text} from '~components/Common';
import {
  pickImagesFromLibrary,
  pickDocuments,
  afterSheetDismiss,
} from '~utils/filePicker';
import useAlert from '~hooks/useAlert';

// ── Attachment preview chip ───────────────────────────────────────────────────

const isImageType = file => file.type?.startsWith('image/');

const AttachmentChip = ({file, onRemove}) => (
  <View style={styles.chip}>
    {isImageType(file) ? (
      <Image
        source={{uri: file.uri}}
        style={styles.chipImage}
        resizeMode="cover"
      />
    ) : (
      <View style={styles.chipDoc}>
        {file.type === 'application/pdf' ? (
          <FileText size={RFValue(14)} color="#10375C" strokeWidth={1.8} />
        ) : (
          <File size={RFValue(14)} color="#10375C" strokeWidth={1.8} />
        )}
        <Text style={styles.chipName} numberOfLines={1}>
          {file.name}
        </Text>
      </View>
    )}
    <TouchableOpacity style={styles.chipRemove} onPress={onRemove} hitSlop={6}>
      <X size={RFValue(9)} color="#FFFFFF" strokeWidth={3} />
    </TouchableOpacity>
  </View>
);

// ── Main component ────────────────────────────────────────────────────────────

const MessageInput = ({onSend, sendingMessage}) => {
  const {showAlert} = useAlert();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [sheetVisible, setSheetVisible] = useState(false);

  const removeAttachment = idx =>
    setAttachments(prev => prev.filter((_, i) => i !== idx));

  // The sheet is still dismissing when this runs; presenting the picker before
  // it finishes fails silently on iOS, which is why attachments would not open
  // on release builds. Failures now surface instead of looking unresponsive.
  const runPicker = async pick => {
    setSheetVisible(false);
    await afterSheetDismiss();
    try {
      const files = await pick();
      if (files.length) setAttachments(prev => [...prev, ...files]);
    } catch (err) {
      showAlert({
        title: 'Could Not Open',
        message: err?.message ?? 'Something went wrong opening the picker.',
        type: 'error',
      });
    }
  };

  const handlePickImages = () =>
    runPicker(() => pickImagesFromLibrary({ mediaType: 'mixed', selectionLimit: 5 }));

  const handlePickDocuments = () => runPicker(() => pickDocuments());

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || sendingMessage) return;
    onSend({text: trimmed, attachments});
    setText('');
    setAttachments([]);
  };

  const canSend = text.trim().length > 0 || attachments.length > 0;

  return (
    <View>
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.previewRow}
          contentContainerStyle={styles.previewContent}>
          {attachments.map((file, idx) => (
            <AttachmentChip
              key={idx}
              file={file}
              onRemove={() => removeAttachment(idx)}
            />
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setSheetVisible(true)}>
            <Paperclip size={RFValue(14)} color="#10375C" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type here..."
            placeholderTextColor="#10375C"
            value={text}
            onChangeText={setText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, canSend && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={!canSend || sendingMessage}>
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={RFValue(15)} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Attachment type picker sheet */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setSheetVisible(false)}>
          <View style={styles.sheetOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHandle} />

                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={handlePickImages}>
                  <View
                    style={[styles.sheetIcon, {backgroundColor: '#EFF6FF'}]}>
                    <ImageIcon
                      size={RFValue(18)}
                      color="#3B82F6"
                      strokeWidth={1.8}
                    />
                  </View>
                  <View>
                    <Text style={styles.sheetLabel}>Photo</Text>
                    <Text style={styles.sheetSub}>Choose from gallery</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={handlePickDocuments}>
                  <View
                    style={[styles.sheetIcon, {backgroundColor: '#F0FDF4'}]}>
                    <FileText
                      size={RFValue(18)}
                      color="#22C55E"
                      strokeWidth={1.8}
                    />
                  </View>
                  <View>
                    <Text style={styles.sheetLabel}>Document</Text>
                    <Text style={styles.sheetSub}>PDF, DOC, XLS and more</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetCancel}
                  onPress={() => setSheetVisible(false)}>
                  <Text style={styles.sheetCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Attachment preview row ──────────────────────────────────────────────────
  previewRow: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    maxHeight: 90,
  },
  previewContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  chip: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'visible',
    marginRight: 4,
  },
  chipImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  chipDoc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 64,
    maxWidth: 140,
  },
  chipName: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#10375C',
    flexShrink: 1,
    maxWidth: 90,
  },
  chipRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Input bar ───────────────────────────────────────────────────────────────
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#94A3B8',
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    paddingRight: 14,
    paddingVertical: 8,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E2E2E',
  },
  sendBtnActive: {
    backgroundColor: '#10375C',
  },

  // ── Attachment picker sheet ─────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 2,
  },
  sheetSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  sheetCancel: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#e8ebed',
    borderRadius: 12,
  },
  sheetCancelText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#505c6f',
  },
});

export default MessageInput;
