// Centralized color theme for the app
export const colors = {
  // Primary purple theme
  primary: {
    main: '#8B5CF6', // Purple 500
    light: '#A78BFA', // Purple 400
    dark: '#7C3AED', // Purple 600
    // Transparent variants for backgrounds and borders
    bg10: 'rgba(139, 92, 246, 0.1)',
    bg15: 'rgba(139, 92, 246, 0.15)',
    bg20: 'rgba(139, 92, 246, 0.2)',
    bg50: 'rgba(139, 92, 246, 0.5)',
    bg80: 'rgba(139, 92, 246, 0.8)',
    border30: 'rgba(139, 92, 246, 0.3)',
    border50: 'rgba(139, 92, 246, 0.5)',
  },

  // Secondary accent color (golden/yellow for buttons)
  secondary: {
    main: '#E7BE7F', // Golden/tan color
    dark: '#D4A959',
  },

  // Background colors
  background: {
    primary: '#000000', // Pure black
    card: '#1F1F1F', // Dark gray
    elevated: '#2D2D2D', // Elevated card
    // Gray transparent variants
    gray800: 'rgba(31, 41, 55, 1)', // Tailwind gray-800
    gray800_50: 'rgba(31, 41, 55, 0.5)',
    gray800_30: 'rgba(31, 41, 55, 0.3)',
    gray900_50: 'rgba(17, 24, 39, 0.5)',
  },

  // Border colors
  border: {
    primary: '#374151', // Gray-700
    light: '#4B5563', // Gray-600
    purple: 'rgba(139, 92, 246, 0.3)',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF', // Gray-400
    tertiary: '#6B7280', // Gray-500
    purple: '#A78BFA', // Purple-400
    purpleLight: '#C4B5FD', // Purple-300
  },

  // Status colors
  status: {
    success: '#10B981', // Green-500
    error: '#EF4444', // Red-500
    warning: '#F59E0B', // Amber-500
    info: '#3B82F6', // Blue-500
  },

  // Transaction colors
  transaction: {
    sent: '#F87171', // Red-400
    received: '#34D399', // Green-400
  },

  // Warning/Alert colors
  warning: {
    bg: 'rgba(251, 146, 60, 0.05)',
    border: 'rgba(251, 146, 60, 0.2)',
    text: '#FED7AA', // Orange-200
    textDim: 'rgba(254, 215, 170, 0.7)',
    title: '#FDBA74', // Orange-300
  },

  // Overlay
  overlay: {
    black70: 'rgba(0, 0, 0, 0.7)',
    black40: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

export type Colors = typeof colors;
