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
import { useState } from 'react';
import { View } from 'react-native';
import useSocketConnection from '~hooks/useSocketConnection';
import RealtimeToast from '~components/Socket/RealtimeToast';

const SocketManager = () => { useSocketConnection(); return null; };
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomTabBar from '~components/CustomTabBar';
import MenuDrawerOverlay from '~components/Navigation/MenuDrawerOverlay';

// Tab screens
import SubcontractorDashboardScreen from '~screens/dashboard/subcontractor/SubcontractorDashboardScreen';
import SubChatListScreen from '~screens/chats/subcontractor/SubChatListScreen';
import SubJobBoardScreen from '~screens/jobs/subcontractor/SubJobBoardScreen';
import SubBookingsScreen from '~screens/bookings/subcontractor/SubBookingsScreen';
import MoreStack from './MoreStack';

// Full-screen screens (hide tab bar)
import SubChatScreen from '~screens/chats/subcontractor/SubChatScreen';
import SubJobDetailScreen from '~screens/jobs/subcontractor/SubJobDetailScreen';
import SubBookingDetailScreen from '~screens/bookings/subcontractor/SubBookingDetailScreen';
import { AIAssistantScreen } from '~screens/aiAssistant';

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

const JobBoardStack = createNativeStackNavigator();
const SubJobBoardStack = () => (
  <JobBoardStack.Navigator screenOptions={{ headerShown: false }}>
    <JobBoardStack.Screen name="SubJobBoardHome" component={SubJobBoardScreen} />
  </JobBoardStack.Navigator>
);

const BookingsStack = createNativeStackNavigator();
const SubBookingsStack = () => (
  <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
    <BookingsStack.Screen name="SubBookingsHome" component={SubBookingsScreen} />
  </BookingsStack.Navigator>
);

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
        <Tab.Screen name="JobBoard" component={SubJobBoardStack} />
        <Tab.Screen name="Chats" component={SubChatStack} />
        <Tab.Screen name="Bookings" component={SubBookingsStack} />
        <Tab.Screen name="More" component={MoreStack} initialParams={{ userType: 'subcontractor' }} />
      </Tab.Navigator>
      <MenuDrawerOverlay visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
};

// ─── Root stack: tabs + full-screen (no tab bar) ──────────────────────────────
const RootStack = createNativeStackNavigator();
const SubNavigator = () => (
  <View style={{ flex: 1 }}>
    <SocketManager />
    <RealtimeToast />
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="SubTabs" component={SubTabs} />
      <RootStack.Screen name="SubChat" component={SubChatScreen} options={{ animation: 'slide_from_right' }} />
      <RootStack.Screen name="SubJobDetail" component={SubJobDetailScreen} options={{ animation: 'slide_from_right' }} />
      <RootStack.Screen name="SubBookingDetail" component={SubBookingDetailScreen} options={{ animation: 'slide_from_right' }} />
      <RootStack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ animation: 'slide_from_right' }} />
    </RootStack.Navigator>
  </View>
);

export default SubNavigator;
