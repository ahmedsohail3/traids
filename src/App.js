import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '~context/ThemeContext';
import AuthNavigator from '~routes/AuthNavigator';
import { store, persistor } from '~redux/store';

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <AuthNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </GestureHandlerRootView>
);

export default App;
