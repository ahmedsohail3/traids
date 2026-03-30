import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  RegisterAccountTypeScreen,
  // Company
  BusinessDetailsScreen,
  CardDetailsScreen,
  CompanyDetailsScreen,
  VerificationScreen,
  // Subcontractor
  PersonalDetailsScreen,
  QualificationScreen,
  ProfileSetupScreen,
  PaymentSetupScreen,
  CompletionScreen,
} from '~screens/onboarding/register';

const Stack = createNativeStackNavigator();

/**
 * RegisterNavigator — flat stack covering both company and subcontractor flows.
 *   Company:       RegisterAccountType → BusinessDetails → CardDetails → CompanyDetails → Verification
 *   Subcontractor: RegisterAccountType → SubPersonalDetails → SubQualification → SubProfileSetup → SubPaymentSetup → SubCompletion
 */
const RegisterNavigator = () => (
  <Stack.Navigator
    initialRouteName="RegisterAccountType"
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

    {/* Shared entry */}
    <Stack.Screen name="RegisterAccountType" component={RegisterAccountTypeScreen} />

    {/* Company flow */}
    <Stack.Screen name="BusinessDetails"   component={BusinessDetailsScreen} />
    <Stack.Screen name="CardDetails"       component={CardDetailsScreen} />
    <Stack.Screen name="CompanyDetails"    component={CompanyDetailsScreen} />
    <Stack.Screen name="Verification"      component={VerificationScreen} />

    {/* Subcontractor flow */}
    <Stack.Screen name="SubPersonalDetails" component={PersonalDetailsScreen} />
    <Stack.Screen name="SubQualification"   component={QualificationScreen} />
    <Stack.Screen name="SubProfileSetup"    component={ProfileSetupScreen} />
    <Stack.Screen name="SubPaymentSetup"    component={PaymentSetupScreen} />
    <Stack.Screen name="SubCompletion" component={CompletionScreen}
      options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);

export default RegisterNavigator;

