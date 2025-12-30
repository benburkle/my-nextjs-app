import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { isWeb } from '../utils/platform';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
}

/**
 * Container that centers content and limits width on web
 * Useful for making web layouts more desktop-friendly
 */
export function ResponsiveContainer({ 
  children, 
  style, 
  maxWidth = 1200 
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();

  return (
    <View
      style={[
        styles.container,
        isWeb && width > maxWidth && { maxWidth, alignSelf: 'center' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});



