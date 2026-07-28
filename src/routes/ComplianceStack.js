import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ComplianceScreen from '~screens/menu/compliance/ComplianceScreen';
import ComplianceProjectScreen from '~screens/menu/compliance/ComplianceProjectScreen';

const Stack = createNativeStackNavigator();

const ComplianceStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ComplianceRoot" component={ComplianceScreen} />
    <Stack.Screen name="ComplianceProject" component={ComplianceProjectScreen} />
  </Stack.Navigator>
);

export default ComplianceStack;
