import {RFValue} from "react-native-responsive-fontsize";
import {FontFamily} from "./fonts";

export const Typography = {
  // ===== HEADINGS =====
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(18),
    lineHeight: RFValue(24),
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(14),
    lineHeight: RFValue(24),
  },

  // ===== BODY =====
  body: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    lineHeight: RFValue(16),
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
  },

  // ===== META =====
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    lineHeight: RFValue(16),
  },

  // ===== ACTIONS =====
  button: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(13),
    lineHeight: RFValue(20),
  },
  link: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(13),
    lineHeight: RFValue(18),
  },
};
