/**
 * AttachmentThumb — tappable preview tile for one remote file.
 *
 * Images get a real thumbnail; everything else (and any image that fails to
 * load) gets an icon tile with its extension, so a .docx no longer renders as a
 * broken image the way a bare <Image> would.
 */
import { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { File, FileText, FileSpreadsheet } from 'lucide-react-native';
import Text from './Text';
import { FontFamily } from '~theme/fonts';
import { fileKindFromUrl, extensionFromUrl } from '~utils/fileUrl';

const KIND_ICON = {
  pdf:   FileText,
  doc:   FileText,
  sheet: FileSpreadsheet,
  file:  File,
  image: File,
};

const AttachmentThumb = ({ uri, size = 120, onPress, style }) => {
  const [errored, setErrored] = useState(false);
  const [loading, setLoading] = useState(true);

  const kind      = fileKindFromUrl(uri);
  const showImage = kind === 'image' && !errored;
  const Icon      = KIND_ICON[kind] ?? File;

  const shape = { width: size, height: size };

  return (
    <TouchableOpacity
      style={[styles.tile, shape, style]}
      onPress={() => onPress?.(uri)}
      activeOpacity={0.85}
      accessibilityRole="imagebutton"
      accessibilityLabel={`Open ${extensionFromUrl(uri)} attachment`}>
      {showImage ? (
        <>
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="cover"
            onLoadEnd={() => setLoading(false)}
            onError={() => { setErrored(true); setLoading(false); }}
          />
          {loading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="small" color="#94A3B8" />
            </View>
          )}
        </>
      ) : (
        <View style={styles.fileTile}>
          <Icon size={RFValue(20)} color="#10375C" strokeWidth={1.6} />
          <Text style={styles.ext} numberOfLines={1}>{extensionFromUrl(uri)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: { width: '100%', height: '100%' },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ext: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8),
    color: '#64748B',
    letterSpacing: 0.5,
  },
});

export default AttachmentThumb;
