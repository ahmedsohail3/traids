import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Feather';
import { Text, StepProgressBar, ScrollView } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

/**
 * RegisterContainer — shared wrapper for all company registration screens.
 *
 * Header: orange logo square + "Traids."  +  back arrow + "Company Registration"
 * Below: StepProgressBar  →  children (no card, content sits on background)
 *
 * Props:
 *   children      – screen content
 *   onBack        – callback for the back arrow
 *   currentStep   – 1-based step number (omit to hide progress bar)
 *   totalSteps    – total number of steps (default 4)
 */
const RegisterContainer = ({
  children,
  onBack,
  currentStep,
  totalSteps = 4,
  title = 'Company Registration',
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
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Top logo row */}
        <View style={styles.topRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.logoText, { color: '#10375C' }]}>T</Text>
          </View>
          <Text variant="screenTitle" style={{ color: colors.textPrimary }}>
            Traids.
          </Text>
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
        <View style={styles.content}>
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
    width: RFValue(28),
    height: RFValue(28),
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
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
