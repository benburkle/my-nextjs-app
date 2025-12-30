import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = !isWeb;

/**
 * Platform-specific value selector
 * Usage: Platform.select({ web: 'web value', default: 'mobile value' })
 */
export const platformSelect = Platform.select;



