import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const PlaceholderScreen = label => {
  const Comp = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color: '#10375C', fontWeight: '600' }}>
        {label} — Coming Soon
      </Text>
    </View>
  );
  Comp.displayName = `${label}Placeholder`;
  return Comp;
};

import ReportsScreen from '~screens/menu/reports/ReportsScreen';
import SettingsScreen from '~screens/menu/settings/SettingsScreen';
import TimesheetStack from './TimesheetStack';
import ComplianceStack from './ComplianceStack';
import FinancialStack from './FinancialStack';
import PaymentsScreen from '~screens/menu/payments/PaymentsScreen';

const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* This MoreRoot acts as an anchor for the stack since the Drawer intercepts the tab press anyway */}
    <Stack.Screen name="MoreRoot" component={PlaceholderScreen('More Root')} />
    
    <Stack.Screen name="Timesheets" component={TimesheetStack} />
    <Stack.Screen name="Payments" component={PaymentsScreen} />
    <Stack.Screen name="Compliance" component={ComplianceStack} />
    <Stack.Screen name="Financial" component={FinancialStack} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

export default MoreStack;
