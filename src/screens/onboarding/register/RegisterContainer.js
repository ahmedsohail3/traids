import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Feather';
import { Text, StepProgressBar, ScrollView } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';

/**
 * RegisterContainer — shared wrapper for all company registration screens.
 *
 * Header: Traids wordmark  +  back arrow + "Company Registration"
 * Below: StepProgressBar  →  children (no card, content sits on background)
 *
 * Props:
 *   children      – screen content
 *   onBack        – callback for the back arrow
 *   currentStep   – 1-based step number (omit to hide progress bar)
 *   totalSteps    – total number of steps (default 4)
 *   scrollRef       – ref to the underlying ScrollView (see useScrollToFieldError)
 *   onContentLayout – layout callback for the content block, so callers can
 *                     translate a field's offset into a scroll position
 */
const RegisterContainer = ({
  children,
  onBack,
  currentStep,
  totalSteps = 4,
  title = 'Company Registration',
  scrollRef,
  onContentLayout,
}) => {
  const { colors, isDark } = useTheme();
  const showProgress = currentStep != null;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Top logo row */}
        <View style={styles.topRow}>
          <Image
            source={Images.traidsLogo}
            style={styles.logoBox}
            resizeMode="contain"
          />
        </View>

        {/* Back nav + title */}
        {onBack && (
          <TouchableOpacity
            style={styles.backRow}
            onPress={onBack}
            activeOpacity={0.7}>
            <Icon name="arrow-left" size={RFValue(16)} color={colors.textPrimary} />
            <Text variant="sectionTitle" style={{ color: colors.textPrimary }}>
              {title}
            </Text>
          </TouchableOpacity>
        )}

        {/* Progress bar */}
        {showProgress && (
          <StepProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            style={styles.progress}
          />
        )}

        {/* Content — directly on background, no card wrapper */}
        <View style={styles.content} onLayout={onContentLayout}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoBox: {
    width: RFValue(120),
    height: RFValue(32),
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.medium,
  },
  progress: {
    marginBottom: 16,
  },
  content: {
    paddingBottom: 32,
  },
});

export default RegisterContainer;
