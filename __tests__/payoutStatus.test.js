import { isOnboardingComplete } from '../src/utils/payoutStatus';

describe('isOnboardingComplete', () => {
  it('reads the documented flag from /auth/profile', () => {
    expect(isOnboardingComplete({ data: { stripeOnboardingComplete: true } })).toBe(true);
    expect(isOnboardingComplete({ data: { stripeOnboardingComplete: false } })).toBe(false);
  });

  it('works without the data envelope', () => {
    expect(isOnboardingComplete({ stripeOnboardingComplete: true })).toBe(true);
  });

  it('finds the flag nested one level deep', () => {
    expect(isOnboardingComplete({ data: { user: { stripeOnboardingComplete: true } } })).toBe(true);
    expect(isOnboardingComplete({ data: { stripe: { stripeOnboardingComplete: true } } })).toBe(true);
  });

  it('tolerates aliases and stringified booleans', () => {
    expect(isOnboardingComplete({ data: { stripe_onboarding_complete: true } })).toBe(true);
    expect(isOnboardingComplete({ data: { payoutsEnabled: true } })).toBe(true);
    expect(isOnboardingComplete({ data: { stripeOnboardingComplete: 'true' } })).toBe(true);
  });

  it('treats a missing or unreadable flag as not complete', () => {
    expect(isOnboardingComplete({ data: { fullName: 'Emma' } })).toBe(false);
    expect(isOnboardingComplete(null)).toBe(false);
    expect(isOnboardingComplete(undefined)).toBe(false);
    expect(isOnboardingComplete('nope')).toBe(false);
    expect(isOnboardingComplete({})).toBe(false);
  });

  it('does not treat other truthy-looking values as completion', () => {
    expect(isOnboardingComplete({ data: { stripeOnboardingComplete: 'pending' } })).toBe(false);
    expect(isOnboardingComplete({ data: { stripeOnboardingComplete: null } })).toBe(false);
  });
});
