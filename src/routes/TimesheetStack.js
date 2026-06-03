/**
 * TimesheetStack
 *
 * Accepts a `userType` prop so the correct screens are shown based on role.
 * This stack is mounted from MoreStack which is called from inside each
 * role navigator (CompanyNavigator / SubNavigator).
 *
 * userType: 'company' | 'subcontractor'  (default: 'company')
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TimesheetScreen from '~screens/menu/timesheets/TimesheetScreen';
import TimesheetProjectScreen from '~screens/menu/timesheets/TimesheetProjectScreen';
import SubTimesheetScreen from '~screens/menu/timesheets/subcontractor/SubTimesheetScreen';
import InvoiceDetailScreen from '~screens/menu/financial/InvoiceDetailScreen';

const Stack = createNativeStackNavigator();

const TimesheetStack = ({ userType = 'company' }) => {
  const isSubcontractor = userType === 'subcontractor';
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSubcontractor ? (
        <Stack.Screen name="TimesheetRoot" component={SubTimesheetScreen} />
      ) : (
        <>
          <Stack.Screen name="TimesheetRoot" component={TimesheetScreen} />
          <Stack.Screen name="TimesheetProject" component={TimesheetProjectScreen} />
          <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ animation: 'slide_from_right' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default TimesheetStack;
