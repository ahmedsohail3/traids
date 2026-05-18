/**
 * RootNavigator
 *
 * The top-level navigator. On cold start it waits for useAppInit to finish
 * reading AsyncStorage before rendering any screens, preventing the
 * unauthenticated flash. Once ready it routes to:
 *   • AuthNavigator      — unauthenticated users
 *   • CompanyNavigator   — authenticated company users
 *   • SubNavigator       — authenticated subcontractor users
 */
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import useAppInit from '~hooks/useAppInit';
import AuthNavigator from './AuthNavigator';
import CompanyNavigator from './CompanyNavigator';
import SubNavigator from './SubNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const ready = useAppInit();
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated ?? false);
  const userType = useSelector((s) => s.auth?.user?.type ?? 'company');

  // Hold a blank splash until AsyncStorage hydration completes
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#10375C' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

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
