import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FinancialScreen from '~screens/menu/financial/FinancialScreen';
import InvoiceDetailScreen from '~screens/menu/financial/InvoiceDetailScreen';

const Stack = createNativeStackNavigator();

const FinancialStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FinancialRoot" component={FinancialScreen} />
    <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
  </Stack.Navigator>
);

export default FinancialStack;
