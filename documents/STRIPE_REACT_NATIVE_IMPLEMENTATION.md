# Stripe Integration — React Native Implementation Guide

This document maps the existing web (React + `@stripe/react-stripe-js`) Stripe integration to an
equivalent React Native implementation, so mobile can reuse the same backend **with zero API or
backend changes**. It covers the three Stripe flows currently live on web:

1. **Company card setup** (SetupIntent + save card for future off-session charges)
2. **Invoice payment** (server-driven off-session charge against the saved card)
3. **Subcontractor payout onboarding** (Stripe Connect Express hosted onboarding)

No deep linking is used anywhere in this plan — card flows are handled by Stripe's native
in-app modal, and Connect onboarding is handled by a plain in-app `WebView` modal that watches
for the same `stripeReturn=true` URL the backend already redirects to for web.

---

## 1. Reference: current web implementation

| Flow | Web file(s) | Backend endpoint | Stripe primitive |
|---|---|---|---|
| Card setup (company) | `src/pages/register/CompanyRegister.jsx` | `POST company/setup-intent`, `POST company/save-payment-method` | `SetupIntent` + `confirmCardSetup` |
| Pay invoice (company) | `src/pages/dashboard/company/financial/FInancial.jsx`, `src/features/company/invoices/invoicesApi.js` | `GET company/payment-method`, `POST invoices/:id/pay` | Off-session `PaymentIntent` (server confirms with saved `payment_method`) |
| Subcontractor payout setup | `src/pages/register/SubcontractorRegister.jsx` | `POST subcontractor/onboarding-link` | Stripe Connect **Express** hosted onboarding (redirect URL, currently a web route + `?stripeReturn=true`) |
| Auth wrapper | `src/features/auth/authApis.js` | — | RTK Query hooks: `useGetSetupIntentMutation`, `useSavePaymentMethodMutation`, `useGetOnboardingLinkMutation` |

Key detail: the web app never sends raw card data to your backend — the card is tokenized
client-side by Stripe.js and only a `payment_method`/`setupIntent` id is sent to the API. The RN
implementation must preserve this (PCI scope stays with Stripe, not your servers).

---

## 2. SDK choice for React Native

Use the official **`@stripe/stripe-react-native`** SDK (maintained by Stripe). It is the
direct RN equivalent of `@stripe/react-stripe-js` and supports SetupIntents, PaymentIntents,
and native in-app 3D Secure — all without any deep link/URL scheme configuration, since card-only
flows never leave the app.

```bash
npm install @stripe/stripe-react-native
# Bare RN also needs:
npx pod-install   # iOS
```

### Native project setup

**iOS**
- Minimum iOS deployment target 13.0+
- Run `pod install` after adding the package

**Android**
- `minSdkVersion 21`+

**App entry point** — wrap the app once, at the root. No `urlScheme` prop is needed, since this
plan never leaves the app for a card confirmation — 3D Secure challenges render as a native modal
that Stripe manages internally:

```jsx
// App.jsx
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey={process.env.STRIPE_PUBLISHABLE_KEY /* pk_test_/pk_live_ */}>
      <RestOfApp />
    </StripeProvider>
  );
}
```

If Expo-managed: use `expo-dev-client` (this SDK requires native code, so **Expo Go will not
work** — a custom dev client or bare workflow is required).

---

## 3. Flow A — Company card setup (SetupIntent)

Reuses the exact same two endpoints as web. No backend change needed.

```
1. RN app  -> POST company/setup-intent           => { clientSecret }
2. RN app  -> Stripe SDK confirms the SetupIntent using CardField input
3. RN app  -> POST company/save-payment-method     => { paymentMethodId }
```

### API contract (unchanged from web)

```
POST /company/setup-intent
Headers: Authorization: Bearer <jwt>
Response: { clientSecret: string }

POST /company/save-payment-method
Headers: Authorization: Bearer <jwt>
Body:    { paymentMethodId: string }
Response: { success: boolean }
```

### RN implementation

```jsx
import { CardField, useConfirmSetupIntent } from '@stripe/stripe-react-native';
import { useState } from 'react';
import { useGetSetupIntentMutation, useSavePaymentMethodMutation } from '../features/auth/authApis';

function CompanyCardSetupScreen() {
  const [getSetupIntent] = useGetSetupIntentMutation();
  const [savePaymentMethod] = useSavePaymentMethodMutation();
  const { confirmSetupIntent, loading } = useConfirmSetupIntent();
  const [cardComplete, setCardComplete] = useState(false);

  const handleSaveCard = async (billingName) => {
    try {
      // 1. Ask backend for a SetupIntent client secret
      const { clientSecret } = await getSetupIntent().unwrap();

      // 2. Confirm it on-device — card data never touches your backend.
      //    Any 3DS challenge is shown as a native in-app modal by the SDK,
      //    no browser/deep link involved.
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: { name: billingName },
        },
      });

      if (error) throw new Error(error.message);

      // 3. Persist the resulting payment method id
      await savePaymentMethod({ paymentMethodId: setupIntent.paymentMethodId }).unwrap();
    } catch (err) {
      // surface err.message to the user (toast / inline error)
    }
  };

  return (
    <>
      <CardField
        postalCodeEnabled={true}
        placeholders={{ number: '4242 4242 4242 4242' }}
        onCardChange={(details) => setCardComplete(details.complete)}
        style={{ width: '100%', height: 50, marginVertical: 16 }}
      />
      <Button title="Save Card" disabled={!cardComplete || loading} onPress={() => handleSaveCard('Company Name')} />
    </>
  );
}
```

`CardField` is the RN equivalent of the web `CardElement` — it's a native, PCI-compliant input
that Stripe renders; raw PAN data never enters your JS bundle or backend.

---

## 4. Flow B — Pay invoice (off-session charge)

This flow is **entirely server-driven** on web (a single `POST invoices/:id/pay` call — the
backend confirms the PaymentIntent off-session using the saved card). RN mirrors this exactly;
the only addition is handling the rare case where the bank requires additional authentication
(SCA) even for an off-session charge, via `handleNextAction` — which, like SetupIntent 3DS, is a
native in-app modal, not a browser redirect.

### API contract (unchanged from web)

```
GET  /company/payment-method
Headers: Authorization: Bearer <jwt>
Response: { data: { brand, last4, ... } }

POST /invoices/:invoiceId/pay
Headers: Authorization: Bearer <jwt>
Response: { paymentIntentId: string, status: 'succeeded' | 'requires_action' | ... }
```

### RN implementation

```jsx
import { handleNextAction } from '@stripe/stripe-react-native';
import { usePayInvoiceMutation, useGetCompanyPaymentMethodQuery } from '../features/company/invoices/invoicesApi';

function InvoicePayButton({ invoice }) {
  const { data: paymentMethodResponse } = useGetCompanyPaymentMethodQuery();
  const [payInvoice, { isLoading }] = usePayInvoiceMutation();

  const handlePayNow = async () => {
    try {
      const result = await payInvoice(invoice._id).unwrap();

      // If the issuing bank requires 3DS even off-session, Stripe returns
      // requires_action — resolve it in-app (native modal) before treating as paid.
      if (result.status === 'requires_action') {
        const { paymentIntent, error } = await handleNextAction(result.clientSecret);
        if (error) throw new Error(error.message);
      }

      // show success state
    } catch (err) {
      // surface err.message
    }
  };

  return <Button title={`Pay £${invoice.totalAmount.toFixed(2)}`} disabled={isLoading} onPress={handlePayNow} />;
}
```

Note: this requires the backend's `pay` response to include a `clientSecret` when
`status === 'requires_action'`. Confirm with backend team whether that field is already returned
(web currently just reads `paymentIntentId` and assumes success — if 3DS-required invoices are
possible, backend should be extended to return the `clientSecret` too, for both web and RN). This
is the one place a backend addition may be needed, and it's additive/optional (existing web
behavior is untouched).

---

## 5. Flow C — Subcontractor payout onboarding (Stripe Connect Express) — no deep linking

Web redirects the whole page to Stripe's hosted onboarding URL and Stripe redirects back to a web
route with `?stripeReturn=true`. On RN, instead of registering a custom URL scheme and asking the
backend for an app-specific return URL, render the **exact same onboarding URL** (with its
existing web `return_url`) inside an in-app `WebView` modal, and detect the return by watching
the WebView's navigation state for that same `stripeReturn=true` marker. The backend's
`subcontractor/onboarding-link` endpoint and its `return_url`/`refresh_url` need no changes at
all — RN just intercepts the redirect before the WebView actually loads your web app's page.

### API contract (unchanged from web)

```
POST /subcontractor/onboarding-link
Headers: Authorization: Bearer <jwt>
Response: { url: string }  // Stripe-hosted Connect onboarding URL, return_url already points at the web route
```

### RN implementation

Use `react-native-webview` (no browser/InAppBrowser package, no URL scheme registration):

```jsx
import { useState } from 'react';
import { Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useGetOnboardingLinkMutation } from '../features/auth/authApis';

function useSubcontractorOnboarding() {
  const [getOnboardingLink, { isLoading }] = useGetOnboardingLinkMutation();
  const [onboardingUrl, setOnboardingUrl] = useState(null);

  const startOnboarding = async () => {
    const { url } = await getOnboardingLink().unwrap();
    setOnboardingUrl(url);
  };

  return { startOnboarding, isLoading, onboardingUrl, setOnboardingUrl };
}

function StripeOnboardingModal({ url, onClose, onComplete }) {
  return (
    <Modal visible={!!url} animationType="slide" onRequestClose={onClose}>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={(navState) => {
          // Backend's return_url already contains this marker for the web app —
          // catching it here means no app-specific return URL is ever needed.
          if (navState.url.includes('stripeReturn=true')) {
            onClose();
            onComplete();
          }
        }}
      />
    </Modal>
  );
}
```

Usage — identical outcome to web's Step 5 jump on `SubcontractorRegister.jsx`:

```jsx
const { startOnboarding, onboardingUrl, setOnboardingUrl } = useSubcontractorOnboarding();

<StripeOnboardingModal
  url={onboardingUrl}
  onClose={() => setOnboardingUrl(null)}
  onComplete={() => setCurrentStep(5)} // same as web's stripeReturn=true handling
/>
```

This keeps onboarding fully in-app (a modal sheet, not a system browser tab), requires no deep
link registration, and needs no backend change — it just reuses the web `return_url` as a
detectable marker instead of routing through a native URL scheme.

---

## 6. Summary — packages to add

| Package | Purpose |
|---|---|
| `@stripe/stripe-react-native` | Card input, SetupIntent/PaymentIntent confirmation, native in-app 3DS |
| `react-native-webview` | In-app modal for Connect onboarding, no deep linking |

No backend/API changes are required for Flows A and C. Flow B may need one additive field
(`clientSecret` on `requires_action` responses) if 3DS-on-off-session is a real scenario for this
Stripe account — otherwise no changes there either.

## 7. Environment variables

```
STRIPE_PUBLISHABLE_KEY=pk_test_...   # same key family as VITE_STRIPE_PUBLISHABLE_KEY on web
```

Keep test/live keys per-environment exactly as done on web (`pk_test_` in dev/staging,
`pk_live_` in production builds).
