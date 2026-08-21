/**
 * PlanCard
 *
 * A single subscription plan on ChoosePlanScreen — plan name, price, icon
 * badge, description, feature list and CTA. `accentColor` tints the plan name
 * (Pro only, per the design), the CTA and the solid 6px offset shadow the card
 * sits on, which is drawn by the wrapper View behind the card.
 */
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CircleCheck, ArrowRight } from 'lucide-react-native';
import Text from './Text';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const PlanCard = ({
  name,
  price,
  icon,
  iconBgColor,
  nameColor,
  description,
  features = [],
  ctaLabel,
  accentColor,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.shadowLayer, { backgroundColor: accentColor }]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Plan identity + icon badge */}
        <View style={styles.headerRow}>
          <View style={styles.identity}>
            <Text
              variant="body"
              style={[
                styles.planName,
                { color: nameColor || colors.textPrimary },
              ]}>
              {name}
            </Text>
            <Text variant="screenTitle" style={styles.price}>
              {price}
            </Text>
          </View>
          <View style={[styles.iconBadge, { backgroundColor: iconBgColor }]}>
            <Image source={icon} style={styles.iconImage} resizeMode="contain" />
          </View>
        </View>

        <Text
          variant="body"
          style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Features */}
        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <CircleCheck
                size={RFValue(15)}
                color={colors.secondary}
                strokeWidth={2}
              />
              <Text
                variant="body"
                style={[styles.featureText, { color: colors.textSecondary }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          style={[styles.cta, { backgroundColor: accentColor }]}>
          <Text variant="button" style={styles.ctaLabel}>
            {ctaLabel}
          </Text>
          <ArrowRight size={RFValue(12)} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Solid offset shadow under the card (design: drop-shadow 0 6px 0 accent)
  shadowLayer: {
    borderRadius: 16,
    paddingBottom: 6,
  },
  card: {
    borderRadius: 16,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  identity: {
    flex: 1,
  },
  planName: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.medium,
    marginBottom: 4,
  },
  price: {
    fontSize: RFValue(22),
    fontFamily: FontFamily.bold,
  },
  iconBadge: {
    width: RFValue(38),
    height: RFValue(38),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: RFValue(20),
    height: RFValue(20),
  },
  description: {
    fontSize: RFValue(10),
    lineHeight: RFValue(15),
    marginTop: 20,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: RFValue(10),
    fontFamily: FontFamily.medium,
  },
  cta: {
    height: RFValue(42),
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontFamily: FontFamily.semiBold,
  },
});

export default PlanCard;
