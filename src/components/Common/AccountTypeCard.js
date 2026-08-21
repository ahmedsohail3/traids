/**
 * AccountTypeCard
 *
 * The role-picker card used wherever the user chooses between Company and
 * Subcontractor — pre-login (LoginAccountTypeScreen) and post-login, when the
 * authenticated user has no account type yet (AccountTypeScreen).
 *
 * `mainColor` tints the top border, icon, title and CTA; `iconBgColor` is the
 * soft tint behind the icon.
 */
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ArrowRight } from 'lucide-react-native';
import Text from './Text';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const AccountTypeCard = ({
  icon: IconComp,
  title,
  description,
  mainColor,
  iconBgColor,
  ctaLabel = 'Get Started',
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border || '#e5e7eb',
          borderTopColor: mainColor,
        },
        style,
      ]}>
      <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
        <IconComp size={RFValue(20)} color={mainColor} strokeWidth={2} />
      </View>
      <Text variant="sectionTitle" style={{ color: mainColor, marginBottom: 8 }}>
        {title}
      </Text>
      <Text
        variant="body"
        style={[styles.cardDesc, { color: colors.textSecondary }]}>
        {description}
      </Text>
      <View style={styles.ctaRow}>
        <Text variant="button" style={[styles.cardCta, { color: mainColor }]}>
          {ctaLabel}
        </Text>
        <ArrowRight
          size={RFValue(12)}
          color={mainColor}
          strokeWidth={2.5}
          style={{ marginLeft: 6 }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 4,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: RFValue(35),
    height: RFValue(35),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardDesc: {
    lineHeight: RFValue(18),
    fontFamily: FontFamily.medium,
    marginBottom: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCta: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
  },
});

export default AccountTypeCard;
