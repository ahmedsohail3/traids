/**
 * RootNavigator
 *
 * The top-level navigator. Routes to:
 *   • AuthNavigator      — for unauthenticated users
 *   • CompanyNavigator   — for authenticated company users
 *   • SubNavigator       — for authenticated subcontractor users
 *
 * Role is read from `state.auth.user.type`.
 * To switch roles during development, use the DevRoleSwitcher component.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import CompanyNavigator from './CompanyNavigator';
import SubNavigator from './SubNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated ?? true);
  const userType = useSelector(state => state.auth?.user?.type ?? 'company');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : userType === 'subcontractor' ? (
        <Stack.Screen name="SubApp" component={SubNavigator} />
      ) : (
        <Stack.Screen name="CompanyApp" component={CompanyNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
