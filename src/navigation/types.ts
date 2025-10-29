import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define all the screens in your root stack and their params
export type RootStackParamList = {
  Welcome: undefined; // No params
  PinInput: { tagId: string }; // Receives tagId from WelcomeScreen
  WalletDashboard: { tagId: string; pin: string } | undefined; // Receives tagId and PIN, or undefined for direct navigation
};

// Define the navigation prop type for screens that need it
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
