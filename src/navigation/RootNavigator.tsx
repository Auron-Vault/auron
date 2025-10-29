import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletProvider } from '../context/WalletContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import PinInputScreen from '../screens/PinInputScreen';
import WalletDashboard from '../screens/WalletDashboard';

export type RootStackParamList = {
  Welcome: undefined;
  PinInput: { tagId: string };
  WalletDashboard: { tagId: string; pin: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <WalletProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="PinInput" component={PinInputScreen} />
          <Stack.Screen name="WalletDashboard" component={WalletDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
}

export default App;
