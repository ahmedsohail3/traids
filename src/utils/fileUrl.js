/**
 * Helpers for classifying a remote file from its URL.
 *
 * S3 links carry no content-type until they're fetched, so the extension is all
 * we have to go on. Query strings are tolerated because presigned URLs append
 * them, and `filenameFromUrl` strips them before reading the name.
 */

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|bmp|heic|heif|svg)(\?.*)?$/i;
const PDF_EXTENSIONS   = /\.pdf(\?.*)?$/i;
const DOC_EXTENSIONS   = /\.(doc|docx|odt|rtf|txt|pages)(\?.*)?$/i;
const SHEET_EXTENSIONS = /\.(xls|xlsx|csv|ods|numbers)(\?.*)?$/i;

export const isImageUrl = (url) => typeof url === 'string' && IMAGE_EXTENSIONS.test(url);
export const isPdfUrl   = (url) => typeof url === 'string' && PDF_EXTENSIONS.test(url);

/**
 * Coarse file family, used to pick an icon and decide whether we can render a
 * preview at all: 'image' | 'pdf' | 'doc' | 'sheet' | 'file'.
 */
export const fileKindFromUrl = (url) => {
  if (typeof url !== 'string') return 'file';
  if (IMAGE_EXTENSIONS.test(url)) return 'image';
  if (PDF_EXTENSIONS.test(url))   return 'pdf';
  if (DOC_EXTENSIONS.test(url))   return 'doc';
  if (SHEET_EXTENSIONS.test(url)) return 'sheet';
  return 'file';
};

/** Last path segment, minus any query string: "site-photo.png". */
export const filenameFromUrl = (url) => {
  if (typeof url !== 'string') return 'file';
  try {
    const parts = decodeURIComponent(url.split('?')[0]).split('/');
    return parts[parts.length - 1] || 'file';
  } catch {
    return 'file';
  }
};

/** Uppercase extension for a badge: "PNG", "DOCX". */
export const extensionFromUrl = (url) => {
  const name = filenameFromUrl(url);
  const dot  = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : 'FILE';
};
