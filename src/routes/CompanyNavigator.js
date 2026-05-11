/**
 * CompanyNavigator
 *
 * Full navigation stack for the Company user role.
 * Contains:
 *   • Company Tab Bar (Dashboard, Subcontractors, Jobs, Chats, More)
 *   • Full-screen screens registered outside tabs (no tab bar shown)
 *
 * Does NOT import or conditionally render any Subcontractor screens.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomTabBar from '~components/CustomTabBar';
import MenuDrawerOverlay from '~components/Navigation/MenuDrawerOverlay';

// Tab screens
import CompanyDashboardScreen from '~screens/dashboard/company/CompanyDashboardScreen';
import PostJobScreen from '~screens/dashboard/company/PostJobScreen';
import CompanyJobsScreen from '~screens/jobs/company/CompanyJobsScreen';
import CompanyChatListScreen from '~screens/chats/company/CompanyChatListScreen';
import MoreStack from './MoreStack';
import SubcontractorListScreen from '~screens/subcontractors/company/SubcontractorListScreen';
import SubcontractorProfileScreen from '~screens/subcontractors/company/SubcontractorProfileScreen';

// Full-screen screens (hide tab bar)
import CompanyChatScreen from '~screens/chats/company/CompanyChatScreen';
import CompanyJobDetailScreen from '~screens/jobs/company/CompanyJobDetailScreen';

// ─── Stack navigators for each tab ───────────────────────────────────────────

const DashboardStack = createNativeStackNavigator();
const CompanyDashboardStack = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="DashboardHome" component={CompanyDashboardScreen} />
    <DashboardStack.Screen name="PostJob" component={PostJobScreen} options={{ animation: 'slide_from_right' }} />
  </DashboardStack.Navigator>
);

const JobsStack = createNativeStackNavigator();
const CompanyJobsStack = () => (
  <JobsStack.Navigator screenOptions={{ headerShown: false }}>
    <JobsStack.Screen name="CompanyJobsList" component={CompanyJobsScreen} />
  </JobsStack.Navigator>
);

const SubsStack = createNativeStackNavigator();
const CompanySubcontractorsStack = () => (
  <SubsStack.Navigator screenOptions={{ headerShown: false }}>
    <SubsStack.Screen name="SubcontractorList" component={SubcontractorListScreen} />
  </SubsStack.Navigator>
);

const ChatStack = createNativeStackNavigator();
const CompanyChatStack = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="CompanyChatList" component={CompanyChatListScreen} />
  </ChatStack.Navigator>
);

const PlaceholderScreen = (label) => {
  const Comp = () => {
    const { View: V, Text: T } = require('react-native');
    return (
      <V style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ fontSize: 18, color: '#10375C', fontWeight: '600' }}>{label} — Coming Soon</T>
      </V>
    );
  };
  Comp.displayName = `${label}Placeholder`;
  return Comp;
};

// ─── Tab Navigator ────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const CompanyTabs = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} onMenuPress={() => setIsMenuOpen(true)} />}
        screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Dashboard" component={CompanyDashboardStack} />
        <Tab.Screen name="Subcontractors" component={CompanySubcontractorsStack} />
        <Tab.Screen name="Jobs" component={CompanyJobsStack} />
        <Tab.Screen name="Chats" component={CompanyChatStack} />
        <Tab.Screen name="More" component={MoreStack} />
      </Tab.Navigator>
      <MenuDrawerOverlay visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
};

// ─── Root stack: tabs + full-screen (no tab bar) ──────────────────────────────
const RootStack = createNativeStackNavigator();
const CompanyNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="CompanyTabs" component={CompanyTabs} />
    <RootStack.Screen name="CompanyChat" component={CompanyChatScreen} options={{ animation: 'slide_from_right' }} />
    <RootStack.Screen name="CompanyJobDetail" component={CompanyJobDetailScreen} options={{ animation: 'slide_from_right' }} />
    <RootStack.Screen name="SubcontractorProfile" component={SubcontractorProfileScreen} options={{ animation: 'slide_from_right' }} />
  </RootStack.Navigator>
);

export default CompanyNavigator;
