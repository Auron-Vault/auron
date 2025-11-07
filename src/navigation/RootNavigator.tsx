import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WalletProvider } from '../context/WalletContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import PinInputScreen from '../screens/PinInputScreen';
import WalletDashboard from '../screens/WalletDashboard';
import AssetDetailScreen from '../screens/AssetDetailScreen';
import TapToPayWalletScreen from '../screens/TapToPayWalletScreen';
import { RootStackParamList } from './types';
import { startTiming, endTiming } from '../utils/performanceMonitor';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WalletProvider>
        <NavigationContainer
          onStateChange={state => {
            if (state) {
              const currentRoute = state.routes[state.index];
              console.log(`[Navigation] Current screen: ${currentRoute.name}`);
            }
          }}
          onReady={() => {
            console.log('[Navigation] Navigation container ready');
          }}
        >
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              listeners={{
                focus: () => startTiming('Screen - Welcome'),
                blur: () => endTiming('Screen - Welcome'),
              }}
            />
            <Stack.Screen
              name="PinInput"
              component={PinInputScreen}
              listeners={{
                focus: () => startTiming('Screen - PinInput'),
                blur: () => endTiming('Screen - PinInput'),
              }}
            />
            <Stack.Screen
              name="WalletDashboard"
              component={WalletDashboard}
              listeners={{
                focus: () => startTiming('Screen - WalletDashboard'),
                blur: () => endTiming('Screen - WalletDashboard'),
              }}
            />
            <Stack.Screen
              name="AssetDetail"
              component={AssetDetailScreen}
              listeners={{
                focus: () => startTiming('Screen - AssetDetail'),
                blur: () => endTiming('Screen - AssetDetail'),
              }}
            />
            <Stack.Screen
              name="TapToPayWallet"
              component={TapToPayWalletScreen}
              listeners={{
                focus: () => startTiming('Screen - TapToPayWallet'),
                blur: () => endTiming('Screen - TapToPayWallet'),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </GestureHandlerRootView>
  );
}

export default App;
