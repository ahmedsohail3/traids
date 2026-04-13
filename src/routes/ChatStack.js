import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import SubChatListScreen from '~screens/chats/subcontractor/SubChatListScreen';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
  const userType = useSelector(state => state.auth?.user?.type ?? 'subcontractor');
  const isSubcontractor = userType === 'subcontractor';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSubcontractor ? (
        // Subcontractor: list only — chat detail is in RootNavigator (hides tab bar)
        <Stack.Screen name="SubChatList" component={SubChatListScreen} />
      ) : (
        // Company chat list — to be added
        <Stack.Screen name="SubChatList" component={SubChatListScreen} />
      )}
    </Stack.Navigator>
  );
};

export default ChatStack;
