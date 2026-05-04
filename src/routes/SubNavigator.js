/**
 * SubNavigator
 *
 * Full navigation stack for the Subcontractor user role.
 * Contains:
 *   • Subcontractor Tab Bar (Dashboard, JobBoard, Chats, Bookings, More)
 *   • Full-screen screens registered outside tabs (no tab bar shown)
 *
 * Does NOT import or conditionally render any Company screens.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomTabBar from '~components/CustomTabBar';
import MenuDrawerOverlay from '~components/Navigation/MenuDrawerOverlay';

// Tab screens
import SubcontractorDashboardScreen from '~screens/dashboard/subcontractor/SubcontractorDashboardScreen';
import SubChatListScreen from '~screens/chats/subcontractor/SubChatListScreen';
import MoreStack from './MoreStack';

// Full-screen screens (hide tab bar)
import SubChatScreen from '~screens/chats/subcontractor/SubChatScreen';

// ─── Stack navigators for each tab ───────────────────────────────────────────

const DashboardStack = createNativeStackNavigator();
const SubDashboardStack = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="DashboardHome" component={SubcontractorDashboardScreen} />
  </DashboardStack.Navigator>
);

const ChatStack = createNativeStackNavigator();
const SubChatStack = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="SubChatList" component={SubChatListScreen} />
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
const SubTabs = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} onMenuPress={() => setIsMenuOpen(true)} />}
        screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Dashboard" component={SubDashboardStack} />
        <Tab.Screen name="JobBoard" component={PlaceholderScreen('Job Board')} />
        <Tab.Screen name="Chats" component={SubChatStack} />
        <Tab.Screen name="Bookings" component={PlaceholderScreen('Bookings')} />
        <Tab.Screen name="More" component={MoreStack} />
      </Tab.Navigator>
      <MenuDrawerOverlay visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
};

// ─── Root stack: tabs + full-screen (no tab bar) ──────────────────────────────
const RootStack = createNativeStackNavigator();
const SubNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="SubTabs" component={SubTabs} />
    <RootStack.Screen name="SubChat" component={SubChatScreen} options={{ animation: 'slide_from_right' }} />
  </RootStack.Navigator>
);

export default SubNavigator;
