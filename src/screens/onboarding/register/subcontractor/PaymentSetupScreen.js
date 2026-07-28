import { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, StripeOnboardingModal } from '~components/Common';
import StatusListItem from '~components/Common/StatusListItem';
import InfoBox from '~components/Common/InfoBox';
import { useTheme } from '~context/ThemeContext';
import RegisterContainer from '../RegisterContainer';
import useSubcontractorSignup from '~hooks/useSubcontractorSignup';
import useAuth from '~hooks/useAuth';
import useAlert from '~hooks/useAlert';

// How the server-verified onboarding state reads on the Bank Verification row
const PAYOUT_ROW = {
  true: {
    status: 'done',
    subtitle: 'Your bank account is verified.',
  },
  false: {
    status: 'required',
    subtitle: 'Confirm your bank account & verify your identity on Stripe.',
  },
};

// ─── Account Created Banner (reuses CardDetailsScreen's pattern) ─────────────
const AccountCreatedBanner = ({ colors, firstName }) => (
  <View style={[styles.banner, { backgroundColor: '#EDFBF1', borderColor: colors.success }]}>
    <Text style={[styles.bannerIcon, { color: '#15803D' }]}>✅</Text>
    <View style={{ flex: 1 }}>
      <Text variant="sectionTitle" style={{ color: '#15803D', fontSize: RFValue(12) }}>
        Account Created!
      </Text>
      <Text style={[styles.bannerSub, { color: '#166534' }]}>
        {`Welcome${firstName ? ` ${firstName}` : ''}. One more step — connect your bank account so we can send your payments.`}
      </Text>
    </View>
  </View>
);

const PaymentSetupScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const { sessionReady, sessionLoading, sessionError } = useAuth();
  const {
    formData,
    onboardingUrl,
    onboardingLoading,
    onboardingError,
    startOnboarding,
    closeOnboarding,
    dismissOnboardingError,
    onboardingComplete,
    payoutStatusLoading,
    checkPayoutStatus,
  } = useSubcontractorSignup();

  // Surface a failed onboarding-link call — the user can retry the button
  useEffect(() => {
    if (!onboardingError) return;
    showAlert({ title: 'Bank Setup Failed', message: onboardingError, type: 'error' });
    dismissOnboardingError();
  }, [onboardingError]);

  const payoutRow = PAYOUT_ROW[onboardingComplete ? 'true' : 'false'];

  // Passed over from the signup form, which reset() has already cleared by now
  const firstName = (route?.params?.fullName ?? formData.fullName ?? '').trim().split(/\s+/)[0];

  const handleBankSetup = useCallback(() => {
    // The silent post-signup login supplies the JWT this call needs
    if (!sessionReady) {
      showAlert({
        title: sessionLoading ? 'Almost Ready' : 'Session Expired',
        message: sessionLoading
          ? 'Setting up your account — try again in a moment.'
          : (sessionError ?? 'Please log in to finish setting up your payouts.'),
        type: sessionLoading ? 'info' : 'error',
      });
      return;
    }
    startOnboarding();
  }, [sessionReady, sessionLoading, sessionError, startOnboarding, showAlert]);

  /**
   * Runs on both ways out of the WebView — Stripe's redirect and the user
   * closing it by hand. Neither proves anything, so `/auth/profile` decides:
   * only a confirmed `stripeOnboardingComplete` lets the user move on.
   */
  const resolveOnboarding = useCallback(async () => {
    closeOnboarding();

    if (await checkPayoutStatus()) {
      navigation.navigate('SubCompletion');
      return;
    }

    showAlert({
      title: 'Setup Incomplete',
      message: 'Your bank setup was not completed. Tap Continue to Bank Setup to finish it.',
      type: 'error',
    });
  }, [closeOnboarding, checkPayoutStatus, showAlert, navigation]);

  return (
    <RegisterContainer
      title="Set Up Payments"
      onBack={() => navigation.goBack()}
      currentStep={4}
      totalSteps={4}>

      <AccountCreatedBanner colors={colors} firstName={firstName} />

      {/* Status list */}
      <View style={styles.listContainer}>
        <StatusListItem
          title="Traids Account"
          subtitle="Your profile has been created."
          status="done"
        />
        <StatusListItem
          title="Stripe Account Created"
          subtitle="A business account has been set up for you."
          status="done"
        />
        <StatusListItem
          title="Bank Verification"
          subtitle={payoutRow.subtitle}
          status={payoutRow.status}
        />
      </View>

      {/* Info box */}
      <InfoBox
        title="Why do we need this?"
        body={
          'UK law requires identity verification. Verified accounts backed by Stripe — Traids never sees your bank details.'
        }
        style={styles.infoBox}
      />

      {/* CTA */}
      <Button
        title="Continue to Bank Setup →"
        onPress={handleBankSetup}
        loading={onboardingLoading || sessionLoading || payoutStatusLoading}
        style={styles.cta}
      />

      <Text
        variant="caption"
        style={[styles.note, { color: colors.textMuted }]}>
        You'll be guided through Stripe's secure onboarding, takes about 5 minutes.
      </Text>

      <StripeOnboardingModal
        url={onboardingUrl}
        onClose={resolveOnboarding}
        onComplete={resolveOnboarding}
      />
    </RegisterContainer>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  bannerIcon: {
    fontSize: RFValue(14),
    lineHeight: RFValue(18),
  },
  bannerSub: {
    fontSize: RFValue(10),
  },
  listContainer: {
    marginBottom: 20,
  },
  infoBox: {
    marginBottom: 20,
  },
  cta: {
    marginBottom: 14,
  },
  note: {
    textAlign: 'center',
    lineHeight: RFValue(16),
    paddingHorizontal: 8,
  },
});

export default PaymentSetupScreen;
