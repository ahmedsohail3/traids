import {useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {ScrollView, Text} from '~components/Common';
import Header from '~components/Header';
import {useTheme} from '~context/ThemeContext';
import {useNavigation, useRoute, CommonActions} from '@react-navigation/native';
import {RFValue} from 'react-native-responsive-fontsize';
import {FontFamily} from '~theme/fonts';
import {Landmark, Check, Info} from 'lucide-react-native';
import {requestWithdrawal} from '~redux/reducers/subcontractorWalletSlice';
import useSubcontractorWallet from '~hooks/useSubcontractorWallet';
import useProfile from '~hooks/useProfile';
import useAlert from '~hooks/useAlert';
import {money, maskAccount, netAmount, WITHDRAWAL_FEE} from './walletFormat';

const WithdrawConfirmScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const {showAlert} = useAlert();
  const {amount, currency} = useRoute().params ?? {};

  // The withdraw endpoint is keyed on the subcontractor's Mongo `_id`.
  const {profile} = useProfile();
  const {bankAccount, withdrawing, withdrawalError, withdraw} =
    useSubcontractorWallet();

  useEffect(() => {
    if (withdrawalError) {
      showAlert({
        title: 'Withdrawal Failed',
        message: withdrawalError,
        type: 'error',
      });
    }
  }, [withdrawalError, showAlert]);

  const onConfirm = async () => {
    if (!profile?._id) {
      showAlert({
        title: 'Withdrawal Failed',
        message: 'We could not identify your account. Please sign in again.',
        type: 'error',
      });
      return;
    }

    // The endpoint takes the amount in GBP only — currency is echoed back.
    const action = await withdraw({id: profile._id, amount});
    if (action.type !== requestWithdrawal.fulfilled.type) return;

    // The payout is placed — drop the amount/confirm steps so back lands on Wallet.
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {name: 'Wallet'},
          {
            name: 'WithdrawSuccess',
            params: {
              amount: action.payload?.amount ?? amount,
              currency: action.payload?.currency ?? currency,
            },
          },
        ],
      }),
    );
  };

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <Header
        title="Withdraw Funds"
        subtitle="Funds will be sent to your verified bank account"
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {/* Amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>AMOUNT TO WITHDRAW</Text>
          <Text style={styles.amountValue}>{money(amount, currency)}</Text>
          <Text style={styles.amountNet}>
            −{money(WITHDRAWAL_FEE, currency)} processing fee ·{' '}
            {money(netAmount(amount), currency)} to your account
          </Text>
        </View>

        {/* Destination account */}
        <View style={styles.bankCard}>
          <View style={styles.bankLeft}>
            <View style={styles.bankIcon}>
              <Landmark size={RFValue(15)} color="#10375C" strokeWidth={2} />
            </View>
            <View style={styles.bankDetails}>
              <Text style={styles.bankName}>
                {bankAccount?.bankName ?? 'Verified bank account'}
              </Text>
              <Text style={styles.bankMeta}>
                {bankAccount?.sortCode
                  ? `Sort: ${bankAccount.sortCode} · `
                  : ''}
                Acc: {maskAccount(bankAccount?.accountNumber)}
              </Text>
            </View>
          </View>
          <Check size={RFValue(15)} color="#10B981" strokeWidth={3} />
        </View>

        {/* Timing notice */}
        <View style={styles.infoAlert}>
          <Info size={RFValue(11)} color="#1D4ED8" strokeWidth={2} />
          <Text style={styles.infoAlertText}>
            Funds typically arrive within 1–2 business days after initiating
            withdrawal.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.confirmBtn, withdrawing && styles.btnDisabled]}
            activeOpacity={0.85}
            disabled={withdrawing}
            onPress={onConfirm}>
            {withdrawing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm Withdrawal →</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.85}
            disabled={withdrawing}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
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

  // Amount
  amountBox: {
    backgroundColor: '#10375C',
    borderRadius: 16,
    padding: 20,
    gap: 4,
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  amountValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(29),
    lineHeight: RFValue(34),
    color: '#FFFFFF',
  },
  amountNet: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    lineHeight: RFValue(12),
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },

  // Destination account
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
  },
  bankLeft: {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  bankIcon: {
    width: RFValue(29),
    height: RFValue(29),
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankDetails: {gap: 2, flex: 1},
  bankName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#102A43',
  },
  bankMeta: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#8A9BB0',
  },

  // Timing notice
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  infoAlertText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#1D4ED8',
    lineHeight: RFValue(14),
  },

  // Actions
  actions: {gap: 12},
  confirmBtn: {
    backgroundColor: '#10375C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
  btnDisabled: {opacity: 0.6},
});

export default WithdrawConfirmScreen;
