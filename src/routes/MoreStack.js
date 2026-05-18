import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import ReportsScreen from '~screens/menu/reports/ReportsScreen';
import SettingsScreen from '~screens/menu/settings/SettingsScreen';
import TimesheetStack from './TimesheetStack';
import ComplianceStack from './ComplianceStack';
import FinancialStack from './FinancialStack';
import PaymentsScreen from '~screens/menu/payments/PaymentsScreen';

const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    
    <Stack.Screen name="Timesheets" component={TimesheetStack} />
    <Stack.Screen name="Payments" component={PaymentsScreen} />
    <Stack.Screen name="Compliance" component={ComplianceStack} />
    <Stack.Screen name="Financial" component={FinancialStack} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

export default MoreStack;
