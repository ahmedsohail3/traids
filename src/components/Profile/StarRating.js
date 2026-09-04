/**
 * StarRating — five stars filled to `value`, with the number beside them.
 *
 * Half stars are not drawn: lucide has no half-star glyph and the design never
 * shows one, so a 4.5 fills four. The numeric label carries the precision.
 *
 * Props:
 *   value       number   0–5
 *   size        number   star size in px (pre-RFValue)
 *   showValue   boolean  render the numeric label
 *   valuePlacement 'before' | 'after'
 *   valueColor  string
 */
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Star } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const GOLD = '#F2A154';
const EMPTY = '#E2E8F0';

const StarRating = ({
  value = 0,
  size = 12,
  showValue = true,
  valuePlacement = 'before',
  valueColor = '#545454',
}) => {
  const filled = Math.round(Number(value) || 0);

  const label = showValue ? (
    <Text style={[styles.value, { color: valueColor }]}>
      {(Number(value) || 0).toFixed(1)}
    </Text>
  ) : null;

  return (
    <View style={styles.row}>
      {valuePlacement === 'before' && label}
      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={RFValue(size)}
            color={i < filled ? GOLD : EMPTY}
            fill={i < filled ? GOLD : EMPTY}
            strokeWidth={0}
          />
        ))}
      </View>
      {valuePlacement === 'after' && label}
    </View>
  );
};

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  value: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },
});

export default StarRating;
