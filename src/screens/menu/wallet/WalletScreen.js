import {useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, RefreshControl} from 'react-native';
import {ScrollView, Text} from '~components/Common';
import Header from '~components/Header';
import {useTheme} from '~context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {RFValue} from 'react-native-responsive-fontsize';
import {FontFamily} from '~theme/fonts';
import {Lightbulb} from 'lucide-react-native';
import useSubcontractorWallet from '~hooks/useSubcontractorWallet';
import useAlert from '~hooks/useAlert';
import {money, primaryBalance} from './walletFormat';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({label, value}) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WalletScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const {showAlert} = useAlert();

  const {available, pending, loading, error, getWallet} =
    useSubcontractorWallet();

  useEffect(() => {
    getWallet();
  }, [getWallet]);

  useEffect(() => {
    if (error)
      showAlert({title: 'Unable to Load', message: error, type: 'error'});
  }, [error, showAlert]);

  const availableBalance = primaryBalance(available);
  const pendingBalance = primaryBalance(pending);
  const currency = availableBalance.currency ?? pendingBalance.currency;

  const canWithdraw = Number(availableBalance.amount ?? 0) > 0;

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <Header
        title="Wallet"
        subtitle="Financial ledger and invoice tracking"
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={getWallet}
            tintColor="#10375C"
          />
        }>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceBlock}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceValue}>
              {money(availableBalance.amount, currency)}
            </Text>
            <Text style={styles.balancePending}>
              + {money(pendingBalance.amount, currency)} pending (CIS held)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.withdrawBtn, !canWithdraw && styles.btnDisabled]}
            activeOpacity={0.85}
            disabled={!canWithdraw}
            onPress={() => navigation.navigate('WithdrawAmount')}>
            <Text style={styles.withdrawBtnText}>Withdraw Funds →</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Pending"
            value={money(pendingBalance.amount, currency)}
          />
        </View>

        {/* Manual withdrawal notice */}
        <View style={styles.warnAlert}>
          <View style={styles.warnTitleRow}>
            <Lightbulb size={RFValue(13)} color="#92400E" strokeWidth={2} />
            <Text style={styles.warnTitle}>Manual Withdrawal</Text>
          </View>
          <Text style={styles.warnBody}>
            Funds are transferred to your registered bank account within 2-3
            business days after withdrawal request.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {flex: 1},
  scrollContainer: {
    paddingBottom: 120,
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Balance card
  balanceCard: {
    backgroundColor: '#10375C',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  balanceBlock: {gap: 4},
  balanceLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#8A9BB0',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(28),
    lineHeight: RFValue(34),
    color: '#FFFFFF',
  },
  balancePending: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#8A9BB0',
  },
  withdrawBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
  btnDisabled: {opacity: 0.5},

  // Stats
  statsRow: {flexDirection: 'row', gap: 12},
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginVertical: 12,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14.5),
    color: '#10375C',
  },

  // Manual withdrawal notice
  warnAlert: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  warnTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  warnTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#92400E',
  },
  warnBody: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#92400E',
    lineHeight: RFValue(15),
  },
});

export default WalletScreen;
