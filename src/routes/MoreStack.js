import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import ReportsScreen from '~screens/menu/reports/ReportsScreen';
import SettingsScreen from '~screens/menu/settings/SettingsScreen';
import TimesheetStack from './TimesheetStack';
import ComplianceStack from './ComplianceStack';
import FinancialStack from './FinancialStack';
import PaymentsScreen from '~screens/menu/payments/PaymentsScreen';
import WalletScreen from '~screens/menu/wallet/WalletScreen';
import WithdrawAmountScreen from '~screens/menu/wallet/WithdrawAmountScreen';
import WithdrawConfirmScreen from '~screens/menu/wallet/WithdrawConfirmScreen';
import WithdrawSuccessScreen from '~screens/menu/wallet/WithdrawSuccessScreen';

// Not registered yet: the subcontractor Profile screens (SubProfileScreen,
// PortfolioDetailScreen, UploadWorkScreen) and EarningsScreen. They are built
// but unreleased, so — like ChoosePlanScreen — they stay out of the navigator
// until we're ready to ship them.
const MoreStack = ({ route }) => {
  const userType = route?.params?.userType ?? 'company';
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Timesheets">
        {() => <TimesheetStack userType={userType} />}
      </Stack.Screen>
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="WithdrawAmount" component={WithdrawAmountScreen} />
      <Stack.Screen name="WithdrawConfirm" component={WithdrawConfirmScreen} />
      <Stack.Screen name="WithdrawSuccess" component={WithdrawSuccessScreen} />
      <Stack.Screen name="Compliance" component={ComplianceStack} />
      <Stack.Screen name="Financial" component={FinancialStack} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MoreStack;
