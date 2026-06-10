import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '~context/ThemeContext';
import { store, persistor } from '~redux/store';
import RootNavigator from '~routes/RootNavigator';
import AlertProvider from './providers/AlertProvider';

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AlertProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </SafeAreaProvider>
          </AlertProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </GestureHandlerRootView>
);

export default App;

