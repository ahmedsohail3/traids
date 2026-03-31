/**
 * DashboardStack
 *
 * Stack navigator for the Dashboard tab.
 * Currently contains the dashboard screen only;
 * future screens (PostJob, JobDetail, AllJobs…) should be added here.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompanyDashboardScreen from '~screens/dashboard/company/CompanyDashboardScreen';
import SubcontractorDashboardScreen from '~screens/dashboard/subcontractor/SubcontractorDashboardScreen';

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
    {/* Add more dashboard-related screens here, e.g. PostJob, AllJobs */}
  </Stack.Navigator>
);

export default DashboardStack;
