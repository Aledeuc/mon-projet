export const lightColors = {
  // Base
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F0F0F0',
  
  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Brand
  primary: '#0066CC',
  primaryDark: '#004C99',
  primaryLight: '#E6F0FF',

  // Status
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Surface
  card: '#FFFFFF',
  cardBorder: '#E5E5E5',
  
  // Aviation specific
  outbound: '#0066CC',
  outboundLight: '#E6F0FF',
  return: '#DC3545',
  returnLight: '#FFF5F5',
  
  // Misc
  divider: '#E5E5E5',
  icon: '#666666',
  iconLight: '#999999',
  highlight: '#E6F0FF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkColors = {
  // Base
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#BBBBBB',
  textTertiary: '#888888',
  textInverse: '#1A1A1A',
  
  // Brand
  primary: '#4D94FF',
  primaryDark: '#0066CC',
  primaryLight: '#1A3D66',

  // Status
  success: '#5CB85C',
  warning: '#FFD54F',
  error: '#FF6B6B',
  info: '#4DD0E1',
  
  // Surface
  card: '#252525',
  cardBorder: '#3A3A3A',
  
  // Aviation specific
  outbound: '#4D94FF',
  outboundLight: '#1A3D66',
  return: '#FF6B6B',
  returnLight: '#661A1A',
  
  // Misc
  divider: '#3A3A3A',
  icon: '#BBBBBB',
  iconLight: '#888888',
  highlight: '#1A3D66',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export type ColorTheme = typeof lightColors;
