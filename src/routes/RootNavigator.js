/**
 * RootNavigator
 *
 * The top-level navigator. On cold start it waits for useAppInit to finish
 * reading AsyncStorage before rendering any screens, preventing the
 * unauthenticated flash — the app-level splash overlay (see App.js /
 * AnimatedSplash) covers the screen for this gap, so nothing renders here
 * until routing is actually known. Once ready it routes to:
 *   • AuthNavigator      — unauthenticated users
 *   • CompanyNavigator   — authenticated company users
 *   • SubNavigator       — authenticated subcontractor users
 */
import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import useAppInit from '~hooks/useAppInit';
import AuthNavigator from './AuthNavigator';
import CompanyNavigator from './CompanyNavigator';
import SubNavigator from './SubNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = ({ onReady }) => {
  const ready = useAppInit();
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated ?? false);
  const userType = useSelector((s) => s.auth?.user?.type ?? 'company');

  useEffect(() => {
    if (ready) onReady?.();
  }, [ready, onReady]);

  if (!ready) return null;

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
