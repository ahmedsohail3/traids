import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useConfirmSetupIntent } from '@stripe/stripe-react-native';
import {
  fetchSetupIntent,
  savePaymentMethod,
  fetchPaymentMethod,
  setSetupError,
  clearSetupError,
  resetCardSetup,
} from '~redux/reducers/companyPaymentSlice';

/**
 * useCompanyCardSetup
 *
 * Drives the three-step Stripe card setup for companies:
 *   1. POST company/setup-intent          → clientSecret
 *   2. confirmSetupIntent on-device       → paymentMethodId  (card never hits our API)
 *   3. POST company/save-payment-method   → card stored for off-session invoice charges
 *
 * Any 3D Secure challenge is handled by the SDK as a native in-app modal.
 *
 * Exposed API:
 *   savingCard    — true for the whole save attempt (all three steps)
 *   cardSaved     — true once the card is stored
 *   setupError    — message from any of the three steps, or null
 *   saveCard      — ({ name }) → Promise<boolean>
 *   paymentMethod — the saved card on file ({ brand, last4, … })
 *   getPaymentMethod / dismissError / reset
 */
const useCompanyCardSetup = () => {
  const dispatch = useDispatch();
  const {
    savingCard,
    cardSaved,
    setupError,
    paymentMethod,
    loadingPaymentMethod,
    paymentMethodError,
  } = useSelector((s) => s.companyPayment);

  const { confirmSetupIntent } = useConfirmSetupIntent();

  const saveCard = useCallback(async ({ name } = {}) => {
    try {
      const clientSecret = await dispatch(fetchSetupIntent()).unwrap();

      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: name ? { billingDetails: { name } } : undefined,
      });

      // SDK-level failure (declined card, failed 3DS, …) — report it into the slice
      if (error) {
        dispatch(setSetupError(error.message ?? 'Could not confirm your card.'));
        return false;
      }

      await dispatch(savePaymentMethod(setupIntent.paymentMethodId)).unwrap();
      return true;
    } catch {
      return false;   // thunk failures already sit in setupError
    }
  }, [dispatch, confirmSetupIntent]);

  const getPaymentMethod = useCallback(() => dispatch(fetchPaymentMethod()), [dispatch]);
  const dismissError     = useCallback(() => dispatch(clearSetupError()), [dispatch]);
  const reset            = useCallback(() => dispatch(resetCardSetup()), [dispatch]);

  return {
    savingCard,
    cardSaved,
    setupError,
    saveCard,
    paymentMethod,
    loadingPaymentMethod,
    paymentMethodError,
    getPaymentMethod,
    dismissError,
    reset,
  };
};

export default useCompanyCardSetup;
