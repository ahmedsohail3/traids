import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

// Arriving at the last step would otherwise read 100% with a full bar while its
// form is still unsubmitted. Figma labels that step 96%, deliberately short of
// complete, so hold the bar just below the end until the flow is actually done.
const MAX_IN_PROGRESS_PERCENT = 96;

/**
 * StepProgressBar — shows "Step X of N · YY% Complete" with a filled progress track.
 *
 * Props:
 *   currentStep  – 1-based current step number
 *   totalSteps   – total number of steps
 *   isComplete   – the flow is finished; only then may the bar reach 100%
 *   style        – optional outer style override
 */
const StepProgressBar = ({ currentStep, totalSteps, isComplete = false, style }) => {
  const { colors } = useTheme();
  const raw = Math.round((currentStep / totalSteps) * 100);
  const percent = isComplete ? 100 : Math.min(raw, MAX_IN_PROGRESS_PERCENT);
  const fillWidth = `${percent}%`;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={[styles.stepLabel, { color: colors.textPrimary }]}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={[styles.percentLabel, { color: colors.textPrimary }]}>
          {percent}% Complete
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: fillWidth, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.semiBold,
  },
  percentLabel: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.medium,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default StepProgressBar;
