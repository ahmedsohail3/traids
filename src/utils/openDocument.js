import { Linking } from 'react-native';

/**
 * openDocument
 *
 * Hands a remote document (S3 URL) to the OS, which previews it and offers the
 * usual "save / share" actions. This is how the rest of the app opens documents
 * (job details, booking details) — no native download library involved.
 *
 * Throws a message suitable for showing in an alert, so callers can
 * `try { await openDocument(url) } catch (err) { showAlert({ message: err.message }) }`.
 *
 * @param {string|null} url — document URL
 * @returns {Promise<void>}
 */
export const openDocument = async (url) => {
  if (!url) throw new Error('This document is not available to download.');

  // canOpenURL is the cheap guard against malformed/unsupported URLs; a failure
  // inside openURL (no browser, cancelled intent) still lands in the catch.
  const supported = await Linking.canOpenURL(url).catch(() => false);
  if (!supported) throw new Error('No app on this device can open this document.');

  try {
    await Linking.openURL(url);
  } catch {
    throw new Error('Could not open this document. Please try again.');
  }
};

export default openDocument;
