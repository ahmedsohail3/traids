import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

// ─── Success Banner ────────────────────────────────────────────────────────
const SuccessBanner = ({ colors }) => (
  <View style={[styles.banner, { backgroundColor: '#EDFBF1', borderColor: colors.success }]}>
    <Text style={[styles.bannerIcon, { color: '#15803D' }]}>✅</Text>
    <View style={{ flex: 1 }}>
      <Text variant='sectionTitle' style={{ color: '#15803D', fontSize: RFValue(12) }}>Account Created</Text>
      <Text style={[styles.bannerSub, { color: '#166534' }]}>
        Welcome James! Now add your card to pay invoices.
      </Text>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────
const CardDetailsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const formatCardNumber = useCallback(text => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join('  ');
  }, []);

  const formatExpiry = useCallback(text => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  }, []);

  const validate = useCallback(() => {
    const e = {};
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 16) e.cardNumber = 'Enter a valid 16-digit card number';
    if (expiry.length < 5) e.expiry = 'Enter a valid expiry date';
    if (!cvc.trim() || cvc.length < 3) e.cvc = 'Enter a valid CVC';
    if (!nameOnCard.trim()) e.nameOnCard = 'Name on card is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [cardNumber, expiry, cvc, nameOnCard]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('CompanyDetails');
    }, 500);
  }, [validate, navigation]);

  return (
    <RegisterContainer
      onBack={() => navigation.goBack()}
      currentStep={2}
      totalSteps={4}>

      <SuccessBanner colors={colors} />

      <TextInput
        label="Card Number"
        value={cardNumber}
        onChangeText={v => {
          setCardNumber(formatCardNumber(v));
          setErrors(p => ({ ...p, cardNumber: '' }));
        }}
        placeholder="4242  4242  4242  4242"
        keyboardType="number-pad"
        maxLength={22}
        error={errors.cardNumber}
      />

      <TextInput
        label="Expiry Date"
        value={expiry}
        onChangeText={v => {
          setExpiry(formatExpiry(v));
          setErrors(p => ({ ...p, expiry: '' }));
        }}
        placeholder="12/26"
        keyboardType="number-pad"
        maxLength={5}
        error={errors.expiry}
      />

      <TextInput
        label="CVC"
        value={cvc}
        onChangeText={v => { setCvc(v.replace(/\D/g, '').slice(0, 4)); setErrors(p => ({ ...p, cvc: '' })); }}
        placeholder="123"
        keyboardType="number-pad"
        maxLength={4}
        error={errors.cvc}
      />

      <TextInput
        label="Name on Card"
        value={nameOnCard}
        onChangeText={v => { setNameOnCard(v); setErrors(p => ({ ...p, nameOnCard: '' })); }}
        placeholder="James Carter"
        autoCapitalize="words"
        error={errors.nameOnCard}
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
          title="Save & Continue"
          style={styles.continueBtn}
          onPress={handleContinue}
          loading={loading}
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: { flex: 1 },
  continueBtn: { flex: 2 },
});

export default CardDetailsScreen;
