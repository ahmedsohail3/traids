import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import TimesheetScreen from '~screens/menu/timesheets/TimesheetScreen';
import TimesheetProjectScreen from '~screens/menu/timesheets/TimesheetProjectScreen';
import SubTimesheetScreen from '~screens/menu/timesheets/subcontractor/SubTimesheetScreen';

const Stack = createNativeStackNavigator();

const TimesheetStack = () => {
  const userType = useSelector(state => state.auth?.user?.type ?? 'subcontractor');
  const isSubcontractor = userType === 'subcontractor';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSubcontractor ? (
        // Subcontractor: single log-and-submit screen
        <Stack.Screen name="TimesheetRoot" component={SubTimesheetScreen} />
      ) : (
        // Company: project list → worker detail
        <>
          <Stack.Screen name="TimesheetRoot" component={TimesheetScreen} />
          <Stack.Screen name="TimesheetProject" component={TimesheetProjectScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default TimesheetStack;
