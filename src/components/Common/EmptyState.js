/**
 * EmptyState — centred placeholder shown inside a SectionCard when no data exists.
 * Props: icon (Lucide), title, subtitle
 */
import { View, StyleSheet, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const EmptyState = ({ icon: IconComp, title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { borderColor: colors.border ?? '#E5E7EB' }]}>
        {IconComp && (
          <Image source={IconComp} style={styles.icon} />
        )}
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: RFValue(24),
  },
  iconWrap: {
    width: RFValue(80),
    height: RFValue(80),
    borderRadius: RFValue(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: RFValue(14),
  },  
  icon: {
    width: RFValue(80),
    height: RFValue(80),
    resizeMode: 'contain',
  },
  title: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.bold,
    marginBottom: 4,
    textAlign: 'center',
  },
  sub: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: RFValue(16),
    paddingHorizontal: RFValue(16),
  },
});

export default EmptyState;
