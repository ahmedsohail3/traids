import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompanyDashboardScreen from '~screens/dashboard/company/CompanyDashboardScreen';
import SubcontractorDashboardScreen from '~screens/dashboard/subcontractor/SubcontractorDashboardScreen';
import PostJobScreen from '~screens/dashboard/company/PostJobScreen';

const Stack = createNativeStackNavigator();

/**
 * Pass `userType` prop from AppNavigator to select the correct dashboard.
 * userType: 'company' | 'subcontractor'
 */
const DashboardStack = ({ userType = 'company' }) => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen
      name="Dashboard"
      component={
        userType === 'subcontractor'
          ? SubcontractorDashboardScreen
          : CompanyDashboardScreen
      }
    />
    <Stack.Screen name="PostJob" component={PostJobScreen} />
    {/* Add more dashboard-related screens here, e.g. AllJobs, JobDetail */}
  </Stack.Navigator>
);

export default DashboardStack;

