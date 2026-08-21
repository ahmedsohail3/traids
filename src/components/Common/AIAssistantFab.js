/**
 * AIAssistantFab
 *
 * Floating action button that opens the AI Help Assistant. Sits above the
 * floating tab bar on the company dashboard: a gradient ring, a white disc and
 * the assistant's bot mark.
 */
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import GradientBackground from './GradientBackground';
import { Images } from '~assets';

const SIZE = 54;

const AIAssistantFab = ({ onPress, style }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Open AI Help Assistant"
    style={[styles.wrapper, style]}>
    <GradientBackground style={styles.ring}>
      <View style={styles.disc}>
        <Image
          source={Images.aiBotGradient}
          style={styles.bot}
          resizeMode="contain"
        />
      </View>
    </GradientBackground>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: '#10375C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  ring: {
    width: RFValue(SIZE),
    height: RFValue(SIZE),
    borderRadius: RFValue(SIZE) / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: RFValue(43),
    height: RFValue(43),
    borderRadius: RFValue(43) / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bot: {
    width: RFValue(24),
    height: RFValue(24),
  },
});

export default AIAssistantFab;
