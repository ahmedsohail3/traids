/**
 * Jest setup — mocks for native modules that have no JS implementation under
 * the test renderer. Anything imported here is unavailable in a node process,
 * so rendering the real <App /> tree needs each one stubbed.
 */

/* eslint-env jest */

// ── Stripe ─────────────────────────────────────────────────────────────────
// StripeProvider must still render children so the tree below it mounts.
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,
  CardField: () => null,
  useStripe: () => ({
    createPaymentMethod: jest.fn(),
    confirmSetupIntent: jest.fn(),
    handleNextAction: jest.fn(),
  }),
  useConfirmSetupIntent: () => ({ confirmSetupIntent: jest.fn(), loading: false }),
  confirmSetupIntent: jest.fn(),
  handleNextAction: jest.fn(),
  initStripe: jest.fn(),
}));

// ── Env config ─────────────────────────────────────────────────────────────
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'https://api.test.local',
  API_TIMEOUT: '60000',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_mock',
  SOCKET_URL: 'wss://api.test.local',
}));

// ── Storage ────────────────────────────────────────────────────────────────
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// ── WebView ────────────────────────────────────────────────────────────────
jest.mock('react-native-webview', () => ({ WebView: () => null }));

// ── Gesture handler / reanimated ───────────────────────────────────────────
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    gestureHandlerRootHOC: (c) => c,
    Directions: {},
    State: {},
  };
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// ── Icons ──────────────────────────────────────────────────────────────────
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// ── File pickers ───────────────────────────────────────────────────────────
jest.mock('@react-native-documents/picker', () => ({
  pick:           jest.fn(),
  keepLocalCopy:  jest.fn(),
  types:          {},
  isErrorWithCode: jest.fn(() => false),
  errorCodes:     {},
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera:       jest.fn(),
}));

// Sockets stay closed — the app opens one on auth
jest.mock('~services/socket/socketService', () => ({
  connectSocket:    jest.fn(),
  disconnectSocket: jest.fn(),
  getSocket:        jest.fn(() => null),
}));
