/**
 * AppNavigator
 *
 * Bottom-tab navigator for all authenticated screens.
 * Uses our custom CustomTabBar component.
 *
 * Route structure:
 *   Tabs (bottom tab navigator)
 *   SubChat — full-screen detail, registered at the wrapping NativeStack level
 *             so the tab bar is hidden when navigating to it.
 *
 * The userType ('company' | 'subcontractor') is read from the Redux auth store
 * and passed down to DashboardStack so it can render the correct dashboard.
 */
import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { View } from 'react-native';
import CustomTabBar from '~components/CustomTabBar';
import DashboardStack from './DashboardStack';
import MoreStack from './MoreStack';
import ChatStack from './ChatStack';
import MenuDrawerOverlay from '~components/Navigation/MenuDrawerOverlay';
import SubChatScreen from '~screens/chats/subcontractor/SubChatScreen';

const Tab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator();

// ─── Tab navigator (extracted so AppStack can reference it) ──────────────────
const TabNavigator = () => {
  const userType = useSelector(state => state.auth?.user?.type ?? 'subcontractor');
  const isCompany = userType === 'company';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} onMenuPress={() => setIsMenuOpen(true)} />}
        screenOptions={{ headerShown: false }}>

        {/* ── Dashboard ── */}
        <Tab.Screen name="Dashboard">
          {props => <DashboardStack {...props} userType={userType} />}
        </Tab.Screen>

        {/* ── Company-specific tabs ── */}
        {isCompany && (
          <Tab.Screen name="Subcontractors" component={PlaceholderScreen('Subcontractors')} />
        )}

        {/* ── Jobs / Job Board ── */}
        <Tab.Screen
          name={isCompany ? 'Jobs' : 'JobBoard'}
          component={PlaceholderScreen(isCompany ? 'Jobs' : 'Job Board')}
        />

        {/* ── Chats ── */}
        <Tab.Screen name="Chats" component={ChatStack} />

        {/* ── Subcontractor-specific: Bookings ── */}
        {!isCompany && (
          <Tab.Screen name="Bookings" component={PlaceholderScreen('Bookings')} />
        )}

        {/* ── More ── */}
        <Tab.Screen name="More" component={MoreStack} />
      </Tab.Navigator>

      <MenuDrawerOverlay visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
};

// ─── App-level stack: tabs + full-screen screens (no tab bar) ────────────────
const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Tabs" component={TabNavigator} />

    {/* Full-screen screens — tab bar hidden when active */}
    <AppStack.Screen
      name="SubChat"
      component={SubChatScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </AppStack.Navigator>
);

/**
 * Temporary placeholder screen component factory.
 * Replace each tab's component with the real screen when ready.
 */
const PlaceholderScreen = label => {
  const Comp = () => {
    const { View, Text } = require('react-native');
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: '#10375C', fontWeight: '600' }}>
          {label} — Coming Soon
        </Text>
      </View>
    );
  };
  Comp.displayName = `${label}Placeholder`;
  return Comp;
};

export default AppNavigator;
