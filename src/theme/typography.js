import {RFValue} from 'react-native-responsive-fontsize';
import {FontFamily} from './fonts';

/**
 * Variants are declared in unscaled design units, exactly as they come off the
 * Figma spec. `fontSize` / `lineHeight` are put through RFValue at build time,
 * and each variant's lineHeight:fontSize ratio is kept alongside so a caller
 * that overrides fontSize can rescale lineHeight to match (see `lineHeightFor`
 * and its use in components/Common/Text.js).
 */
const VARIANTS = {
  // ===== HEADINGS =====
  screenTitle: {family: FontFamily.bold, size: 18, lineHeight: 24},
  sectionTitle: {family: FontFamily.semiBold, size: 14, lineHeight: 24},

  // ===== BODY =====
  body: {family: FontFamily.regular, size: 11, lineHeight: 16},

  // ===== META =====
  caption: {family: FontFamily.regular, size: 11, lineHeight: 16},

  // ===== ACTIONS =====
  button: {family: FontFamily.medium, size: 13, lineHeight: 20},
};

/** Fallback ratio for text with no variant-specific ratio to borrow. */
export const DEFAULT_LINE_HEIGHT_RATIO = 1.45;

/** Line height that keeps a variant's proportions at any font size. */
export const lineHeightFor = (fontSize, ratio = DEFAULT_LINE_HEIGHT_RATIO) =>
  Math.round(fontSize * ratio);

export const Typography = Object.fromEntries(
  Object.entries(VARIANTS).map(([name, {family, size, lineHeight}]) => [
    name,
    {
      fontFamily: family,
      fontSize: RFValue(size),
      lineHeight: RFValue(lineHeight),
    },
  ]),
);

/** lineHeight:fontSize per variant, e.g. LineHeightRatio.body === 16 / 11. */
export const LineHeightRatio = Object.fromEntries(
  Object.entries(VARIANTS).map(([name, {size, lineHeight}]) => [
    name,
    lineHeight / size,
  ]),
);
