import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define all the screens in your root stack and their params
export type RootStackParamList = {
  Welcome: undefined; // No params
  WalletDashboard: undefined; // No params
};

// Define the navigation prop type for screens that need it
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
