import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Upload, X, CheckCircle2 } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';
const ORANGE = '#F2A154';
const BORDER = '#E2E8F0';

const UploadArea = ({ file, uploadProgress, onPress }) => (
  <View style={styles.container}>
    {!file ? (
      <TouchableOpacity
        style={[styles.uploadArea]}
        activeOpacity={0.8}
        onPress={onPress}>
        <View style={styles.uploadIconWrap}>
          <Upload size={RFValue(18)} color={NAVY} strokeWidth={1.5} />
        </View>
        <Text style={styles.uploadText}>Click to upload Qualifications</Text>
        <Text style={styles.uploadSub}>DOC, DOCX or PDF (max. 10MB)</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.uploadedBox}>
        <View style={styles.uploadedContent}>
          <View style={styles.fileInfo}>
            <Text style={styles.uploadedName} numberOfLines={1}>{file.name}</Text>
            {uploadProgress != null && uploadProgress < 100 ? (
              <View style={styles.uploadingMeta}>
                <Text style={styles.uploadingPct}>{uploadProgress}% Uploading</Text>
                <Text style={styles.uploadingSize}>{file.size || '9.77 MB'}</Text>
              </View>
            ) : (
              <Text style={styles.uploadComplete}>Upload complete</Text>
            )}
          </View>
          
          {uploadProgress != null && uploadProgress < 100 ? (
            <TouchableOpacity onPress={() => {/* Cancel logic */}} style={styles.cancelBtn}>
              <X size={RFValue(16)} color="#94A3B8" />
            </TouchableOpacity>
          ) : (
            <CheckCircle2 size={RFValue(18)} color="#22C55E" />
          )}
        </View>
        
        {uploadProgress != null && uploadProgress < 100 && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
        )}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: RFValue(28),
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    minHeight: 120,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11), color: NAVY },
  uploadSub: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#94A3B8', marginTop: 4 },
  
  uploadedBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  uploadedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfo: { flex: 1, paddingRight: 10 },
  uploadedName: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11), color: NAVY, marginBottom: 4 },
  uploadingMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  uploadingPct: { fontFamily: FontFamily.semiBold, fontSize: RFValue(10), color: NAVY },
  uploadingSize: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B' },
  uploadComplete: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#22C55E' },
  cancelBtn: { padding: 4 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F1F5F9',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: NAVY },
});

export default UploadArea;
