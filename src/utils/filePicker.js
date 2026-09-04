import {
  pick,
  keepLocalCopy,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export { types as documentTypes };

// ── Sheet dismissal ────────────────────────────────────────────────────────────

// iOS refuses to present a view controller from one that is still presenting,
// and the attempt fails *silently* — the picker simply never appears. Every
// picker here is launched from an action sheet or RN Modal that is still
// animating away when the handler runs, so wait for that to finish first.
// Release builds are faster than debug, which is why this shows up on TestFlight
// and not in development.
const SHEET_DISMISS_MS = 350;

export const afterSheetDismiss = () =>
  new Promise((resolve) => setTimeout(resolve, SHEET_DISMISS_MS));

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

// Works around a bug in react-native-image-picker 8.2.1 (latest) that stops the
// iOS gallery from opening at all.
//
// ImagePickerUtils.mm:54 branches on `if (options[@"includeExtra"])` — testing
// the NSNumber *pointer* rather than its value, so JS `false` (bridged as @NO,
// non-nil) still takes the truthy branch and builds the configuration with
// `initWithPhotoLibrary:`, a mode that requires photo-library authorization.
// Every other site in that file reads `boolValue` correctly, including the one
// that decides whether to ask for permission — so the picker gets configured in
// a mode needing access that is never requested, and silently fails to present.
//
// Passing true makes the two agree: the library then does request authorization
// (ImagePickerManager.mm:86), which is what `initWithPhotoLibrary:` needs. The
// extra asset metadata this returns is unused and harmless.
//
// Android is unaffected — it uses the permission-free system photo picker — so
// this stays scoped to iOS. Remove once the library fixes the missing boolValue.
const IOS_GALLERY_WORKAROUND = Platform.OS === 'ios' ? { includeExtra: true } : {};

const normalizeAsset = (asset) => ({
  uri: asset.uri,
  type: asset.type ?? 'image/jpeg',
  name: asset.fileName ?? `photo_${Date.now()}.jpg`,
  // Bytes, for callers that show a file size or enforce an upload cap. The
  // library omits it for some sources, so treat null as "unknown" rather than
  // as zero. buildFormData ignores it.
  size: asset.fileSize ?? null,
});

// Capture/pick options for profile photos. Square-ish and modest — the avatar
// is rendered small, and full-res camera output would blow past the 5MB cap.
export const PROFILE_IMAGE_OPTIONS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
};

// Capture/pick options for document scans. Full-res camera output routinely
// blows past the 5MB upload cap, so bound the long edge before compressing.
export const DOCUMENT_IMAGE_OPTIONS = {
  maxWidth: 2400,
  maxHeight: 2400,
  quality: 0.8,
};

// The library reports failures as an errorCode on the response rather than by
// throwing. Collapsing those to null — as this used to — makes a broken picker
// indistinguishable from the user tapping Cancel: the screen just does nothing,
// with no way to tell why. Cancel still resolves null; anything else throws.
const rejectOnError = (response) => {
  if (response.didCancel) return null;
  if (response.errorCode) {
    throw new Error(
      response.errorMessage ||
        `Could not open the picker (${response.errorCode}).`,
    );
  }
  const asset = response.assets?.[0];
  return asset ? normalizeAsset(asset) : null;
};

export const pickImageFromLibrary = (options = {}) =>
  new Promise((resolve, reject) => {
    try {
      launchImageLibrary({ ...IMAGE_OPTIONS, ...IOS_GALLERY_WORKAROUND, ...options }, (response) => {
        try {
          resolve(rejectOnError(response));
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      // A missing/unlinked native module throws here rather than calling back.
      reject(err);
    }
  });

/**
 * react-native-image-picker does not itself need android.permission.CAMERA, but
 * once an app *declares* it, Android fails ACTION_IMAGE_CAPTURE with a
 * SecurityException unless it has also been granted. The library only guards
 * against that — `isCameraPermissionFulfilled` returns an error rather than
 * prompting — so we have to request it ourselves, or "Take Photo" does nothing.
 *
 * iOS needs no equivalent: the system prompts on first camera use, backed by
 * NSCameraUsageDescription in Info.plist.
 */
const ensureCameraPermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const already = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (already) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Access',
        message: 'Traids needs your camera so you can take photos of documents and your profile picture.',
        buttonPositive: 'Allow',
        buttonNegative: 'Not now',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

/**
 * Multi-select variant for chat attachments. Returns an array (empty on cancel).
 * Lives here rather than in the chat component so it inherits the same iOS
 * workaround and error handling as every other picker in the app.
 */
export const pickImagesFromLibrary = (options = {}) =>
  new Promise((resolve, reject) => {
    try {
      launchImageLibrary(
        { ...IMAGE_OPTIONS, ...IOS_GALLERY_WORKAROUND, ...options },
        (response) => {
          try {
            if (response.didCancel) return resolve([]);
            if (response.errorCode) {
              throw new Error(
                response.errorMessage ||
                  `Could not open the picker (${response.errorCode}).`,
              );
            }
            resolve((response.assets ?? []).map(normalizeAsset));
          } catch (err) {
            reject(err);
          }
        },
      );
    } catch (err) {
      reject(err);
    }
  });

/** Multi-select document variant. Returns an array (empty on cancel). */
export const pickDocuments = async (allowedTypes = [types.allFiles]) => {
  try {
    const results = await pick({
      allowMultiSelection: true,
      type: allowedTypes,
    });

    const copies = await keepLocalCopy({
      files: results.map((r) => ({ uri: r.uri, fileName: r.name ?? 'file' })),
      destination: 'cachesDirectory',
    });

    return copies
      .map((copy, i) =>
        copy.status !== 'error'
          ? {
              uri: copy.localUri,
              type: results[i].type ?? 'application/octet-stream',
              name: results[i].name ?? 'document',
            }
          : null,
      )
      .filter(Boolean);
  } catch (err) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return [];
    throw err;
  }
};

export const pickImageFromCamera = async (options = {}) => {
  // Denial resolves null, the same as cancelling — both mean "no photo".
  const permitted = await ensureCameraPermission();
  if (!permitted) return null;

  return new Promise((resolve, reject) => {
    try {
      launchCamera({ ...IMAGE_OPTIONS, saveToPhotos: false, ...options }, (response) => {
        try {
          resolve(rejectOnError(response));
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};
