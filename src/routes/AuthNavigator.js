import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginAccountTypeScreen,
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
 *   LoginAccountType → Login → ResetPassword → OtpVerification → NewPassword
 *
 * 'LoginAccountType' picks which role to sign in as and passes it to Login as
 * `accountType`. Not to be confused with RegisterNavigator's 'RegisterAccountType',
 * which picks which role to sign *up* as.
 *
 * 'Register' mounts the RegisterNavigator (nested) for the full company registration flow.
 * Success modal (PasswordSuccessModal) is mounted inside NewPasswordScreen.
 */
const AuthNavigator = () => (
  <OnboardingLayout>
    <Stack.Navigator
      initialRouteName="LoginAccountType"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="LoginAccountType" component={LoginAccountTypeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="TwoStepVerification"
        component={OtpVerificationScreen}
      />
      {/* The reset token is consumed by this point, so going back would land the
          user on a dead OTP screen. Both the iOS swipe and the Android hardware
          back are blocked — see usePreventRemove inside the screen. */}
      <Stack.Screen
        name="NewPassword"
        component={NewPasswordScreen}
        options={{ gestureEnabled: false }}
      />
      {/* Register — nested navigator for the full company registration flow */}
      <Stack.Screen name="Register" component={RegisterNavigator} />
    </Stack.Navigator>
  </OnboardingLayout>
);

export default AuthNavigator;
