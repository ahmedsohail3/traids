import { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';
import useSubcontractorWallet from '~hooks/useSubcontractorWallet';
import { money, maskAccount, netAmount, WITHDRAWAL_FEE } from './walletFormat';

// Fixed stages of a Stripe payout. The first two complete the moment the
// request lands; the rest are estimates the backend can't narrow down.
const TIMELINE = [
  { label: 'Withdrawal requested', when: 'Just now', color: '#22C55E' },
  { label: 'Stripe payout initiated', when: 'Just now', color: '#22C55E' },
  { label: 'Bank processing', when: '1–2 days', color: '#F97316' },
  { label: 'Funds in your account', when: '~2 days', color: '#E2E8F0', muted: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const TimelineItem = ({ label, when, color, muted }) => (
  <View style={styles.timelineItem}>
    <View style={[styles.timelineDot, { backgroundColor: color }]} />
    <View style={styles.timelineContent}>
      <Text style={[styles.timelineLabel, muted && styles.timelineMuted]}>{label}</Text>
      <Text style={[styles.timelineWhen, muted && styles.timelineMuted]}>{when}</Text>
    </View>
  </View>
);

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WithdrawSuccessScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { amount, currency } = useRoute().params ?? {};

  const { withdrawalResult, bankAccount, getWallet, resetWithdrawal } = useSubcontractorWallet();

  // Balances are stale the moment the payout is accepted.
  useEffect(() => { getWallet(); }, [getWallet]);

  const bankName  = withdrawalResult?.bankAccount?.bankName ?? bankAccount?.bankName;
  const accountNo = withdrawalResult?.bankAccount?.accountNumber ?? bankAccount?.accountNumber;
  const reference = withdrawalResult?.payoutId ?? withdrawalResult?.reference ?? '—';

  const onDone = () => {
    resetWithdrawal();
    navigation.navigate('Wallet');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Withdraw Funds"
        subtitle="Funds will be sent to your verified bank account"
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Success mark + heading */}
        <View style={styles.successBlock}>
          <Image source={Images.checkmarkIcon} style={styles.successIcon} />
          <Text style={styles.successTitle}>{money(amount, currency)} Withdrawn</Text>
          <Text style={styles.successBody}>
            Your money is on its way to your {bankName ?? 'bank'} account. This usually takes 1–2
            business days.
          </Text>
        </View>

        {/* Transfer timeline */}
        <View style={[styles.timelineBlock, styles.wideGap]}>
          <Text style={styles.sectionLabel}>TRANSFER TIMELINE</Text>
          <View style={styles.timelineList}>
            {TIMELINE.map((step) => (
              <TimelineItem key={step.label} {...step} />
            ))}
          </View>
        </View>

        {/* Transfer details */}
        <View style={[styles.detailsCard, styles.wideGap]}>
          <Text style={styles.sectionLabel}>TRANSFER DETAILS</Text>
          <View style={styles.detailDivider} />
          <DetailRow label="Amount" value={money(amount, currency)} />
          <View style={styles.detailDivider} />
          <DetailRow label="Processing Fee" value={`−${money(WITHDRAWAL_FEE, currency)}`} />
          <View style={styles.detailDivider} />
          <DetailRow label="You Receive" value={money(netAmount(amount), currency)} />
          <View style={styles.detailDivider} />
          <DetailRow label="To Account" value={maskAccount(accountNo)} />
          <View style={styles.detailDivider} />
          <DetailRow label="Reference" value={reference} />
        </View>

        {/* Back to wallet */}
        <TouchableOpacity
          style={[styles.backBtn, styles.wideGap]}
          activeOpacity={0.85}
          onPress={onDone}
        >
          <Text style={styles.backBtnText}>Back to Wallet</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: { paddingBottom: 120, gap: 16, paddingHorizontal: 16, paddingTop: 32 },

  // The design keeps each section in its own padded container, so a section
  // that follows a padded one sits 32 apart rather than the usual 16.
  wideGap: { marginTop: 16 },

  // Success mark + heading
  successBlock: { alignItems: 'center', gap: 8 },
  successIcon: {
    width: RFValue(68),
    height: RFValue(68),
    resizeMode: 'contain',
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(18),
    color: '#102A43',
    marginTop: 8,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#8A9BB0',
    textAlign: 'center',
    lineHeight: RFValue(16),
  },

  // Shared section label
  sectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#8A9BB0',
    letterSpacing: 0.5,
  },

  // Timeline
  timelineBlock: { gap: 12 },
  timelineList: { gap: 12 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineDot: { width: 8, height: 8, borderRadius: 4 },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#102A43',
  },
  timelineWhen: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#8A9BB0',
  },
  timelineMuted: { color: '#8A9BB0' },

  // Transfer details
  detailsCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailDivider: { height: 1, backgroundColor: '#E2E8F0' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  detailLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#8A9BB0',
  },
  detailValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#111827',
    // Payout references are long — keep them inside the card.
    flexShrink: 1,
    textAlign: 'right',
  },

  // Back to wallet
  backBtn: {
    backgroundColor: '#10375C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
});

export default WithdrawSuccessScreen;
