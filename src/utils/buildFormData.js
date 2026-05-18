/**
 * buildFormData
 *
 * Converts plain text fields and file objects into a multipart/form-data payload.
 * Skips any value that is null, undefined, or empty string.
 *
 * @param {Record<string, string>} textFields  — key/value text pairs
 * @param {Record<string, {uri, type?, name?}|null>} fileFields — file descriptors
 * @returns {FormData}
 */
export const buildFormData = (textFields = {}, fileFields = {}) => {
  const fd = new FormData();

  for (const [key, value] of Object.entries(textFields)) {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value));
    }
  }

  for (const [key, file] of Object.entries(fileFields)) {
    if (file?.uri) {
      fd.append(key, {
        uri:  file.uri,
        type: file.type ?? 'application/octet-stream',
        name: file.name ?? `${key}.pdf`,
      });
    }
  }

  return fd;
};
