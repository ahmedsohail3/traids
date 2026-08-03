import {useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import {ScrollView, Text} from '~components/Common';
import Header from '~components/Header';
import {useTheme} from '~context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {RFValue} from 'react-native-responsive-fontsize';
import {FontFamily} from '~theme/fonts';
import {PoundSterling, TriangleAlert} from 'lucide-react-native';
import useSubcontractorWallet from '~hooks/useSubcontractorWallet';
import useAlert from '~hooks/useAlert';
import {
  money,
  primaryBalance,
  sanitiseAmount,
  symbolFor,
  netAmount,
  WITHDRAWAL_FEE,
} from './walletFormat';

const WithdrawAmountScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const {showAlert} = useAlert();

  const {available, pending} = useSubcontractorWallet();
  const [amount, setAmount] = useState('');

  const availableBalance = primaryBalance(available);
  const currency =
    availableBalance.currency ?? primaryBalance(pending).currency;
  const maxAmount = Number(availableBalance.amount ?? 0);

  const parsed = Number(amount);
  // Anything at or below the fee would leave the account with nothing.
  const isValid =
    amount !== '' &&
    !isNaN(parsed) &&
    parsed > WITHDRAWAL_FEE &&
    parsed <= maxAmount;

  const onProceed = () => {
    if (parsed > maxAmount) {
      showAlert({
        title: 'Amount Too High',
        message: `You can withdraw up to ${money(maxAmount, currency)}.`,
        type: 'error',
      });
      return;
    }
    if (parsed <= WITHDRAWAL_FEE) {
      showAlert({
        title: 'Amount Too Low',
        message: `Withdrawals must be more than the ${money(
          WITHDRAWAL_FEE,
          currency,
        )} processing fee.`,
        type: 'error',
      });
      return;
    }
    navigation.navigate('WithdrawConfirm', {amount: parsed, currency});
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
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        {/* Available to transfer */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Available to transfer</Text>
          <Text style={styles.infoValue}>{money(maxAmount, currency)}</Text>
        </View>

        {/* Amount input */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputHeading}>Withdraw Amount</Text>
          <View style={styles.inputBox}>
            <View style={styles.currencyBadge}>
              <PoundSterling
                size={RFValue(13)}
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            </View>
            <RNTextInput
              style={[styles.amountInput, !amount && styles.amountInputEmpty]}
              value={amount ? `${symbolFor(currency)}${amount}` : ''}
              onChangeText={text => setAmount(sanitiseAmount(text))}
              placeholder={`${symbolFor(currency)}0.00`}
              placeholderTextColor="#8A9BB0"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Processing fee notice */}
        <View style={styles.feeAlert}>
          <TriangleAlert size={RFValue(11)} color="#92400E" strokeWidth={2} />
          <Text style={styles.feeAlertText}>
            A processing fee of {money(WITHDRAWAL_FEE, currency)} will be
            applied to this withdrawal.
            {isValid
              ? ` You'll receive ${money(netAmount(parsed), currency)}.`
              : ''}
          </Text>
        </View>

        {/* Proceed */}
        <TouchableOpacity
          style={[
            styles.proceedBtn,
            styles.wideGap,
            !isValid && styles.btnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!isValid}
          onPress={onProceed}>
          <Text style={styles.proceedBtnText}>Proceed →</Text>
        </TouchableOpacity>
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

  // The design keeps each section in its own padded container, so a section
  // that follows a padded one sits 32 apart rather than the usual 16.
  wideGap: {marginTop: 16},

  // Available to transfer
  infoCard: {
    backgroundColor: '#10375C',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  infoLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#8A9BB0',
  },
  infoValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(23),
    lineHeight: RFValue(28),
    color: '#FFFFFF',
  },

  // Amount input
  inputBlock: {gap: 8, marginVertical: 10},
  inputHeading: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14.5),
    color: '#102A43',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  currencyBadge: {
    width: RFValue(29),
    height: RFValue(29),
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: RFValue(19.5),
    color: '#102A43',
    padding: 0,
    paddingTop: 2, // Aligns the text with the currency badge
  },
  amountInputEmpty: {color: '#8A9BB0'},

  // Processing fee notice
  feeAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
  },
  feeAlertText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#92400E',
    lineHeight: RFValue(14),
  },

  // Proceed
  proceedBtn: {
    backgroundColor: '#10375C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
  btnDisabled: {opacity: 0.5},
});

export default WithdrawAmountScreen;
