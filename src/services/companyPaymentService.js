import axiosInstance from '~utils/axiosInstance';

/**
 * Stripe card-setup endpoints for companies.
 *
 * The card itself is never sent here — Stripe's SDK tokenises it on-device and
 * only the resulting SetupIntent / payment method id reaches our backend.
 */

/**
 * POST /company/setup-intent
 * @returns {Promise<{ clientSecret: string }>} secret used to confirm the SetupIntent on-device
 */
export const createSetupIntentApi = () =>
  axiosInstance.post('/company/setup-intent').then((r) => r.data);

/**
 * POST /company/save-payment-method
 * Persists the payment method produced by the confirmed SetupIntent.
 */
export const savePaymentMethodApi = (paymentMethodId) =>
  axiosInstance.post('/company/save-payment-method', { paymentMethodId }).then((r) => r.data);

/**
 * GET /company/payment-method
 * @returns {Promise<{ data: { brand, last4, ... } }>} the card on file
 */
export const getCompanyPaymentMethodApi = () =>
  axiosInstance.get('/company/payment-method').then((r) => r.data);
