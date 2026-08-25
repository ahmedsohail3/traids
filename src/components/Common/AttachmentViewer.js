/**
 * AttachmentViewer — full-screen, swipeable viewer for a set of remote files.
 *
 * Images are shown enlarged and fitted to the screen. Anything the app can't
 * render inline (doc, docx, xlsx, pdf…) gets a file card instead, since there is
 * no native document renderer in this project — those open in the OS handler.
 *
 * Opening goes through `openDocument`, which hands the URL to the OS — the file
 * is shown by the device's own viewer or browser, which is where saving and
 * sharing happen. Nothing is downloaded inside the app, so the affordance is an
 * "open externally" one rather than a download.
 *
 * Props:
 *   visible       bool
 *   items         array of URL strings
 *   initialIndex  index to open on (default 0)
 *   title         optional heading, e.g. "Work Examples"
 *   onClose       () => void
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import { X, ExternalLink, File, FileText, FileSpreadsheet, ImageOff } from 'lucide-react-native';
import Text from './Text';
import { FontFamily } from '~theme/fonts';
import useAlert from '~hooks/useAlert';
import { openDocument } from '~utils/openDocument';
import { fileKindFromUrl, filenameFromUrl, extensionFromUrl } from '~utils/fileUrl';

const KIND_ICON = {
  pdf:   FileText,
  doc:   FileText,
  sheet: FileSpreadsheet,
  file:  File,
};

const KIND_HINT = {
  pdf:   'PDFs open in your device viewer.',
  doc:   'Documents open in your device viewer.',
  sheet: 'Spreadsheets open in your device viewer.',
  file:  'This file opens in your device viewer.',
};

// ── One page ──────────────────────────────────────────────────────────────────

const ViewerPage = ({ uri, width, onOpen }) => {
  const [errored, setErrored] = useState(false);
  const [loading, setLoading] = useState(true);

  const kind = fileKindFromUrl(uri);

  if (kind === 'image' && !errored) {
    return (
      <View style={[styles.page, { width }]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          onLoadEnd={() => setLoading(false)}
          onError={() => { setErrored(true); setLoading(false); }}
        />
        {loading && (
          <View style={styles.pageLoader}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  }

  // Non-image, or an image whose URL didn't load.
  const Icon = errored ? ImageOff : (KIND_ICON[kind] ?? File);
  const hint = errored
    ? 'This image could not be loaded.'
    : (KIND_HINT[kind] ?? KIND_HINT.file);

  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.fileCard}>
        <View style={styles.fileIconWrap}>
          <Icon size={RFValue(34)} color="#F2A154" strokeWidth={1.4} />
        </View>
        <Text style={styles.fileName} numberOfLines={2}>{filenameFromUrl(uri)}</Text>
        <View style={styles.extBadge}>
          <Text style={styles.extBadgeText}>{extensionFromUrl(uri)}</Text>
        </View>
        <Text style={styles.fileHint}>{hint}</Text>

        <TouchableOpacity style={styles.openBtn} onPress={() => onOpen(uri)} activeOpacity={0.85}>
          <ExternalLink size={RFValue(13)} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.openBtnText}>Open file</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Viewer ────────────────────────────────────────────────────────────────────

const AttachmentViewer = ({ visible, items = [], initialIndex = 0, title, onClose }) => {
  const { width }   = useWindowDimensions();
  const insets      = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const listRef     = useRef(null);
  const [index, setIndex] = useState(initialIndex);

  // Re-seat on open: the same viewer instance serves every thumbnail, so the
  // starting page changes between openings.
  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  const handleOpen = useCallback(async (uri) => {
    try {
      await openDocument(uri);
    } catch (err) {
      showAlert({
        title: 'Could Not Open File',
        message: err?.message ?? 'Could not open this file.',
        type: 'error',
      });
    }
  }, [showAlert]);

  const handleMomentumEnd = useCallback(({ nativeEvent }) => {
    const next = Math.round(nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(next, items.length - 1)));
  }, [width, items.length]);

  // Fixed page width means we can hand VirtualizedList the geometry outright,
  // so initialScrollIndex lands correctly without a measure pass.
  const getItemLayout = useCallback(
    (_data, i) => ({ length: width, offset: width * i, index: i }),
    [width],
  );

  const current = items[index];

  if (!items.length) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.iconBtn}>
            <X size={RFValue(18)} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.topMeta}>
            {!!title && <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>}
            {items.length > 1 && (
              <Text style={styles.topCount}>{index + 1} of {items.length}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleOpen(current)}
            hitSlop={10}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Open this file outside the app">
            <ExternalLink size={RFValue(17)} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Pager */}
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          renderItem={({ item }) => (
            <ViewerPage uri={item} width={width} onOpen={handleOpen} />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={handleMomentumEnd}
        />

        {/* Caption */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.caption} numberOfLines={1}>{filenameFromUrl(current)}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08192B' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#10375C',
  },
  iconBtn: {
    width: RFValue(30),
    height: RFValue(30),
    borderRadius: RFValue(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  topMeta: { flex: 1, alignItems: 'center' },
  topTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#FFFFFF',
  },
  topCount: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  pageLoader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  fileCard: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  fileIconWrap: {
    width: RFValue(76),
    height: RFValue(76),
    borderRadius: RFValue(38),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242,161,84,0.15)',
    marginBottom: 4,
  },
  fileName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  extBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  extBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8.5),
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  fileHint: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2A154',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginTop: 8,
  },
  openBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#FFFFFF',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#10375C',
  },
  caption: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: 'rgba(255,255,255,0.75)',
  },
});

export default AttachmentViewer;
