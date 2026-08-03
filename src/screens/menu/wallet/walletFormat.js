// Formatting shared across the wallet + withdrawal screens.

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

// Flat fee deducted from every withdrawal. Hardcoded until the API returns it.
export const WITHDRAWAL_FEE = 1.5;

// What actually lands in the bank account once the fee is taken.
export const netAmount = (amount) => Math.max(0, Number(amount ?? 0) - WITHDRAWAL_FEE);

export const symbolFor = (currency = 'GBP') => CURRENCY_SYMBOLS[currency] ?? '';

// Thousands-separated, always two decimals — e.g. "£3,400.00".
export const money = (amount, currency = 'GBP') =>
  `${symbolFor(currency)}${Number(amount ?? 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Balances arrive as one entry per currency. Accounts are single-currency in
// practice, so the first entry is the balance to show.
export const primaryBalance = (balances = []) => balances[0] ?? { amount: 0, currency: 'GBP' };

// Strips everything but digits and a single decimal point, capped at 2 places,
// so the amount field can be typed into freely.
export const sanitiseAmount = (text) => {
  const cleaned = String(text).replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
};

// Masks an account number down to the design's "••••9911".
export const maskAccount = (accountNumber) => {
  const digits = String(accountNumber ?? '').replace(/\D/g, '');
  return digits ? `••••${digits.slice(-4)}` : '••••';
};
