import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletProvider } from '../context/WalletContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import WalletDashboard from '../screens/WalletDashboard';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <WalletProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="WalletDashboard" component={WalletDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
}

export default App;
