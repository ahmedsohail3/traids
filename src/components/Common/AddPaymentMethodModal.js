import React, { useState, useCallback } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { X } from 'lucide-react-native';
import { CardField } from '@stripe/stripe-react-native';
import AppText from './Text';
import Button from './Button';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import useCompanyCardSetup from '~hooks/useCompanyCardSetup';

/**
 * AddPaymentMethodModal
 *
 * Bottom sheet for saving a card against the company, outside registration —
 * used when an invoice is due but no card is on file (setup was skipped or the
 * card was declined during signup).
 *
 * Confirms a SetupIntent straight from the mounted CardField, so nothing but a
 * pm_… id ever reaches our backend. 3DS, if the bank asks, is a native modal.
 *
 * Props:
 *   visible     – show/hide
 *   onClose     – dismissed without saving
 *   onSaved     – card stored successfully
 *   billingName – name attached to the card
 */
const AddPaymentMethodModal = ({ visible, onClose, onSaved, billingName }) => {
  const { colors } = useTheme();
  const { saveCard, savingCard, setupError, dismissError } = useCompanyCardSetup();

  const [cardComplete, setCardComplete] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSave = useCallback(async () => {
    if (!cardComplete) {
      setLocalError('Enter complete card details');
      return;
    }
    setLocalError(null);
    dismissError();

    if (await saveCard({ name: billingName })) onSaved?.();
  }, [cardComplete, saveCard, billingName, onSaved, dismissError]);

  const handleClose = useCallback(() => {
    setLocalError(null);
    dismissError();
    onClose?.();
  }, [dismissError, onClose]);

  const error = localError ?? setupError;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <AppText variant="sectionTitle" style={{ color: colors.textPrimary }}>
                Add Payment Method
              </AppText>
              <TouchableOpacity onPress={handleClose} hitSlop={8} activeOpacity={0.7}>
                <X size={RFValue(18)} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <AppText style={[styles.hint, { color: colors.textMuted }]}>
              Your card is stored securely by Stripe and charged when you pay an invoice.
            </AppText>

            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              onCardChange={(details) => {
                setCardComplete(details.complete);
                if (details.complete) setLocalError(null);
              }}
              cardStyle={{
                backgroundColor: colors.card ?? '#FFFFFF',
                textColor: colors.textPrimary,
                placeholderColor: colors.textMuted,
                borderColor: error ? colors.error : colors.border,
                borderWidth: 1,
                borderRadius: 8,
              }}
              style={styles.cardField}
            />

            {error ? (
              <AppText style={[styles.error, { color: colors.error }]}>{error}</AppText>
            ) : null}

            <Button
              title="Save Card"
              onPress={handleSave}
              loading={savingCard}
              style={styles.saveBtn}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hint: {
    fontSize: RFValue(9),
    fontFamily: FontFamily.regular,
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: RFValue(44),
    marginBottom: 8,
  },
  error: {
    fontSize: RFValue(9),
    fontFamily: FontFamily.regular,
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 8,
  },
});

export default AddPaymentMethodModal;
