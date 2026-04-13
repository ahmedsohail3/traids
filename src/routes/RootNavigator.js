/**
 * RootNavigator
 *
 * The top-level navigator. Decides whether to show:
 *   • AuthNavigator  — for unauthenticated users
 *   • AppNavigator   — for authenticated users
 *
 * Auth state is read from the Redux store (state.auth.isAuthenticated).
 * The switch happens automatically when the auth state changes.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  // TODO: wire to your real auth selector
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated ?? true);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
