import { useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StripeProvider } from '@stripe/stripe-react-native';
import Config from 'react-native-config';
import { ThemeProvider } from '~context/ThemeContext';
import { store, persistor } from '~redux/store';
import RootNavigator from '~routes/RootNavigator';
import AlertProvider from './providers/AlertProvider';
import AnimatedSplash from '~components/Splash/AnimatedSplash';

// Keeps the splash's loading dots on screen a little longer than the actual
// init work, so it never flashes past too fast to read.
const MIN_SPLASH_MS = 1200;

// No urlScheme needed — card confirmation (incl. 3DS) stays in a native modal,
// and Connect onboarding runs in an in-app WebView.
const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [mountedAt] = useState(() => Date.now());

  const handleReady = useCallback(() => {
    const elapsed = Date.now() - mountedAt;
    const wait = Math.max(MIN_SPLASH_MS - elapsed, 0);
    setTimeout(() => setAppReady(true), wait);
  }, [mountedAt]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StripeProvider publishableKey={Config.STRIPE_PUBLISHABLE_KEY}>
            <ThemeProvider>
              <AlertProvider>
                <SafeAreaProvider>
                  <NavigationContainer>
                    <RootNavigator onReady={handleReady} />
                  </NavigationContainer>
                </SafeAreaProvider>
              </AlertProvider>
            </ThemeProvider>
          </StripeProvider>
        </PersistGate>
      </Provider>

      {splashVisible && (
        <AnimatedSplash
          ready={appReady}
          onAnimationEnd={() => setSplashVisible(false)}
        />
      )}
    </GestureHandlerRootView>
  );
};

export default App;

