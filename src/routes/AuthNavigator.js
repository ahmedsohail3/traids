import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AccountTypeScreen,
  LoginScreen,
  ResetPasswordScreen,
  OtpVerificationScreen,
  NewPasswordScreen,
} from '~screens/onboarding/login';
import RegisterNavigator from './RegisterNavigator';
import OnboardingLayout from '~containers/layouts/OnboardingLayout';

const Stack = createNativeStackNavigator();

/**
 * AuthNavigator — handles the full authentication/onboarding flow:
 *   AccountType → Login → ResetPassword → OtpVerification → NewPassword
 *
 * 'Register' mounts the RegisterNavigator (nested) for the full company registration flow.
 * Success modal (PasswordSuccessModal) is mounted inside NewPasswordScreen.
 */
const AuthNavigator = () => (
  <OnboardingLayout>
    <Stack.Navigator
      initialRouteName="AccountType"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AccountType" component={AccountTypeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="TwoStepVerification"
        component={OtpVerificationScreen}
      />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      {/* Register — nested navigator for the full company registration flow */}
      <Stack.Screen name="Register" component={RegisterNavigator} />
    </Stack.Navigator>
  </OnboardingLayout>
);

export default AuthNavigator;
