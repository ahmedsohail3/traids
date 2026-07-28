import {useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {CardField, useStripe} from '@stripe/stripe-react-native';
import {Text, Button, TextInput} from '~components/Common';
import {useTheme} from '~context/ThemeContext';
import {useSelector, useDispatch} from 'react-redux';
import RegisterContainer from '../RegisterContainer';
import {setPaymentMethod} from '~redux/reducers/companySignupSlice';
import useCompanyCardSetup from '~hooks/useCompanyCardSetup';
import useAlert from '~hooks/useAlert';

// ─── Success Banner ────────────────────────────────────────────────────────
const SuccessBanner = ({colors, companyName}) => (
  <View
    style={[
      styles.banner,
      {backgroundColor: '#EDFBF1', borderColor: colors.success},
    ]}>
    <Text style={[styles.bannerIcon, {color: '#15803D'}]}>✅</Text>
    <View style={{flex: 1}}>
      <Text
        variant="sectionTitle"
        style={{color: '#15803D', fontSize: RFValue(12)}}>
        Card Details
      </Text>
      <Text style={[styles.bannerSub, {color: '#166534'}]}>
        {`${
          companyName ? `${companyName} — a` : 'A'
        }dd the card you'll use to pay invoices.`}
      </Text>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────
const CardDetailsScreen = ({navigation, route}) => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const {showAlert} = useAlert();
  const {createPaymentMethod} = useStripe();
  const {saveCard, savingCard, setupError, dismissError} =
    useCompanyCardSetup();

  const formData = useSelector(s => s.companySignup?.formData ?? {});
  const companyName = formData.companyName ?? '';

  // Set when the user is sent back here after a card was declined at confirm
  // time — the account already exists, so this run finishes the setup outright.
  const isRetry = route?.params?.retry === true;

  const [nameOnCard, setNameOnCard] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenising, setTokenising] = useState(false);

  const billingName =
    nameOnCard.trim() ||
    formData.primaryContactName ||
    companyName ||
    undefined;

  const handleContinue = useCallback(async () => {
    if (!cardComplete) {
      setErrors({card: 'Enter complete card details'});
      return;
    }
    setErrors({});
    dismissError();
    setTokenising(true);

    // Tokenise with the publishable key alone — no account or JWT needed yet.
    // Only a pm_… id comes back; the card itself never reaches our servers.
    const {paymentMethod, error} = await createPaymentMethod({
      paymentMethodType: 'Card',
      paymentMethodData: billingName
        ? {billingDetails: {name: billingName}}
        : undefined,
    });
    setTokenising(false);

    if (error) {
      setErrors({card: error.message ?? 'This card could not be used.'});
      return;
    }

    dispatch(
      setPaymentMethod({
        id: paymentMethod.id,
        brand: paymentMethod.Card?.brand,
        last4: paymentMethod.Card?.last4,
      }),
    );

    // Normal run: the SetupIntent waits until the account exists (Verification).
    if (!isRetry) {
      navigation.navigate('CompanyDetails');
      return;
    }

    // Retry run: the company already exists and we hold a session, so the card
    // can be attached right here before finishing registration.
    const saved = await saveCard({
      paymentMethodId: paymentMethod.id,
      name: billingName,
    });
    if (!saved) return; // message surfaces via setupError below

    showAlert({
      title: 'Card Saved',
      message: 'Your card has been saved.',
      type: 'success',
    });
    navigation.navigate('Login');
  }, [
    cardComplete,
    billingName,
    createPaymentMethod,
    dispatch,
    isRetry,
    saveCard,
    navigation,
    showAlert,
    dismissError,
  ]);

  const cardError = errors.card ?? setupError;

  return (
    <RegisterContainer
      onBack={() => navigation.goBack()}
      currentStep={2}
      totalSteps={4}>
      <SuccessBanner colors={colors} companyName={companyName} />

      <Text style={[styles.label, {color: colors.textPrimary}]}>
        Card Details
      </Text>

      {/* Stripe-hosted native input — raw card data never enters our JS */}
      <CardField
        postalCodeEnabled={false}
        placeholders={{number: '4242 4242 4242 4242'}}
        onCardChange={details => {
          setCardComplete(details.complete);
          if (details.complete) setErrors({});
        }}
        cardStyle={{
          backgroundColor: colors.card ?? '#FFFFFF',
          textColor: colors.textPrimary,
          placeholderColor: colors.textMuted,
          borderColor: cardError ? colors.error : colors.border,
          borderWidth: 1,
          borderRadius: 8,
        }}
        style={styles.cardField}
      />

      {cardError ? (
        <Text style={[styles.fieldError, {color: colors.error}]}>
          {cardError}
        </Text>
      ) : null}

      <TextInput
        label="Name on Card"
        value={nameOnCard}
        onChangeText={setNameOnCard}
        placeholder={
          formData.primaryContactName || companyName || 'James Carter'
        }
        autoCapitalize="words"
      />

      {/* Bottom action row */}
      <View style={styles.actionRow}>
        <Button
          title="Cancel"
          variant="outline"
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        />
        <Button
          title={isRetry ? 'Save Card' : 'Save & Continue'}
          style={styles.continueBtn}
          onPress={handleContinue}
          loading={tokenising || savingCard}
        />
      </View>
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
  label: {
    fontSize: RFValue(11),
    marginBottom: 6,
  },
  cardField: {
    width: '100%',
    height: RFValue(44),
    marginBottom: 6,
  },
  fieldError: {
    fontSize: RFValue(9),
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {flex: 1},
  continueBtn: {flex: 2},
});

export default CardDetailsScreen;
