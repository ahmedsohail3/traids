import { View, StyleSheet, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Info } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

/**
 * InfoBox — a soft blue/muted info callout box with an icon and text.
 *
 * Props:
 *   title – optional bold heading
 *   body  – main description text (supports a string or a link-styled string)
 *   style – optional outer style override
 */
const InfoBox = ({ title, body, style }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: colors.primaryLight || '#EFF6FF',
          borderColor: colors.primary,
        },
        style,
      ]}>
      <Info
        size={RFValue(14)}
        color={colors.primary}
        strokeWidth={2}
        style={styles.icon}
      />
      <View style={styles.textBlock}>
        {title ? (
          <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
        ) : null}
        {body ? (
          <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  icon: {
    marginTop: 1,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.semiBold,
    marginBottom: 2,
  },
  body: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    lineHeight: RFValue(15),
  },
});

export default InfoBox;
