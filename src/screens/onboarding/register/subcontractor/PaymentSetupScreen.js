import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button } from '~components/Common';
import StatusListItem from '~components/Common/StatusListItem';
import InfoBox from '~components/Common/InfoBox';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

// ─── Account Created Banner (reuses CardDetailsScreen's pattern) ─────────────
const AccountCreatedBanner = ({ colors }) => (
  <View style={[styles.banner, { backgroundColor: '#EDFBF1', borderColor: colors.success }]}>
    <Text style={[styles.bannerIcon, { color: '#15803D' }]}>✅</Text>
    <View style={{ flex: 1 }}>
      <Text variant="sectionTitle" style={{ color: '#15803D', fontSize: RFValue(12) }}>
        Account Created!
      </Text>
      <Text style={[styles.bannerSub, { color: '#166534' }]}>
        Welcome Emma. One more step — connect your bank account so we can send your payments.
      </Text>
    </View>
  </View>
);

const PaymentSetupScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleBankSetup = useCallback(() => {
    setLoading(true);
    // TODO: open Stripe onboarding / bank verification
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SubCompletion');
    }, 800);
  }, [navigation]);

  return (
    <RegisterContainer
      title="Set Up Payments"
      onBack={() => navigation.goBack()}
      currentStep={4}
      totalSteps={4}>

      <AccountCreatedBanner colors={colors} />

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
          subtitle="Confirm your bank account & verify your identity on Stripe."
          status="required"
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
        loading={loading}
        style={styles.cta}
      />

      <Text
        variant="caption"
        style={[styles.note, { color: colors.textMuted }]}>
        You'll be guided through Stripe's secure onboarding, takes about 5 minutes.
      </Text>
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
