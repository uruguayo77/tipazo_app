export const colors = {
  primary: '#cdff07', // Bright yellow/green
  primaryLight: '#e4ff6a',
  primaryDark: '#a6cc00',
  secondary: '#10B981',
  secondaryLight: '#6EE7B7',
  secondaryDark: '#059669',
  background: '#69c5f8', // Light blue background
  card: '#FFFFFF',
  text: '#1F2937',
  textLight: '#FFFFFF', // White for better contrast on blue background
  textDark: '#000000', // Black for button text
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    tabIconDefault: colors.gray[400],
    tabIconSelected: colors.primary,
    card: colors.card,
    border: colors.border,
  },
};