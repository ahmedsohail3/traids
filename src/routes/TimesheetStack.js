import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TimesheetScreen from '~screens/menu/timesheets/TimesheetScreen';
import TimesheetProjectScreen from '~screens/menu/timesheets/TimesheetProjectScreen';

const Stack = createNativeStackNavigator();

const TimesheetStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TimesheetRoot" component={TimesheetScreen} />
    <Stack.Screen name="TimesheetProject" component={TimesheetProjectScreen} />
  </Stack.Navigator>
);

export default TimesheetStack;
