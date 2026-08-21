import {
  pick,
  keepLocalCopy,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export { types as documentTypes };

// ── Document Picker ────────────────────────────────────────────────────────────

export const pickDocument = async (allowedTypes = [types.pdf, types.images]) => {
  try {
    const [result] = await pick({ type: allowedTypes });

    // Copy the file to the app's cache so we have a stable local URI
    const [copy] = await keepLocalCopy({
      files: [{ uri: result.uri, fileName: result.name ?? 'document' }],
      destination: 'cachesDirectory',
    });

    if (copy.status === 'error') throw new Error(copy.copyError ?? 'Failed to copy file');

    return {
      uri: copy.localUri,
      type: result.type ?? 'application/octet-stream',
      name: result.name ?? 'document',
    };
  } catch (err) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return null;
    throw err;
  }
};

// ── Image Picker ───────────────────────────────────────────────────────────────

const IMAGE_OPTIONS = {
  mediaType: 'photo',
  quality: 0.85,
  selectionLimit: 1,
  includeBase64: false,
};

const normalizeAsset = (asset) => ({
  uri: asset.uri,
  type: asset.type ?? 'image/jpeg',
  name: asset.fileName ?? `photo_${Date.now()}.jpg`,
});

// Capture/pick options for document scans. Full-res camera output routinely
// blows past the 5MB upload cap, so bound the long edge before compressing.
export const DOCUMENT_IMAGE_OPTIONS = {
  maxWidth: 2400,
  maxHeight: 2400,
  quality: 0.8,
};

export const pickImageFromLibrary = (options = {}) =>
  new Promise((resolve) => {
    launchImageLibrary({ ...IMAGE_OPTIONS, ...options }, (response) => {
      if (response.didCancel || response.errorCode) return resolve(null);
      const asset = response.assets?.[0];
      resolve(asset ? normalizeAsset(asset) : null);
    });
  });

export const pickImageFromCamera = (options = {}) =>
  new Promise((resolve) => {
    launchCamera({ ...IMAGE_OPTIONS, saveToPhotos: false, ...options }, (response) => {
      if (response.didCancel || response.errorCode) return resolve(null);
      const asset = response.assets?.[0];
      resolve(asset ? normalizeAsset(asset) : null);
    });
  });
