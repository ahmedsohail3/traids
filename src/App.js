import React from 'react';
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

// No urlScheme needed — card confirmation (incl. 3DS) stays in a native modal,
// and Connect onboarding runs in an in-app WebView.
const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StripeProvider publishableKey={Config.STRIPE_PUBLISHABLE_KEY}>
          <ThemeProvider>
            <AlertProvider>
              <SafeAreaProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </SafeAreaProvider>
            </AlertProvider>
          </ThemeProvider>
        </StripeProvider>
      </PersistGate>
    </Provider>
  </GestureHandlerRootView>
);

export default App;

